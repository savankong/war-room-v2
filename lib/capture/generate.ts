/**
 * Capture brief generation — engineering spec §6.
 *
 * "Triggered when a match scores Strong, a user opens a Fair match, or a user
 *  saves an opportunity. Cache by (user_company_id, opportunity_id,
 *  prompt_version). Never regenerate on page load."
 *
 * The cache is the unique index on capture_briefs, so acceptance criterion 6
 * ("opening the same brief twice makes one LLM call") holds even when two
 * requests race: the second insert conflicts and reads the winner's row.
 */
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import type postgres from 'postgres';
import { buildBriefContext, type BriefContext } from './context';
import { buildFallbackBrief } from './fallback';
import { PROMPT_VERSION, SYSTEM_PROMPT, buildUserPrompt, buildRetryPrompt } from './prompt';
import { BriefSchema, validateBrief, type BriefOutput, type ValidationFailure } from './schema';

type Sql = ReturnType<typeof postgres>;

/**
 * Overridable so a cost experiment does not need a code change, but the
 * default is the most capable model: a brief that names the wrong contracting
 * officer costs more than the tokens saved.
 */
const MODEL = process.env.CAPTURE_BRIEF_MODEL ?? 'claude-opus-5';

export interface StoredBrief {
  id: string;
  userCompanyId: string;
  opportunityId: string;
  recommendation: BriefOutput['recommendation'];
  summary: string | null;
  whyItMatters: string[];
  fitRationale: string[];
  recommendationRationale: string[];
  nextAction: string | null;
  incumbentContractId: string | null;
  incumbentEvidence: string[];
  recompeteConfidence: 'high' | 'medium' | 'low' | null;
  recompeteEvidence: string[];
  people: Array<{ person_id: string; why: string; suggested_action: string; name?: string; title?: string | null }>;
  model: string | null;
  promptVersion: string;
  generator: 'llm' | 'template';
  generatedAt: Date;
}

interface BriefRow {
  id: string;
  user_company_id: string;
  opportunity_id: string;
  recommendation: BriefOutput['recommendation'];
  summary: string | null;
  why_it_matters: string[];
  fit_rationale: string[];
  recommendation_rationale: string[];
  next_action: string | null;
  incumbent_contract_id: string | null;
  incumbent_evidence: string[];
  recompete_confidence: 'high' | 'medium' | 'low' | null;
  recompete_evidence: string[];
  people: StoredBrief['people'];
  model: string | null;
  prompt_version: string;
  generator: 'llm' | 'template';
  generated_at: Date;
}

function toStored(row: BriefRow): StoredBrief {
  return {
    id: row.id,
    userCompanyId: row.user_company_id,
    opportunityId: row.opportunity_id,
    recommendation: row.recommendation,
    summary: row.summary,
    whyItMatters: row.why_it_matters ?? [],
    fitRationale: row.fit_rationale ?? [],
    recommendationRationale: row.recommendation_rationale ?? [],
    nextAction: row.next_action,
    incumbentContractId: row.incumbent_contract_id,
    incumbentEvidence: row.incumbent_evidence ?? [],
    recompeteConfidence: row.recompete_confidence,
    recompeteEvidence: row.recompete_evidence ?? [],
    people: row.people ?? [],
    model: row.model,
    promptVersion: row.prompt_version,
    generator: row.generator,
    generatedAt: row.generated_at,
  };
}

export async function getCachedBrief(
  sql: Sql,
  userCompanyId: string,
  opportunityId: string,
): Promise<StoredBrief | null> {
  const [row] = await sql<BriefRow[]>`
    SELECT * FROM capture_briefs
    WHERE user_company_id = ${userCompanyId}
      AND opportunity_id = ${opportunityId}
      AND prompt_version = ${PROMPT_VERSION}
  `;
  return row ? toStored(row) : null;
}

interface LlmAttempt {
  brief: BriefOutput;
  failures: ValidationFailure[];
  inputTokens: number;
  outputTokens: number;
}

async function callModel(
  client: Anthropic,
  context: BriefContext,
  candidatePersonIds: Set<string>,
  retryFor: ValidationFailure[] | null,
  priorBrief: BriefOutput | null,
): Promise<LlmAttempt | null> {
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: buildUserPrompt(context) },
  ];

  if (retryFor && priorBrief) {
    messages.push({ role: 'assistant', content: JSON.stringify(priorBrief) });
    messages.push({ role: 'user', content: buildRetryPrompt(retryFor) });
  }

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    // Judgement work — which of five recommendations, and which people
    // actually matter — so let the model think about it.
    thinking: { type: 'adaptive' },
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        // Stable across every brief, so it is read from cache rather than
        // re-billed. Everything volatile is in the user message after it.
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages,
    output_config: { format: zodOutputFormat(BriefSchema) },
  });

  // parsed_output is null when the response could not be parsed into the
  // schema. Treated as a failed attempt, same as a validation failure.
  const brief = response.parsed_output;
  if (!brief) return null;

  return {
    brief,
    failures: validateBrief(brief, {
      candidatePersonIds,
      hasIncumbent: context.incumbent.found,
      incumbentRecipient: context.incumbent.recipient,
    }),
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}

export interface GenerateOptions {
  /** Regenerate even when a cached brief exists at this prompt version. */
  force?: boolean;
  now?: Date;
  /** Injected in tests so the suite never calls the API. */
  client?: Anthropic;
}

export interface GenerateResult {
  brief: StoredBrief;
  /** True when the cached row was returned without an API call. */
  fromCache: boolean;
}

export async function generateCaptureBrief(
  sql: Sql,
  userCompanyId: string,
  opportunityId: string,
  options: GenerateOptions = {},
): Promise<GenerateResult> {
  if (!options.force) {
    const cached = await getCachedBrief(sql, userCompanyId, opportunityId);
    if (cached) return { brief: cached, fromCache: true };
  }

  const built = await buildBriefContext(sql, { userCompanyId, opportunityId, now: options.now });
  if (!built) {
    throw new Error(`Cannot build brief context for company=${userCompanyId} opportunity=${opportunityId}`);
  }

  const { context, incumbentRecord, candidates } = built;
  const candidatePersonIds = new Set(candidates.map((c) => c.personId));

  let brief: BriefOutput;
  let generator: 'llm' | 'template' = 'llm';
  let model: string | null = MODEL;
  let inputTokens: number | null = null;
  let outputTokens: number | null = null;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const client = options.client ?? (apiKey ? new Anthropic() : null);

  if (!client) {
    // No key configured: the deterministic brief is the product, not an error
    // page. This is also the path the §12 manual-briefing phase runs on.
    brief = buildFallbackBrief(context);
    generator = 'template';
    model = null;
  } else {
    try {
      let attempt = await callModel(client, context, candidatePersonIds, null, null);

      // §6: reject and retry once on schema violation.
      if (!attempt || attempt.failures.length) {
        const retry = await callModel(
          client,
          context,
          candidatePersonIds,
          attempt?.failures ?? [{ rule: 'unparseable', detail: 'the response did not match the schema' }],
          attempt?.brief ?? null,
        );
        if (retry && !retry.failures.length) {
          attempt = retry;
        } else {
          // §6: then fall back to a deterministic template brief.
          console.warn(
            `Capture brief fell back to template for ${userCompanyId}/${opportunityId}: ` +
              (retry?.failures.map((f) => f.rule).join(', ') ?? 'unparseable response'),
          );
          attempt = null;
        }
      }

      if (attempt) {
        brief = attempt.brief;
        inputTokens = attempt.inputTokens;
        outputTokens = attempt.outputTokens;
      } else {
        brief = buildFallbackBrief(context);
        generator = 'template';
      }
    } catch (err) {
      // An API outage must not take the brief page down with it.
      if (err instanceof Anthropic.APIError) {
        console.error(`Anthropic API error ${err.status} generating brief: ${err.message}`);
      } else {
        console.error(`Unexpected error generating brief: ${(err as Error).message}`);
      }
      brief = buildFallbackBrief(context);
      generator = 'template';
    }
  }

  // Attach names to the people the brief chose, so rendering never needs a
  // second lookup and a stale contacts row cannot blank a brief.
  const byId = new Map(candidates.map((c) => [c.personId, c]));
  const people = brief.people
    .filter((p) => byId.has(p.person_id))
    .map((p) => {
      const person = byId.get(p.person_id)!;
      return { ...p, name: person.name, title: person.title };
    });

  const [row] = await sql<BriefRow[]>`
    INSERT INTO capture_briefs (
      user_company_id, opportunity_id, recommendation, summary, why_it_matters,
      fit_rationale, recommendation_rationale, next_action, incumbent_contract_id,
      incumbent_evidence, recompete_confidence, recompete_evidence, people,
      model, prompt_version, generator, input_tokens, output_tokens
    ) VALUES (
      ${userCompanyId}, ${opportunityId}, ${brief.recommendation}, ${brief.summary},
      ${sql.json(brief.why_it_matters)}, ${sql.json(context.fit.evidence)},
      ${sql.json(brief.recommendation_rationale)}, ${brief.next_action},
      ${incumbentRecord?.contractId ?? null}, ${sql.json(context.incumbent.evidence)},
      ${context.recompete.confidence}, ${sql.json(context.recompete.evidence)},
      ${sql.json(people)}, ${model}, ${PROMPT_VERSION}, ${generator},
      ${inputTokens}, ${outputTokens}
    )
    ON CONFLICT (user_company_id, opportunity_id, prompt_version) DO UPDATE SET
      recommendation           = EXCLUDED.recommendation,
      summary                  = EXCLUDED.summary,
      why_it_matters           = EXCLUDED.why_it_matters,
      fit_rationale            = EXCLUDED.fit_rationale,
      recommendation_rationale = EXCLUDED.recommendation_rationale,
      next_action              = EXCLUDED.next_action,
      incumbent_contract_id    = EXCLUDED.incumbent_contract_id,
      incumbent_evidence       = EXCLUDED.incumbent_evidence,
      recompete_confidence     = EXCLUDED.recompete_confidence,
      recompete_evidence       = EXCLUDED.recompete_evidence,
      people                   = EXCLUDED.people,
      model                    = EXCLUDED.model,
      generator                = EXCLUDED.generator,
      input_tokens             = EXCLUDED.input_tokens,
      output_tokens            = EXCLUDED.output_tokens,
      generated_at             = now()
    RETURNING *
  `;

  return { brief: toStored(row), fromCache: false };
}

/**
 * The `generate-briefs` job (§8): every Strong match without a current brief.
 * Fair matches generate on open instead, so a customer who never looks at one
 * costs nothing.
 */
export async function listBriefsToGenerate(
  sql: Sql,
  limit = 200,
): Promise<Array<{ userCompanyId: string; opportunityId: string }>> {
  const rows = await sql<{ user_company_id: string; opportunity_id: string }[]>`
    SELECT m.user_company_id, m.opportunity_id
    FROM matches m
    JOIN user_companies c ON c.id = m.user_company_id
    LEFT JOIN capture_briefs b
      ON b.user_company_id = m.user_company_id
     AND b.opportunity_id = m.opportunity_id
     AND b.prompt_version = ${PROMPT_VERSION}
    WHERE m.fit = 'strong'
      AND m.dismissed_at IS NULL
      AND c.status = 'active'
      AND c.plan IN ('trial', 'capture')
      AND b.id IS NULL
    ORDER BY m.score DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({ userCompanyId: r.user_company_id, opportunityId: r.opportunity_id }));
}

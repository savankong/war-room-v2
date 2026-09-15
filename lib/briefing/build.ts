/**
 * Briefing payload builder — engineering spec §9, product spec §7.
 *
 * "Never more than three opportunities. If there are nine Strong matches, send
 *  three and say so. Volume is the failure mode, because volume is exactly
 *  what the customer already has and cannot process."
 *
 * The cap is enforced here and again by a CHECK constraint on
 * briefings.opportunity_count, because "fewer, better" is the product and a
 * regression that quietly sends twelve would look like a feature.
 */
import type postgres from 'postgres';
import { formatUsd } from '../capture/incumbent';
import { signalsForCompany } from '../signals/detect';
import { PROMPT_VERSION } from '../capture/prompt';

type Sql = ReturnType<typeof postgres>;

/** §9: "Hard cap at three opportunities." */
export const MAX_OPPORTUNITIES = 3;
/** §9: "Two people you should know." */
export const MAX_PEOPLE = 2;
/** §9: "Market signals, maximum four lines." */
export const MAX_SIGNALS = 4;

export interface BriefingOpportunity {
  opportunityId: string;
  title: string;
  org: string | null;
  noticeType: string | null;
  estimatedValue: number | null;
  responseDeadline: string | null;
  fit: 'strong' | 'fair';
  /** §7.2: "top two evidence lines". */
  evidence: string[];
  nextAction: string | null;
  incumbent: string | null;
  briefUrl: string;
}

export interface BriefingRecompete {
  contractTitle: string;
  org: string | null;
  incumbent: string | null;
  endDate: string | null;
  totalObligation: number | null;
  why: string;
}

export interface BriefingPerson {
  personId: string;
  name: string;
  title: string | null;
  org: string | null;
  why: string;
}

export interface BriefingSignal {
  type: string;
  line: string;
}

export interface BriefingPayload {
  companyName: string;
  periodStart: string;
  periodEnd: string;
  opportunities: BriefingOpportunity[];
  /** How many Strong/Fair matches existed, so the email can say "and 6 more". */
  totalAvailable: number;
  recompete: BriefingRecompete | null;
  people: BriefingPerson[];
  signals: BriefingSignal[];
}

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'https://warroomusa.com').replace(/\/$/, '');
}

function toDateString(value: Date | string | null): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

/**
 * The opportunities for this briefing: undismissed Strong and Fair matches
 * not already sent in an earlier briefing, best first.
 *
 * Excluding already-sent opportunities is what makes a three-item cap
 * tolerable — without it the same top match would head every briefing forever
 * and the customer would stop opening them.
 */
async function selectOpportunities(
  sql: Sql,
  userCompanyId: string,
): Promise<{ chosen: BriefingOpportunity[]; totalAvailable: number }> {
  const rows = await sql<
    {
      opportunity_id: string;
      title: string;
      org_label: string | null;
      notice_type: string | null;
      estimated_value: string | null;
      response_deadline: Date | null;
      fit: 'strong' | 'fair';
      evidence: Array<{ line: string }>;
      next_action: string | null;
      incumbent_recipient: string | null;
    }[]
  >`
    SELECT m.opportunity_id, o.title, o.notice_type, o.estimated_value, o.response_deadline,
           m.fit, m.evidence, b.next_action,
           COALESCE(org.abbreviation, org.full_name, o.office_name) AS org_label,
           inc.recipient AS incumbent_recipient
    FROM matches m
    JOIN opportunities o ON o.id = m.opportunity_id
    LEFT JOIN orgs org ON org.id = o.canonical_org_id
    LEFT JOIN capture_briefs b
      ON b.user_company_id = m.user_company_id
     AND b.opportunity_id = m.opportunity_id
     AND b.prompt_version = ${PROMPT_VERSION}
    LEFT JOIN contracts inc ON inc.id = b.incumbent_contract_id
    WHERE m.user_company_id = ${userCompanyId}
      AND m.fit IN ('strong', 'fair')
      AND m.dismissed_at IS NULL
      AND (o.response_deadline IS NULL OR o.response_deadline >= now())
      -- Never repeat an opportunity across briefings.
      AND NOT EXISTS (
        SELECT 1 FROM briefings br
        WHERE br.user_company_id = m.user_company_id
          AND br.sent_at IS NOT NULL
          AND br.payload -> 'opportunities' @> jsonb_build_array(
                jsonb_build_object('opportunityId', m.opportunity_id))
      )
      -- Nor one the customer has already told us about.
      AND NOT EXISTS (
        SELECT 1 FROM feedback f
        WHERE f.user_company_id = m.user_company_id
          AND f.opportunity_id = m.opportunity_id
          AND f.verdict IN ('not_relevant', 'passed', 'already_knew', 'wrong_capability')
      )
    ORDER BY m.score DESC, o.response_deadline ASC NULLS LAST
  `;

  const base = appUrl();
  const all = rows.map((r) => ({
    opportunityId: r.opportunity_id,
    title: r.title,
    org: r.org_label,
    noticeType: r.notice_type,
    estimatedValue: r.estimated_value === null ? null : Number(r.estimated_value),
    responseDeadline: toDateString(r.response_deadline),
    fit: r.fit,
    // §7.2 shows the top two evidence lines; score() already sorted them
    // strongest first.
    evidence: (r.evidence ?? []).slice(0, 2).map((e) => e.line),
    nextAction: r.next_action,
    incumbent: r.incumbent_recipient,
    briefUrl: `${base}/brief/${r.opportunity_id}`,
  }));

  return { chosen: all.slice(0, MAX_OPPORTUNITIES), totalAvailable: all.length };
}

/** §9: "One recompete to start positioning for, if any." */
async function selectRecompete(
  sql: Sql,
  userCompanyId: string,
): Promise<BriefingRecompete | null> {
  const [row] = await sql<
    {
      title: string;
      recipient: string | null;
      end_date: Date | null;
      total_obligation: string | null;
      org_label: string | null;
    }[]
  >`
    WITH profile AS (
      SELECT target_org_ids, naics_codes FROM company_profiles WHERE user_company_id = ${userCompanyId}
    ),
    lineage AS (
      SELECT o.id FROM orgs o, profile p WHERE o.id = ANY(p.target_org_ids)
      UNION
      SELECT o.id FROM orgs o, profile p WHERE o.parent_id = ANY(p.target_org_ids)
    )
    SELECT c.title, c.recipient, c.end_date, c.total_obligation,
           COALESCE(org.abbreviation, org.full_name) AS org_label
    FROM signals s
    JOIN contracts c ON c.id = s.subject_id
    LEFT JOIN orgs org ON org.id = s.canonical_org_id
    WHERE s.type = 'contract_expiring'
      AND s.subject_type = 'contract'
      AND (
        s.canonical_org_id IN (SELECT id FROM lineage)
        -- unnest, not = ANY(SELECT naics_codes ...): that subquery yields one
        -- text[] value and Postgres then compares text to text[].
        OR c.naics_code IN (SELECT unnest(naics_codes) FROM profile)
      )
      AND c.end_date >= current_date
      AND c.end_date <= current_date + interval '18 months'
    -- Biggest contract expiring soonest: the one most worth a week.
    ORDER BY c.total_obligation DESC NULLS LAST, c.end_date ASC
    LIMIT 1
  `;

  if (!row) return null;

  const endDate = toDateString(row.end_date);
  return {
    contractTitle: row.title,
    org: row.org_label,
    incumbent: row.recipient,
    endDate,
    totalObligation: row.total_obligation === null ? null : Number(row.total_obligation),
    why: endDate
      ? `Expires ${endDate}. Positioning for a recompete starts 12 to 18 months out, which is now.`
      : 'Expiring inside the positioning window.',
  };
}

/**
 * §9: "Two people you should know." Drawn from the briefs in this briefing so
 * the names connect to something the customer just read, rather than arriving
 * as an unexplained list.
 */
async function selectPeople(
  sql: Sql,
  userCompanyId: string,
  opportunityIds: string[],
): Promise<BriefingPerson[]> {
  if (!opportunityIds.length) return [];

  const rows = await sql<{ people: Array<{ person_id: string; why: string }> }[]>`
    SELECT people FROM capture_briefs
    WHERE user_company_id = ${userCompanyId}
      AND opportunity_id = ANY(${opportunityIds})
      AND prompt_version = ${PROMPT_VERSION}
  `;

  const seen = new Set<string>();
  const ordered: Array<{ person_id: string; why: string }> = [];
  for (const row of rows) {
    for (const person of row.people ?? []) {
      if (seen.has(person.person_id)) continue;
      seen.add(person.person_id);
      ordered.push(person);
    }
  }
  if (!ordered.length) return [];

  const contacts = await sql<
    { id: string; name: string; title: string | null; org_label: string | null }[]
  >`
    SELECT c.id, c.name, c.title, COALESCE(o.abbreviation, o.full_name, c.org_full) AS org_label
    FROM contacts c
    LEFT JOIN orgs o ON o.id = COALESCE(c.canonical_org_id, c.org_id)
    WHERE c.id = ANY(${ordered.map((p) => p.person_id)})
  `;
  const byId = new Map(contacts.map((c) => [c.id, c]));

  return ordered
    .filter((p) => byId.has(p.person_id))
    .slice(0, MAX_PEOPLE)
    .map((p) => {
      const contact = byId.get(p.person_id)!;
      return {
        personId: p.person_id,
        name: contact.name,
        title: contact.title,
        org: contact.org_label,
        why: p.why,
      };
    });
}

function signalLine(signal: {
  type: string;
  payload: Record<string, unknown>;
  orgLabel: string | null;
}): string {
  const org = signal.orgLabel ?? 'DoD';
  const title = String(signal.payload.title ?? 'Unnamed');
  const recipient = signal.payload.recipient ? String(signal.payload.recipient) : null;
  const value = signal.payload.total_obligation ?? signal.payload.award_amt;
  const amount = value !== null && value !== undefined ? formatUsd(Number(value)) : null;

  switch (signal.type) {
    case 'contract_expiring': {
      const end = signal.payload.end_date ? String(signal.payload.end_date).slice(0, 10) : 'soon';
      return `${org}: ${title}${recipient ? ` (${recipient})` : ''} expires ${end}${amount ? `, ${amount}` : ''}`;
    }
    case 'new_award':
      return `${org}: ${recipient ?? 'A vendor'} won ${title}${amount ? ` at ${amount}` : ''}`;
    case 'sources_sought':
      return `${org}: new Sources Sought — ${title}`;
    case 'new_notice':
      return `${org}: new notice — ${title}`;
    default:
      return `${org}: ${title}`;
  }
}

export interface BuildBriefingInput {
  userCompanyId: string;
  periodStart: Date;
  periodEnd: Date;
}

export async function buildBriefing(
  sql: Sql,
  input: BuildBriefingInput,
): Promise<BriefingPayload | null> {
  const [company] = await sql<{ name: string }[]>`
    SELECT name FROM user_companies WHERE id = ${input.userCompanyId}
  `;
  if (!company) return null;

  const { chosen, totalAvailable } = await selectOpportunities(sql, input.userCompanyId);
  const [recompete, rawSignals] = await Promise.all([
    selectRecompete(sql, input.userCompanyId),
    // Over-fetch so deduplication below still fills the four lines §9 allows.
    signalsForCompany(sql, input.userCompanyId, { since: input.periodStart, limit: MAX_SIGNALS * 4 }),
  ]);

  // Two signals can render to the same sentence — the same requirement
  // re-posted under a new notice id, or an award that is also an expiry. A
  // repeated line is worse than a missing one when the cap is four.
  const seenLines = new Set<string>();
  const signals: BriefingSignal[] = [];
  for (const signal of rawSignals) {
    const line = signalLine(signal);
    if (seenLines.has(line)) continue;
    seenLines.add(line);
    signals.push({ type: signal.type, line });
    if (signals.length >= MAX_SIGNALS) break;
  }

  const people = await selectPeople(
    sql,
    input.userCompanyId,
    chosen.map((o) => o.opportunityId),
  );

  return {
    companyName: company.name,
    periodStart: input.periodStart.toISOString().slice(0, 10),
    periodEnd: input.periodEnd.toISOString().slice(0, 10),
    opportunities: chosen,
    totalAvailable,
    recompete,
    people,
    signals,
  };
}

/** True when there is nothing worth an email. Sending "nothing this week" teaches people to ignore us. */
export function isEmpty(payload: BriefingPayload): boolean {
  return (
    payload.opportunities.length === 0 &&
    payload.recompete === null &&
    payload.signals.length === 0
  );
}

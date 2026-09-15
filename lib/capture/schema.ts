/**
 * Capture brief output schema — engineering spec §6.
 *
 * The model returns JSON only, in exactly this shape. The schema is enforced
 * two ways:
 *
 *  1. Structurally, by the API: the schema is handed to the Messages API as a
 *     structured output format, so a shape violation is prevented rather than
 *     caught.
 *  2. Semantically, by validateBrief() below. The rules §6 actually cares
 *     about — no invented people, no invented contract values, no percentages
 *     — cannot be expressed in JSON Schema and have to be checked against the
 *     supplied context after the fact.
 */
import { z } from 'zod';

export const RECOMMENDATIONS = ['pursue', 'position_now', 'monitor', 'partner', 'pass'] as const;

export const BriefPersonSchema = z.object({
  person_id: z.string().describe('Must be one of the person_id values supplied in the candidate list.'),
  why: z.string().describe('One sentence on why this person matters for this pursuit.'),
  suggested_action: z.string().describe('A specific next step with this person.'),
});

export const BriefSchema = z.object({
  summary: z.string().describe('Two or three sentences describing the opportunity in plain English.'),
  why_it_matters: z.array(z.string()).describe('Why this is worth this specific company\'s time.'),
  recommendation: z.enum(RECOMMENDATIONS),
  recommendation_rationale: z.array(z.string()).describe('Why this recommendation and not another.'),
  people: z.array(BriefPersonSchema).describe('At most five, all from the supplied candidate list.'),
  next_action: z.string().describe('The single most useful thing to do next, with a deadline where one exists.'),
});

export type BriefOutput = z.infer<typeof BriefSchema>;
export type BriefPerson = z.infer<typeof BriefPersonSchema>;

export interface ValidationFailure {
  rule: string;
  detail: string;
}

/** §6 caps people at five. */
export const MAX_PEOPLE = 5;

/**
 * Anything that reads as a numeric probability. Product spec §8 rule 2: "No
 * numeric probabilities anywhere in the UI", and §7: "'Win probability 73.4%'
 * is fake precision and the customer will catch it the first time it's wrong."
 *
 * Deliberately narrow: it matches a number followed by a percent sign or the
 * word percent, not every digit. A brief naming a real contract value or a
 * real NAICS code must pass.
 */
const PERCENTAGE = /\b\d+(?:\.\d+)?\s*(?:%|percent\b)/i;

const PROBABILITY_PHRASES = [
  /\bp\s*\(\s*win\s*\)/i,
  /\bwin\s+(?:probability|likelihood|chance)\b/i,
  /\bprobability\s+of\s+win/i,
  /\b\d+(?:\.\d+)?\s*\/\s*10\s+(?:chance|likelihood)/i,
];

function collectStrings(brief: BriefOutput): string[] {
  return [
    brief.summary,
    ...brief.why_it_matters,
    ...brief.recommendation_rationale,
    brief.next_action,
    ...brief.people.flatMap((p) => [p.why, p.suggested_action]),
  ];
}

export interface ValidationContext {
  /** contacts.id values supplied to the model. */
  candidatePersonIds: Set<string>;
  /** True when the context object contained a real incumbent contract. */
  hasIncumbent: boolean;
  /** Recipient name of the incumbent, if any. */
  incumbentRecipient: string | null;
}

/**
 * Semantic validation. Returns every failure rather than the first, so a retry
 * prompt can name all of them at once.
 */
export function validateBrief(brief: BriefOutput, context: ValidationContext): ValidationFailure[] {
  const failures: ValidationFailure[] = [];
  const strings = collectStrings(brief);

  // §6: "every person referenced by a person_id from the supplied candidate
  // list". Acceptance criterion 7: every person named resolves to a real
  // people.id.
  for (const person of brief.people) {
    if (!context.candidatePersonIds.has(person.person_id)) {
      failures.push({
        rule: 'unknown_person_id',
        detail: `person_id "${person.person_id}" was not in the supplied candidate list`,
      });
    }
  }

  const seen = new Set<string>();
  for (const person of brief.people) {
    if (seen.has(person.person_id)) {
      failures.push({ rule: 'duplicate_person', detail: `person_id "${person.person_id}" listed twice` });
    }
    seen.add(person.person_id);
  }

  if (brief.people.length > MAX_PEOPLE) {
    failures.push({
      rule: 'too_many_people',
      detail: `${brief.people.length} people returned; the cap is ${MAX_PEOPLE}`,
    });
  }

  // §8 rule 2: no numeric probabilities anywhere.
  for (const text of strings) {
    if (PERCENTAGE.test(text)) {
      failures.push({ rule: 'percentage', detail: `contains a percentage: "${text.slice(0, 120)}"` });
    }
    for (const phrase of PROBABILITY_PHRASES) {
      if (phrase.test(text)) {
        failures.push({ rule: 'probability', detail: `states a win probability: "${text.slice(0, 120)}"` });
      }
    }
  }

  // §8 rule 1: no invented contract values. When no incumbent was found, the
  // brief must not name one — the most damaging hallucination available to it.
  if (!context.hasIncumbent) {
    for (const text of strings) {
      if (/\bincumbent\s+is\b|\bcurrently\s+held\s+by\b|\bheld\s+by\s+[A-Z]/.test(text)) {
        failures.push({
          rule: 'invented_incumbent',
          detail: `names an incumbent when none was supplied: "${text.slice(0, 120)}"`,
        });
      }
    }
  }

  if (!brief.summary.trim()) {
    failures.push({ rule: 'empty_summary', detail: 'summary is empty' });
  }
  if (!brief.next_action.trim()) {
    failures.push({ rule: 'empty_next_action', detail: 'next_action is empty' });
  }

  return failures;
}

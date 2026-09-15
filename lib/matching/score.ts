/**
 * Deterministic scoring — engineering spec §5.
 *
 * Pure functions: no database, no network, no LLM. Everything the scorer needs
 * arrives as arguments, which is what makes a fit reproducible and a
 * "why did I see this?" answerable from the stored evidence alone.
 */
import { isPreRfp, isSolicitation } from '../dod-scope';
import { normalizeSetAside, normalizeHeldSetAsides, companyHoldsSetAside } from './set-asides';
import type { OrgLineage } from '../ingestion/org-resolver';
import {
  bucketFor,
  type CompanyProfile,
  type Disqualification,
  type EvidenceLine,
  type OpportunityForScoring,
  type PastPerformanceSummary,
  type ScoreResult,
} from './types';

/** The §5 weights table, in one place so it can be read against the spec. */
export const WEIGHTS = {
  naics_exact: 25,
  naics_family: 15,
  psc_exact: 15,
  psc_family: 8,
  org_target: 20,
  org_lineage: 12,
  org_branch: 5,
  past_performance_org: 15,
  capability_keywords_max: 15,
  capability_keyword_each: 5,
  value_band: 10,
  pre_rfp: 10,
  solicitation: 5,
} as const;

/**
 * The weights sum to 110 at maximum, not 100: NAICS exact 25, PSC exact 15,
 * org target 20, past performance 15, keywords 15, value band 10, pre-RFP 10.
 * §5 calls the result a "weighted score, 0 to 100" and the matches table has a
 * CHECK for that range, so the total is clamped. Clamping rather than
 * rescaling keeps every individual weight exactly as the spec states it, and
 * anything at the ceiling is Strong either way.
 */
const MAX_SCORE = 100;

function haystack(opportunity: OpportunityForScoring): string {
  return `${opportunity.title} ${opportunity.description ?? ''}`.toLowerCase();
}

/**
 * Whole-word-ish containment. A plain substring test makes "AI" match
 * "maintenance" and "ISR" match "advisor", which is how a keyword filter
 * quietly becomes noise.
 */
function mentions(text: string, term: string): boolean {
  const cleaned = term.trim().toLowerCase();
  if (!cleaned) return false;
  const escaped = cleaned.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Multi-word terms are matched as a phrase with flexible internal spacing.
  const pattern = escaped.replace(/\s+/g, '\\s+');
  return new RegExp(`(?:^|[^a-z0-9])${pattern}(?:[^a-z0-9]|$)`, 'i').test(text);
}

/** NAICS and PSC "family" comparisons. NAICS families are the first 4 digits. */
function naicsFamily(code: string): string {
  return code.replace(/\D/g, '').slice(0, 4);
}

/**
 * PSC families are the first character for services (an alpha class like "D"
 * for IT services) and the first two digits for products.
 */
function pscFamily(code: string): string {
  const trimmed = code.trim().toUpperCase();
  return /^[A-Z]/.test(trimmed) ? trimmed.slice(0, 2) : trimmed.slice(0, 2);
}

/**
 * §5 hard disqualifiers. These are never surfaced — not scored low, not shown
 * with a warning. Returning early on the first hit is fine because the caller
 * only needs to know that it was disqualified and why.
 */
export function disqualify(
  opportunity: OpportunityForScoring,
  profile: CompanyProfile,
  now: Date = new Date(),
): Disqualification | null {
  // 1. Excluded keyword in title or description.
  const text = haystack(opportunity);
  for (const term of profile.excludedKeywords) {
    if (mentions(text, term)) {
      return { reason: 'excluded_keyword', detail: `matched excluded keyword "${term}"` };
    }
  }

  // 2. Set-aside present and the company does not hold it.
  const required = normalizeSetAside(opportunity.setAside);
  if (required) {
    const held = normalizeHeldSetAsides(profile.setAsides);
    if (!companyHoldsSetAside(required, held)) {
      return {
        reason: 'set_aside_not_held',
        detail: `requires ${required}; company holds ${[...held].join(', ') || 'none'}`,
      };
    }
  }
  // `undefined` (set-aside present but unrecognised) deliberately falls
  // through. See lib/matching/set-asides.ts.

  // 3. Value more than 2x outside the stated band. A null value means SAM did
  // not publish one, which is the common case on a pre-solicitation — treated
  // as unknown, never as out of band.
  const value = opportunity.estimatedValue;
  if (value !== null) {
    if (profile.maxValue !== null && value > profile.maxValue * 2) {
      return {
        reason: 'value_far_outside_band',
        detail: `value ${value} is more than 2x the ${profile.maxValue} ceiling`,
      };
    }
    if (profile.minValue !== null && profile.minValue > 0 && value < profile.minValue / 2) {
      return {
        reason: 'value_far_outside_band',
        detail: `value ${value} is less than half the ${profile.minValue} floor`,
      };
    }
  }

  // 4. Deadline already passed. A null deadline is not a passed deadline —
  // Special Notices and forecasts routinely carry none.
  if (opportunity.responseDeadline && opportunity.responseDeadline.getTime() < now.getTime()) {
    return {
      reason: 'deadline_passed',
      detail: `responses closed ${opportunity.responseDeadline.toISOString().slice(0, 10)}`,
    };
  }

  return null;
}

function scoreNaics(
  opportunity: OpportunityForScoring,
  profile: CompanyProfile,
  pastPerformance: PastPerformanceSummary,
): EvidenceLine | null {
  const code = opportunity.naicsCode?.trim();
  if (!code) return null;

  if (profile.naicsCodes.includes(code)) {
    const priorCount = pastPerformance.naicsCounts.get(code) ?? 0;
    // §5's own worked example: "Same NAICS as 3 of your past contracts (541512)".
    // "1 of your past contracts" — the noun stays plural whatever the count.
    const line = priorCount
      ? `Same NAICS as ${priorCount} of your past contracts (${code})`
      : `NAICS ${code} is on your capability profile`;
    return { factor: 'naics_exact', points: WEIGHTS.naics_exact, line };
  }

  const family = naicsFamily(code);
  if (family && profile.naicsCodes.some((c) => naicsFamily(c) === family)) {
    const related = profile.naicsCodes.filter((c) => naicsFamily(c) === family);
    return {
      factor: 'naics_family',
      points: WEIGHTS.naics_family,
      line: `NAICS ${code} is in the same ${family}x family as your ${related.slice(0, 2).join(', ')}`,
    };
  }

  return null;
}

function scorePsc(opportunity: OpportunityForScoring, profile: CompanyProfile): EvidenceLine | null {
  const code = opportunity.pscCode?.trim().toUpperCase();
  if (!code) return null;

  if (profile.pscCodes.some((c) => c.trim().toUpperCase() === code)) {
    return { factor: 'psc_exact', points: WEIGHTS.psc_exact, line: `PSC ${code} matches your profile` };
  }

  const family = pscFamily(code);
  if (family && profile.pscCodes.some((c) => pscFamily(c) === family)) {
    return {
      factor: 'psc_family',
      points: WEIGHTS.psc_family,
      line: `PSC ${code} is in the same ${family} family as work you do`,
    };
  }

  return null;
}

/**
 * §5: "Org factors do not stack. Take the highest only." Target beats lineage
 * beats branch.
 */
function scoreOrg(
  opportunity: OpportunityForScoring,
  lineage: OrgLineage,
): EvidenceLine | null {
  const orgId = opportunity.canonicalOrgId;
  const label = opportunity.orgName ?? orgId;
  if (!orgId) return null;

  if (lineage.targets.has(orgId)) {
    return { factor: 'org_target', points: WEIGHTS.org_target, line: `${label} is one of your target organizations` };
  }

  if (lineage.related.has(orgId)) {
    return {
      factor: 'org_lineage',
      points: WEIGHTS.org_lineage,
      line: `${label} sits in the command chain of one of your target organizations`,
    };
  }

  if (opportunity.orgBranch && lineage.branches.has(opportunity.orgBranch)) {
    return {
      factor: 'org_branch',
      points: WEIGHTS.org_branch,
      line: `${label} is in ${opportunity.orgBranch}, where you already target work`,
    };
  }

  return null;
}

function scorePastPerformance(
  opportunity: OpportunityForScoring,
  pastPerformance: PastPerformanceSummary,
): EvidenceLine | null {
  const orgId = opportunity.canonicalOrgId;
  if (!orgId || !pastPerformance.orgLineage.has(orgId)) return null;

  const label = opportunity.orgName ?? pastPerformance.orgNames.get(orgId) ?? orgId;
  return {
    factor: 'past_performance_org',
    points: WEIGHTS.past_performance_org,
    line: `You have past performance with ${label}`,
  };
}

/** §5: capability keyword hits in title or description, up to 15. */
function scoreKeywords(opportunity: OpportunityForScoring, profile: CompanyProfile): EvidenceLine | null {
  const text = haystack(opportunity);
  const terms = [...new Set([...profile.capabilities, ...profile.keywords].map((t) => t.trim()).filter(Boolean))];

  const hits = terms.filter((term) => mentions(text, term));
  if (!hits.length) return null;

  const points = Math.min(hits.length * WEIGHTS.capability_keyword_each, WEIGHTS.capability_keywords_max);
  const shown = hits.slice(0, 3).join(', ');
  const rest = hits.length > 3 ? ` +${hits.length - 3} more` : '';

  return {
    factor: 'capability_keywords',
    points,
    line: `Mentions your ${hits.length === 1 ? 'capability' : 'capabilities'}: ${shown}${rest}`,
  };
}

function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value}`;
}

function scoreValueBand(opportunity: OpportunityForScoring, profile: CompanyProfile): EvidenceLine | null {
  const value = opportunity.estimatedValue;
  if (value === null) return null;
  if (profile.minValue === null && profile.maxValue === null) return null;

  const aboveFloor = profile.minValue === null || value >= profile.minValue;
  const belowCeiling = profile.maxValue === null || value <= profile.maxValue;
  if (!aboveFloor || !belowCeiling) return null;

  return {
    factor: 'value_band',
    points: WEIGHTS.value_band,
    line: `Estimated value ${formatUsd(value)} sits inside your preferred range`,
  };
}

/**
 * §5: "The pre-RFP weighting is the thesis of the product. A Sources Sought
 * should beat an open solicitation of equal technical fit."
 */
function scoreStage(opportunity: OpportunityForScoring): EvidenceLine | null {
  const type = opportunity.noticeType;
  if (isPreRfp(type)) {
    return {
      factor: 'pre_rfp',
      points: WEIGHTS.pre_rfp,
      line: `${type} — pre-RFP, so the requirement is still being shaped`,
    };
  }
  if (isSolicitation(type)) {
    return { factor: 'solicitation', points: WEIGHTS.solicitation, line: `${type} — open solicitation` };
  }
  return null;
}

export interface ScoreInput {
  opportunity: OpportunityForScoring;
  profile: CompanyProfile;
  pastPerformance: PastPerformanceSummary;
  lineage: OrgLineage;
  now?: Date;
}

export function scoreOpportunity({
  opportunity,
  profile,
  pastPerformance,
  lineage,
  now = new Date(),
}: ScoreInput): ScoreResult {
  const disqualified = disqualify(opportunity, profile, now);
  if (disqualified) {
    return { opportunityId: opportunity.id, score: 0, fit: 'weak', evidence: [], disqualified };
  }

  const evidence = [
    scoreNaics(opportunity, profile, pastPerformance),
    scorePsc(opportunity, profile),
    scoreOrg(opportunity, lineage),
    scorePastPerformance(opportunity, pastPerformance),
    scoreKeywords(opportunity, profile),
    scoreValueBand(opportunity, profile),
    scoreStage(opportunity),
  ].filter((line): line is EvidenceLine => line !== null);

  const raw = evidence.reduce((sum, line) => sum + line.points, 0);
  const score = Math.min(raw, MAX_SCORE);

  // Strongest factor first: the briefing shows only the top two lines (§7.2).
  evidence.sort((a, b) => b.points - a.points);

  return { opportunityId: opportunity.id, score, fit: bucketFor(score), evidence, disqualified: null };
}

/**
 * Matching engine types — engineering spec §5.
 *
 * The engine is deterministic SQL and TypeScript. No LLM in scoring. The LLM
 * only explains a score that was already computed (§6), which is what makes a
 * fit reproducible and a complaint about one answerable.
 */

export type Fit = 'strong' | 'fair' | 'weak';

/** The scoring factors, as named in the §5 table. */
export type ScoringFactor =
  | 'naics_exact'
  | 'naics_family'
  | 'psc_exact'
  | 'psc_family'
  | 'org_target'
  | 'org_lineage'
  | 'org_branch'
  | 'past_performance_org'
  | 'capability_keywords'
  | 'value_band'
  | 'pre_rfp'
  | 'solicitation';

/**
 * One awarded factor with the sentence the customer reads.
 *
 * §5: "Every awarded point writes a human-readable line into evidence... If a
 * factor cannot produce a readable line, it should not be a factor." So `line`
 * is required, not optional.
 */
export interface EvidenceLine {
  factor: ScoringFactor;
  points: number;
  line: string;
}

export type DisqualifierReason =
  | 'excluded_keyword'
  | 'set_aside_not_held'
  | 'value_far_outside_band'
  | 'deadline_passed';

export interface Disqualification {
  reason: DisqualifierReason;
  /** Internal, for the admin screen and for debugging a "why didn't I see X". */
  detail: string;
}

export interface CompanyProfile {
  userCompanyId: string;
  naicsCodes: string[];
  pscCodes: string[];
  setAsides: string[];
  vehicles: string[];
  targetOrgIds: string[];
  capabilities: string[];
  keywords: string[];
  excludedKeywords: string[];
  minValue: number | null;
  maxValue: number | null;
  primePref: 'prime' | 'sub' | 'either';
  geoConstraints: string[];
  version: number;
}

export interface PastPerformanceSummary {
  /** NAICS code -> how many past contracts carry it, for the evidence line. */
  naicsCounts: Map<string, number>;
  pscCounts: Map<string, number>;
  /** Every org in the lineage of any past-performance org. */
  orgLineage: Set<string>;
  /** orgs.id -> display name, so evidence can say "AFLCMC" not "aflcmc". */
  orgNames: Map<string, string>;
}

export interface OpportunityForScoring {
  id: string;
  title: string;
  description: string | null;
  noticeType: string | null;
  naicsCode: string | null;
  pscCode: string | null;
  setAside: string | null;
  estimatedValue: number | null;
  responseDeadline: Date | null;
  canonicalOrgId: string | null;
  orgBranch: string | null;
  orgName: string | null;
}

export interface ScoreResult {
  opportunityId: string;
  score: number;
  fit: Fit;
  evidence: EvidenceLine[];
  disqualified: Disqualification | null;
}

/** §5 fit buckets. Strong 65+, Fair 40-64, Weak below 40. */
export function bucketFor(score: number): Fit {
  if (score >= 65) return 'strong';
  if (score >= 40) return 'fair';
  return 'weak';
}

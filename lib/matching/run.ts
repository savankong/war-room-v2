/**
 * Scoring run — engineering spec §5 and §8 (`score-matches`, daily after
 * ingest).
 *
 * Loads a company's profile, past performance and org lineage once, then
 * scores every live opportunity against it and upserts the matches.
 */
import type postgres from 'postgres';
import { loadOrgLineage, type OrgLineage } from '../ingestion/org-resolver';
import { scoreOpportunity } from './score';
import type {
  CompanyProfile,
  OpportunityForScoring,
  PastPerformanceSummary,
  ScoreResult,
} from './types';

type Sql = ReturnType<typeof postgres>;

export async function loadCompanyProfile(sql: Sql, userCompanyId: string): Promise<CompanyProfile | null> {
  const rows = await sql<
    {
      user_company_id: string;
      naics_codes: string[];
      psc_codes: string[];
      set_asides: string[];
      vehicles: string[];
      target_org_ids: string[];
      capabilities: string[];
      keywords: string[];
      excluded_keywords: string[];
      min_value: string | null;
      max_value: string | null;
      prime_pref: 'prime' | 'sub' | 'either';
      geo_constraints: string[];
      version: number;
    }[]
  >`
    SELECT user_company_id, naics_codes, psc_codes, set_asides, vehicles,
           target_org_ids, capabilities, keywords, excluded_keywords,
           min_value, max_value, prime_pref, geo_constraints, version
    FROM company_profiles
    WHERE user_company_id = ${userCompanyId}
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) return null;

  return {
    userCompanyId: row.user_company_id,
    naicsCodes: row.naics_codes ?? [],
    pscCodes: row.psc_codes ?? [],
    setAsides: row.set_asides ?? [],
    vehicles: row.vehicles ?? [],
    targetOrgIds: row.target_org_ids ?? [],
    capabilities: row.capabilities ?? [],
    keywords: row.keywords ?? [],
    excludedKeywords: row.excluded_keywords ?? [],
    // DECIMAL comes back as a string; Number(null) is 0, which would silently
    // become a real floor of $0 and change the value-band disqualifier.
    minValue: row.min_value === null ? null : Number(row.min_value),
    maxValue: row.max_value === null ? null : Number(row.max_value),
    primePref: row.prime_pref,
    geoConstraints: row.geo_constraints ?? [],
    version: row.version,
  };
}

export async function loadPastPerformance(
  sql: Sql,
  userCompanyId: string,
): Promise<PastPerformanceSummary> {
  const rows = await sql<{ naics_code: string | null; psc_code: string | null; canonical_org_id: string | null }[]>`
    SELECT naics_code, psc_code, canonical_org_id
    FROM company_past_performance
    WHERE user_company_id = ${userCompanyId}
  `;

  const naicsCounts = new Map<string, number>();
  const pscCounts = new Map<string, number>();
  const orgIds: string[] = [];

  for (const row of rows) {
    if (row.naics_code) naicsCounts.set(row.naics_code, (naicsCounts.get(row.naics_code) ?? 0) + 1);
    if (row.psc_code) pscCounts.set(row.psc_code, (pscCounts.get(row.psc_code) ?? 0) + 1);
    if (row.canonical_org_id) orgIds.push(row.canonical_org_id);
  }

  // "Past performance in the same org lineage" (§5) — an award to AFLCMC/WNS
  // counts as past performance with AFLCMC and vice versa.
  const lineage = await loadOrgLineage(sql, [...new Set(orgIds)]);
  const orgLineage = new Set([...lineage.targets, ...lineage.related]);

  const orgNames = new Map<string, string>();
  if (orgLineage.size) {
    const nameRows = await sql<{ id: string; label: string }[]>`
      SELECT id, COALESCE(abbreviation, full_name, id) AS label
      FROM orgs WHERE id = ANY(${[...orgLineage]})
    `;
    for (const r of nameRows) orgNames.set(r.id, r.label);
  }

  return { naicsCounts, pscCounts, orgLineage, orgNames };
}

export interface CompanyScoringContext {
  profile: CompanyProfile;
  pastPerformance: PastPerformanceSummary;
  lineage: OrgLineage;
}

export async function loadScoringContext(
  sql: Sql,
  userCompanyId: string,
): Promise<CompanyScoringContext | null> {
  const profile = await loadCompanyProfile(sql, userCompanyId);
  if (!profile) return null;

  const [pastPerformance, lineage] = await Promise.all([
    loadPastPerformance(sql, userCompanyId),
    loadOrgLineage(sql, profile.targetOrgIds),
  ]);

  return { profile, pastPerformance, lineage };
}

export interface LoadOpportunitiesOptions {
  /** Only score notices posted within this many days. Null means all live ones. */
  postedWithinDays?: number | null;
  limit?: number;
}

/**
 * Live opportunities, joined to their org for the branch and display name the
 * evidence lines need.
 *
 * Opportunities whose deadline has already passed are excluded here as well as
 * in the disqualifier — filtering in SQL keeps a daily run from loading years
 * of dead notices just to throw them away.
 */
export async function loadOpportunities(
  sql: Sql,
  options: LoadOpportunitiesOptions = {},
): Promise<OpportunityForScoring[]> {
  const { postedWithinDays = 90, limit = 5000 } = options;

  const rows = await sql<
    {
      id: string;
      title: string;
      description: string | null;
      notice_type: string | null;
      naics_code: string | null;
      psc_code: string | null;
      set_aside: string | null;
      estimated_value: string | null;
      response_deadline: Date | null;
      canonical_org_id: string | null;
      org_branch: string | null;
      org_name: string | null;
    }[]
  >`
    SELECT o.id, o.title, o.description, o.notice_type, o.naics_code, o.psc_code,
           o.set_aside, o.estimated_value, o.response_deadline, o.canonical_org_id,
           org.branch AS org_branch,
           COALESCE(org.abbreviation, org.full_name, o.office_name) AS org_name
    FROM opportunities o
    LEFT JOIN orgs org ON org.id = o.canonical_org_id
    WHERE (o.response_deadline IS NULL OR o.response_deadline >= now())
      AND (${postedWithinDays}::int IS NULL
           OR o.posted_date IS NULL
           OR o.posted_date >= current_date - (${postedWithinDays}::int || ' days')::interval)
    ORDER BY o.posted_date DESC NULLS LAST
    LIMIT ${limit}
  `;

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    noticeType: r.notice_type,
    naicsCode: r.naics_code,
    pscCode: r.psc_code,
    setAside: r.set_aside,
    estimatedValue: r.estimated_value === null ? null : Number(r.estimated_value),
    responseDeadline: r.response_deadline,
    canonicalOrgId: r.canonical_org_id,
    orgBranch: r.org_branch,
    orgName: r.org_name,
  }));
}

export interface ScoreCompanyResult {
  userCompanyId: string;
  scored: number;
  strong: number;
  fair: number;
  weak: number;
  disqualified: number;
  persisted: number;
  results: ScoreResult[];
}

export interface ScoreCompanyOptions extends LoadOpportunitiesOptions {
  /** Score and return without writing to `matches`. */
  dryRun?: boolean;
  now?: Date;
  /** Pre-loaded opportunities, so a multi-company run loads them once. */
  opportunities?: OpportunityForScoring[];
}

/**
 * Score every live opportunity for one company and upsert the survivors.
 *
 * Weak matches are persisted, disqualified ones are not. §5 says only Strong
 * and Fair generate a capture brief, but a Weak row is still the answer to
 * "why am I not seeing this?" in the admin screen. A disqualified opportunity
 * has no score to record and must never be surfaced, so it gets no row.
 */
export async function scoreCompany(
  sql: Sql,
  userCompanyId: string,
  options: ScoreCompanyOptions = {},
): Promise<ScoreCompanyResult> {
  const context = await loadScoringContext(sql, userCompanyId);
  if (!context) {
    throw new Error(`No company_profiles row for user_company_id=${userCompanyId}`);
  }

  const opportunities = options.opportunities ?? (await loadOpportunities(sql, options));
  const now = options.now ?? new Date();

  const results: ScoreResult[] = [];
  let strong = 0;
  let fair = 0;
  let weak = 0;
  let disqualified = 0;

  for (const opportunity of opportunities) {
    const result = scoreOpportunity({
      opportunity,
      profile: context.profile,
      pastPerformance: context.pastPerformance,
      lineage: context.lineage,
      now,
    });

    results.push(result);

    if (result.disqualified) {
      disqualified++;
      continue;
    }
    if (result.fit === 'strong') strong++;
    else if (result.fit === 'fair') fair++;
    else weak++;
  }

  let persisted = 0;
  if (!options.dryRun) {
    const keep = results.filter((r) => !r.disqualified);
    persisted = await persistMatches(sql, userCompanyId, context.profile.version, keep);

    // An opportunity that now disqualifies (profile edit, deadline passed)
    // must stop being surfaced. Dismissals are left alone: those are the
    // customer's own "not relevant" and outlive a rescore.
    const dropped = results.filter((r) => r.disqualified).map((r) => r.opportunityId);
    if (dropped.length) {
      await sql`
        DELETE FROM matches
        WHERE user_company_id = ${userCompanyId}
          AND opportunity_id = ANY(${dropped})
          AND dismissed_at IS NULL
      `;
    }
  }

  return {
    userCompanyId,
    scored: results.length,
    strong,
    fair,
    weak,
    disqualified,
    persisted,
    results,
  };
}

async function persistMatches(
  sql: Sql,
  userCompanyId: string,
  profileVersion: number,
  results: ScoreResult[],
): Promise<number> {
  if (!results.length) return 0;

  const CHUNK = 500;
  let written = 0;

  for (let i = 0; i < results.length; i += CHUNK) {
    const chunk = results.slice(i, i + CHUNK);
    const rows = chunk.map((r) => ({
      user_company_id: userCompanyId,
      opportunity_id: r.opportunityId,
      score: r.score,
      fit: r.fit,
      // sql.json, not JSON.stringify: postgres.js serializes values bound to a
      // jsonb column itself, so a pre-stringified array is encoded a second
      // time and the column ends up holding a JSON *string* rather than an
      // array. Everything downstream then gets a string where it expects
      // evidence lines.
      evidence: sql.json(r.evidence as never),
      profile_version: profileVersion,
    }));

    await sql`
      INSERT INTO matches ${sql(rows, 'user_company_id', 'opportunity_id', 'score', 'fit', 'evidence', 'profile_version')}
      ON CONFLICT (user_company_id, opportunity_id) DO UPDATE SET
        score           = EXCLUDED.score,
        fit             = EXCLUDED.fit,
        evidence        = EXCLUDED.evidence,
        profile_version = EXCLUDED.profile_version,
        computed_at     = now()
    `;
    written += chunk.length;
  }

  return written;
}

/** Every company with a completed profile, for the nightly `score-matches` job. */
export async function listScorableCompanies(sql: Sql): Promise<string[]> {
  const rows = await sql<{ user_company_id: string }[]>`
    SELECT p.user_company_id
    FROM company_profiles p
    JOIN user_companies c ON c.id = p.user_company_id
    WHERE c.status = 'active'
      AND c.plan IN ('trial', 'capture')
  `;
  return rows.map((r) => r.user_company_id);
}

/**
 * Org resolution — engineering spec §4, "Org resolution".
 *
 * "SAM returns both a department slug and a specific contracting office slug
 *  for the same notice. Apply the existing rule-based prefix matching to
 *  resolve canonical_org_id. Unresolved rows keep department_slug, get
 *  canonical_org_id = NULL, and land in the admin review queue. Never drop
 *  them."
 *
 * Ported from packages/ingestion/src/org-matcher.ts with three changes:
 *
 *  1. It now follows orgs.canonical_org_id, so a hit on an alias row resolves
 *     to the canonical org rather than to the alias. Scoring joins on the
 *     canonical id, so an alias hit was effectively a miss.
 *  2. The office code is tried most-specific-first across the whole parent
 *     path, not just the last segment. SAM paths look like
 *     "057.5700.FA4600" — the old code took only "fa4600" and gave up.
 *  3. Acceptance criterion 3 wants at least 85% resolution, so misses are
 *     counted and reported rather than silently returning null.
 */
import type postgres from 'postgres';

type Sql = ReturnType<typeof postgres>;

export interface OrgResolution {
  canonicalOrgId: string | null;
  /** Which rule fired, for the admin queue and for tuning. */
  via: 'org_id' | 'abbreviation' | 'contracting_office_code' | 'full_name' | 'department_name' | null;
}

/**
 * Cache is per-process and unbounded on purpose: a run sees a few thousand
 * distinct office codes at most, and the worker restarts daily.
 */
const cache = new Map<string, OrgResolution>();

export function clearOrgCache(): void {
  cache.clear();
}

/** Follow orgs.canonical_org_id one hop so alias rows resolve to the real org. */
async function canonicalize(sql: Sql, orgId: string): Promise<string> {
  const rows = await sql<{ canonical_org_id: string | null }[]>`
    SELECT canonical_org_id FROM orgs WHERE id = ${orgId} LIMIT 1
  `;
  return rows[0]?.canonical_org_id ?? orgId;
}

/**
 * Resolve a SAM notice to an orgs.id.
 *
 * @param parentPathCode  fullParentPathCode, e.g. "057.5700.FA4600"
 * @param parentPathName  fullParentPathName, e.g. "DEPT OF DEFENSE.DEPT OF THE AIR FORCE.AFLCMC"
 */
export async function resolveOrg(
  sql: Sql,
  parentPathCode: string | null | undefined,
  parentPathName: string | null | undefined,
): Promise<OrgResolution> {
  const cacheKey = `${parentPathCode ?? ''}|${parentPathName ?? ''}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const result = await resolveUncached(sql, parentPathCode, parentPathName);
  cache.set(cacheKey, result);
  return result;
}

async function resolveUncached(
  sql: Sql,
  parentPathCode: string | null | undefined,
  parentPathName: string | null | undefined,
): Promise<OrgResolution> {
  // Most specific segment first: the contracting office beats the department.
  const codeSegments = (parentPathCode ?? '')
    .split('.')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .reverse();

  const nameSegments = (parentPathName ?? '')
    .split('.')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .reverse();

  for (const code of codeSegments) {
    const byId = await sql<{ id: string }[]>`
      SELECT id FROM orgs WHERE lower(id) = ${code} LIMIT 1
    `;
    if (byId[0]) {
      return { canonicalOrgId: await canonicalize(sql, byId[0].id), via: 'org_id' };
    }

    const byAbbrev = await sql<{ id: string }[]>`
      SELECT id FROM orgs WHERE lower(abbreviation) = ${code} LIMIT 1
    `;
    if (byAbbrev[0]) {
      return { canonicalOrgId: await canonicalize(sql, byAbbrev[0].id), via: 'abbreviation' };
    }

    const byOfficeCode = await sql<{ id: string }[]>`
      SELECT id FROM orgs WHERE lower(contracting_office_code) = ${code} LIMIT 1
    `;
    if (byOfficeCode[0]) {
      return {
        canonicalOrgId: await canonicalize(sql, byOfficeCode[0].id),
        via: 'contracting_office_code',
      };
    }
  }

  // Name segments, again most specific first. Exact before fuzzy: an exact
  // full_name or abbreviation hit on "AFLCMC" must win over a LIKE that would
  // match half the Air Force.
  for (const name of nameSegments) {
    const exact = await sql<{ id: string }[]>`
      SELECT id FROM orgs
      WHERE lower(full_name) = ${name} OR lower(abbreviation) = ${name}
      LIMIT 1
    `;
    if (exact[0]) {
      return { canonicalOrgId: await canonicalize(sql, exact[0].id), via: 'full_name' };
    }
  }

  // Last resort: the department. Prefer the longest full_name so
  // "Department of the Air Force" beats "Department of Defense" when both
  // appear in the path.
  for (const name of nameSegments) {
    if (name.length < 6) continue; // too short to fuzzy-match safely
    const fuzzy = await sql<{ id: string }[]>`
      SELECT id FROM orgs
      WHERE full_name IS NOT NULL
        AND (lower(full_name) LIKE ${'%' + name + '%'} OR ${name} LIKE '%' || lower(full_name) || '%')
      ORDER BY length(full_name) DESC
      LIMIT 1
    `;
    if (fuzzy[0]) {
      return { canonicalOrgId: await canonicalize(sql, fuzzy[0].id), via: 'department_name' };
    }
  }

  return { canonicalOrgId: null, via: null };
}

/**
 * Ancestors of an org, nearest first, following orgs.parent_id.
 * Used by the matching engine (§5, "Org is ancestor or descendant of a target
 * org") and by incumbent detection (§6, "same canonical_org_id lineage").
 *
 * Depth-capped because orgs.parent_id has no cycle constraint and one bad row
 * would otherwise hang a scoring run.
 */
export async function getOrgAncestors(sql: Sql, orgId: string, maxDepth = 10): Promise<string[]> {
  const rows = await sql<{ id: string; depth: number }[]>`
    WITH RECURSIVE lineage AS (
      SELECT id, parent_id, 0 AS depth FROM orgs WHERE id = ${orgId}
      UNION ALL
      SELECT o.id, o.parent_id, l.depth + 1
      FROM orgs o
      JOIN lineage l ON o.id = l.parent_id
      WHERE l.depth < ${maxDepth}
    )
    SELECT id, depth FROM lineage WHERE depth > 0 ORDER BY depth
  `;
  return rows.map((r) => r.id);
}

/** Descendants of an org, following orgs.parent_id downward. */
export async function getOrgDescendants(sql: Sql, orgId: string, maxDepth = 10): Promise<string[]> {
  const rows = await sql<{ id: string }[]>`
    WITH RECURSIVE lineage AS (
      SELECT id, 0 AS depth FROM orgs WHERE id = ${orgId}
      UNION ALL
      SELECT o.id, l.depth + 1
      FROM orgs o
      JOIN lineage l ON o.parent_id = l.id
      WHERE l.depth < ${maxDepth}
    )
    SELECT id FROM lineage WHERE depth > 0
  `;
  return rows.map((r) => r.id);
}

/**
 * The full lineage of every target org in one query: each target plus its
 * ancestors and descendants, tagged by relationship. The matching engine
 * loads this once per company instead of walking the tree per opportunity.
 */
export interface OrgLineage {
  /** The company's target orgs themselves. */
  targets: Set<string>;
  /** Ancestors and descendants of any target. */
  related: Set<string>;
  /** Branch values covered by the targets, for the weakest org factor. */
  branches: Set<string>;
}

export async function loadOrgLineage(sql: Sql, targetOrgIds: string[]): Promise<OrgLineage> {
  const targets = new Set(targetOrgIds);
  const related = new Set<string>();
  const branches = new Set<string>();

  if (!targetOrgIds.length) return { targets, related, branches };

  const rows = await sql<{ id: string }[]>`
    WITH RECURSIVE up AS (
      SELECT id, parent_id, 0 AS depth FROM orgs WHERE id = ANY(${targetOrgIds})
      UNION ALL
      SELECT o.id, o.parent_id, u.depth + 1
      FROM orgs o JOIN up u ON o.id = u.parent_id
      WHERE u.depth < 10
    ),
    down AS (
      SELECT id, 0 AS depth FROM orgs WHERE id = ANY(${targetOrgIds})
      UNION ALL
      SELECT o.id, d.depth + 1
      FROM orgs o JOIN down d ON o.parent_id = d.id
      WHERE d.depth < 10
    )
    SELECT id FROM up WHERE depth > 0
    UNION
    SELECT id FROM down WHERE depth > 0
  `;
  for (const r of rows) if (!targets.has(r.id)) related.add(r.id);

  const branchRows = await sql<{ branch: string | null }[]>`
    SELECT DISTINCT branch FROM orgs WHERE id = ANY(${targetOrgIds}) AND branch IS NOT NULL
  `;
  for (const r of branchRows) if (r.branch) branches.add(r.branch);

  return { targets, related, branches };
}

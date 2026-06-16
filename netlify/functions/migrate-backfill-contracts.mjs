import { getDatabase } from '@netlify/database';

/**
 * Step 3: Backfill Contract Organization Links
 *
 * For each contract:
 * 1. Resolve its org_id through org_aliases to get canonical_org_id
 * 2. Populate hierarchy_label_1-5 from hierarchy_level_1-5 in contracts
 * 3. Write both canonical_org_id and hierarchy labels
 *
 * This creates the canonical linkage that APIs will use for cross-linking
 */

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'POST required' }, { status: 405 });
  }

  const db = getDatabase();
  const startTime = Date.now();

  try {
    // ─────────────────────────────────────────────────────────────
    // PHASE 1: Fetch all contracts with their current org references
    // ─────────────────────────────────────────────────────────────

    const contracts = await db.sql`
      SELECT
        id,
        org_id,
        hierarchy_level_1,
        hierarchy_level_2,
        hierarchy_level_3,
        hierarchy_level_4,
        hierarchy_level_5,
        org_id_level_1,
        org_id_level_2,
        org_id_level_3,
        org_id_level_4,
        org_id_level_5
      FROM contracts
      WHERE id IS NOT NULL
      ORDER BY id
    `;

    console.log(`Processing ${contracts.length} contracts...`);

    // ─────────────────────────────────────────────────────────────
    // PHASE 2: For each contract, resolve canonical_org_id
    // ─────────────────────────────────────────────────────────────

    let processed = 0;
    let updated = 0;
    let skipped = 0;

    for (const contract of contracts) {
      try {
        let canonicalOrgId = null;

        // Priority 1: Use org_id_level_3 (most specific)
        if (contract.org_id_level_3) {
          canonicalOrgId = await resolveCanonicalOrgId(db, contract.org_id_level_3);
        }
        // Priority 2: Use org_id_level_2
        else if (contract.org_id_level_2) {
          canonicalOrgId = await resolveCanonicalOrgId(db, contract.org_id_level_2);
        }
        // Priority 3: Use org_id_level_1
        else if (contract.org_id_level_1) {
          canonicalOrgId = await resolveCanonicalOrgId(db, contract.org_id_level_1);
        }
        // Priority 4: Use org_id (legacy)
        else if (contract.org_id) {
          canonicalOrgId = await resolveCanonicalOrgId(db, contract.org_id);
        }

        // If we found a canonical org, update the contract
        if (canonicalOrgId) {
          await db.sql`
            UPDATE contracts
            SET
              canonical_org_id = ${canonicalOrgId},
              hierarchy_label_1 = ${contract.hierarchy_level_1 || null},
              hierarchy_label_2 = ${contract.hierarchy_level_2 || null},
              hierarchy_label_3 = ${contract.hierarchy_level_3 || null},
              hierarchy_label_4 = ${contract.hierarchy_level_4 || null},
              hierarchy_label_5 = ${contract.hierarchy_level_5 || null}
            WHERE id = ${contract.id}
          `;
          updated++;
        } else {
          skipped++;
        }

        processed++;
        if (processed % 100 === 0) {
          console.log(`Progress: ${processed}/${contracts.length}`);
        }
      } catch (err) {
        console.warn(`Failed to process contract ${contract.id}:`, err.message);
        skipped++;
      }
    }

    // ─────────────────────────────────────────────────────────────
    // PHASE 3: Verify coverage
    // ─────────────────────────────────────────────────────────────

    const [stats] = await db.sql`
      SELECT
        COUNT(*) as total_contracts,
        SUM(CASE WHEN canonical_org_id IS NOT NULL THEN 1 ELSE 0 END) as with_canonical,
        SUM(CASE WHEN canonical_org_id IS NULL THEN 1 ELSE 0 END) as without_canonical
      FROM contracts
    `;

    const elapsed = Date.now() - startTime;
    const coverage = stats.total_contracts > 0
      ? ((stats.with_canonical / stats.total_contracts) * 100).toFixed(2)
      : 0;

    return Response.json({
      success: true,
      elapsed_ms: elapsed,
      summary: {
        processed: processed,
        updated: updated,
        skipped: skipped,
        total_contracts: stats.total_contracts,
        with_canonical_org_id: stats.with_canonical,
        without_canonical_org_id: stats.without_canonical,
        coverage_percent: coverage,
      },
    });
  } catch (error) {
    console.error('Backfill contracts error:', error);
    return Response.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
};

export const config = { path: '/api/migrate-backfill-contracts' };

/**
 * Resolve an org_id to its canonical org through the org_aliases table
 * Returns the canonical_org_id if the org is an alias, or the org_id itself if canonical
 */
async function resolveCanonicalOrgId(db, orgId) {
  if (!orgId) return null;

  try {
    // Check if this org is marked as an alias
    const [org] = await db.sql`
      SELECT canonical_org_id, is_alias
      FROM orgs
      WHERE id = ${orgId}
    `;

    if (!org) return null;

    // If it's an alias and has a canonical, return the canonical
    if (org.is_alias && org.canonical_org_id) {
      return org.canonical_org_id;
    }

    // If not an alias (canonical org), return itself
    if (!org.is_alias) {
      return orgId;
    }

    // Fallback: if marked as alias but no canonical, try to find via org_aliases table
    const [alias] = await db.sql`
      SELECT canonical_org_id
      FROM org_aliases
      WHERE alias_org_id = ${orgId}
      LIMIT 1
    `;

    return alias?.canonical_org_id || orgId;
  } catch (err) {
    console.warn(`Error resolving canonical for ${orgId}:`, err.message);
    return orgId; // Fallback to original org_id
  }
}


import { getDatabase } from '@netlify/database';

/**
 * Step 4: Backfill Contact Organization Links
 *
 * For each contact with an org_id:
 * 1. Resolve its org_id through org_aliases to get canonical_org_id
 * 2. Write canonical_org_id to the contact
 *
 * This ensures contacts can be queried by canonical_org_id via the API
 */

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'POST required' }, { status: 405 });
  }

  const db = getDatabase();
  const startTime = Date.now();

  try {
    // ─────────────────────────────────────────────────────────────
    // PHASE 1: Fetch all contacts with org_id
    // ─────────────────────────────────────────────────────────────

    const contacts = await db.sql`
      SELECT id, org_id
      FROM contacts
      WHERE org_id IS NOT NULL AND org_id != ''
      ORDER BY id
    `;

    console.log(`Processing ${contacts.length} contacts with org_id...`);

    // ─────────────────────────────────────────────────────────────
    // PHASE 2: For each contact, resolve and write canonical_org_id
    // ─────────────────────────────────────────────────────────────

    let processed = 0;
    let updated = 0;
    let skipped = 0;

    for (const contact of contacts) {
      try {
        // Resolve org_id to canonical via org_aliases
        const canonicalOrgId = await resolveCanonicalOrgId(db, contact.org_id);

        if (canonicalOrgId) {
          await db.sql`
            UPDATE contacts
            SET canonical_org_id = ${canonicalOrgId}
            WHERE id = ${contact.id}
          `;
          updated++;
        } else {
          skipped++;
        }

        processed++;
        if (processed % 100 === 0) {
          console.log(`Progress: ${processed}/${contacts.length}`);
        }
      } catch (err) {
        console.warn(`Failed to process contact ${contact.id}:`, err.message);
        skipped++;
      }
    }

    // ─────────────────────────────────────────────────────────────
    // PHASE 3: Verify coverage
    // ─────────────────────────────────────────────────────────────

    const [stats] = await db.sql`
      SELECT
        COUNT(*) as total_contacts,
        SUM(CASE WHEN canonical_org_id IS NOT NULL THEN 1 ELSE 0 END) as with_canonical,
        SUM(CASE WHEN org_id IS NOT NULL AND canonical_org_id IS NULL THEN 1 ELSE 0 END) as org_but_no_canonical
      FROM contacts
    `;

    const [statsWithOrg] = await db.sql`
      SELECT COUNT(*) as contacts_with_org_id
      FROM contacts
      WHERE org_id IS NOT NULL AND org_id != ''
    `;

    const elapsed = Date.now() - startTime;

    return Response.json({
      success: true,
      elapsed_ms: elapsed,
      summary: {
        processed: processed,
        updated: updated,
        skipped: skipped,
        total_contacts: stats.total_contacts,
        contacts_with_org_id: statsWithOrg.contacts_with_org_id,
        with_canonical_org_id: stats.with_canonical,
        org_but_no_canonical: stats.org_but_no_canonical,
      },
    });
  } catch (error) {
    console.error('Backfill contacts error:', error);
    return Response.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
};

export const config = { path: '/api/migrate-backfill-contacts' };

/**
 * Resolve an org_id to its canonical org through the org_aliases table
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

    // Fallback: if marked as alias but no canonical, try org_aliases table
    const [alias] = await db.sql`
      SELECT canonical_org_id
      FROM org_aliases
      WHERE alias_org_id = ${orgId}
      LIMIT 1
    `;

    return alias?.canonical_org_id || orgId;
  } catch (err) {
    console.warn(`Error resolving canonical for ${orgId}:`, err.message);
    return orgId;
  }
}


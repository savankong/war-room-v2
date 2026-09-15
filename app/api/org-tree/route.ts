import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, unauthorized } from '@/lib/auth';

/**
 * GET /api/org-tree — the org picker for onboarding step 3 (§7.1).
 *
 * "Step 3 is the moment the customer sees the org graph and understands what
 *  they're buying. Treat it as a feature, not a form."
 *
 * §15 open decision 3 is whether this picker shows the full hierarchy or a
 * curated shortlist of the ~30 orgs that actually buy from this ICP. Both are
 * served here so the decision can be made from real onboarding sessions rather
 * than in the abstract: the default is the shortlist, `?scope=full` is the
 * whole tree. Neither choice is baked into the client.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * The blocking orgs from §4 plus the service departments. These are the roots
 * the shortlist is built from — the commands and agencies that actually award
 * to a 1-to-50-person contractor.
 */
const SHORTLIST_ROOTS = [
  'army', 'navy', 'af', 'hqmc', 'sf-hq',
  'centcom', 'eucom', 'northcom', 'southcom', 'stratcom', 'transcom',
  'cybercom', 'africom', 'spacecom',
  'dia', 'nsa', 'nga', 'nro', 'disa', 'dla', 'dcsa', 'dtra', 'dha', 'dfas',
  'cdao', 'diu', 'darpa', 'mda', 'osd',
];

export async function GET(req: Request) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  const scope = new URL(req.url).searchParams.get('scope') ?? 'shortlist';
  const sql = getDb();

  const rows =
    scope === 'full'
      ? await sql`
          SELECT o.id, o.full_name, o.abbreviation, o.branch, o.parent_id,
                 o.organization_type, o.description,
                 (SELECT count(*) FROM orgs c WHERE c.parent_id = o.id)::int AS child_count
          FROM orgs o
          WHERE o.is_active IS NOT FALSE
            AND COALESCE(o.is_alias, false) = false
            AND o.branch IS DISTINCT FROM 'Industry'
          ORDER BY o.branch NULLS LAST, COALESCE(o.full_name, o.id)
        `
      : await sql`
          WITH RECURSIVE shortlist AS (
            SELECT id, 0 AS depth FROM orgs WHERE id = ANY(${SHORTLIST_ROOTS})
            UNION ALL
            -- One level of children: enough to pick a specific buying command
            -- without showing the customer 3,000 contracting offices.
            SELECT o.id, s.depth + 1
            FROM orgs o JOIN shortlist s ON o.parent_id = s.id
            WHERE s.depth < 1
          )
          SELECT o.id, o.full_name, o.abbreviation, o.branch, o.parent_id,
                 o.organization_type, o.description,
                 (SELECT count(*) FROM orgs c WHERE c.parent_id = o.id)::int AS child_count
          FROM orgs o
          JOIN shortlist s ON s.id = o.id
          WHERE o.is_active IS NOT FALSE
            AND COALESCE(o.is_alias, false) = false
          ORDER BY o.branch NULLS LAST, COALESCE(o.full_name, o.id)
        `;

  return NextResponse.json({
    scope,
    orgs: rows.map((r) => ({
      id: r.id,
      name: r.full_name ?? r.abbreviation ?? r.id,
      abbreviation: r.abbreviation,
      branch: r.branch,
      parentId: r.parent_id,
      type: r.organization_type,
      description: r.description,
      childCount: r.child_count,
    })),
  });
}

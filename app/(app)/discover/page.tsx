import { getDb } from '@/lib/db';
import DiscoverClient from '../DiscoverClient';

export const dynamic = 'force-dynamic';

async function getOrgs() {
  const db = getDb();
  const rows = await db`
    WITH
      contact_counts AS (
        SELECT org_id, COUNT(*)::int AS cnt
        FROM contacts
        GROUP BY org_id
      ),
      contract_counts AS (
        SELECT canonical_org_id, COUNT(*)::int AS cnt
        FROM contracts
        WHERE canonical_org_id IS NOT NULL
        GROUP BY canonical_org_id
      ),
      top_leaders AS (
        SELECT DISTINCT ON (org_id)
          org_id, name AS top_leader_name, title AS top_leader_title
        FROM contacts
        WHERE hierarchy_order IS NOT NULL
        ORDER BY org_id, hierarchy_order ASC, name ASC
      )
    SELECT
      o.id,
      COALESCE(o.full_name, o.id) AS name,
      o.org_type_id          AS organization_type,
      o.loc                  AS hq_address,
      o.branch,
      o.sub,
      o.hierarchy_level      AS abs_hierarchy_level,
      o.hierarchy_level,
      o.parent_id,
      COALESCE(cc.cnt, 0)    AS contact_count,
      COALESCE(ct.cnt, 0)    AS contract_count,
      tl.top_leader_name,
      tl.top_leader_title
    FROM orgs o
    LEFT JOIN contact_counts  cc ON cc.org_id          = o.id
    LEFT JOIN contract_counts ct ON ct.canonical_org_id = o.id
    LEFT JOIN top_leaders     tl ON tl.org_id           = o.id
    WHERE o.is_active = true
      AND o.branch != 'Industry'
    ORDER BY o.hierarchy_level NULLS LAST, o.full_name
  `;
  return rows as Array<{
    id: string; name: string;
    organization_type: string | null;
    hq_address: string | null;
    branch: string | null;
    sub: string | null;
    abs_hierarchy_level: number | null;
    hierarchy_level: number | null;
    parent_id: string | null;
    contact_count: number;
    contract_count: number;
    top_leader_name: string | null;
    top_leader_title: string | null;
  }>;
}

export default async function Page() {
  const orgs = await getOrgs();
  return <DiscoverClient orgs={orgs} />;
}

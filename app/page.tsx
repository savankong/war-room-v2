import { getDb } from '@/lib/db';
import DiscoverClient from './DiscoverClient';

export const revalidate = 600;

async function getOrgs() {
  const db = getDb();
  const rows = await db`
    SELECT
      o.id,
      o.full_name            AS name,
      o.organization_type,
      o.loc                  AS hq_address,
      o.branch,
      o.abs_hierarchy_level,
      o.hierarchy_level,
      o.parent_id,
      COUNT(DISTINCT c.id)::int   AS contact_count,
      COUNT(DISTINCT ct.id)::int  AS contract_count,
      (
        SELECT c2.name FROM contacts c2
        WHERE c2.org_id = o.id AND c2.hierarchy_order = 1
        ORDER BY c2.name LIMIT 1
      ) AS top_leader_name,
      (
        SELECT c2.title FROM contacts c2
        WHERE c2.org_id = o.id AND c2.hierarchy_order = 1
        ORDER BY c2.name LIMIT 1
      ) AS top_leader_title
    FROM orgs o
    LEFT JOIN contacts c  ON c.org_id  = o.id
    LEFT JOIN contracts ct ON ct.org_id = o.id
    WHERE o.is_active = true
    GROUP BY o.id
    ORDER BY o.abs_hierarchy_level NULLS LAST, o.full_name
  `;
  return rows as Array<{
    id: string; name: string;
    organization_type: string | null;
    hq_address: string | null;
    branch: string | null;
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

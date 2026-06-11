import { getDb } from '@/lib/db';
import DiscoverClient from './DiscoverClient';

export const dynamic = 'force-dynamic';

async function getOrgs() {
  const db = getDb();
  const rows = await db`
    SELECT
      o.id,
      o.full_name        AS name,
      o.id               AS slug,
      o.organization_type AS badge_text,
      NULL::text         AS badge_color,
      o.description,
      NULL::text         AS sector,
      o.loc              AS hq_address,
      COUNT(DISTINCT c.id)::int AS contact_count,
      0::int             AS follower_count
    FROM orgs o
    LEFT JOIN contacts c ON c.canonical_org_id = o.id
    WHERE o.is_active = true
    GROUP BY o.id
    ORDER BY o.full_name
  `;
  return rows as Array<{
    id: string; name: string; slug: string;
    badge_text: string | null; badge_color: string | null;
    description: string | null; sector: string | null;
    hq_address: string | null;
    contact_count: number; follower_count: number;
  }>;
}

export default async function Page() {
  const orgs = await getOrgs();
  return <DiscoverClient orgs={orgs} />;
}

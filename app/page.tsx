import { getDb } from '@/lib/db';
import DiscoverClient from './DiscoverClient';

export const dynamic = 'force-dynamic';

async function getOrgs() {
  const db = getDb();
  const rows = await db`
    SELECT
      o.id, o.name, o.slug, o.badge_text, o.badge_color,
      o.description, o.sector, o.hq_address,
      COUNT(DISTINCT p.id)::int AS contact_count,
      COUNT(DISTINCT f.user_id)::int AS follower_count
    FROM organizations o
    LEFT JOIN people p ON p.org_id = o.id
    LEFT JOIN followers f ON f.org_id = o.id
    GROUP BY o.id
    ORDER BY o.name
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

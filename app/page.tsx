export const dynamic = 'force-dynamic';

import { getDb } from '@/lib/db';
import DiscoverClient from './DiscoverClient';

async function getOrgs() {
  const db = getDb();
  const rows = await db`
    SELECT
      o.id, o.name, o.slug, o.sector,
      o.badge_text, o.badge_color,
      o.description, o.hq_address, o.personnel_count,
      COUNT(c.id)::int AS contract_count
    FROM organizations o
    LEFT JOIN contracts c ON c.org_id = o.id
    GROUP BY o.id
    ORDER BY o.name
  `;
  return rows as {
    id: string; name: string; slug: string; sector: string | null;
    badge_text: string | null; badge_color: string | null;
    description: string | null; hq_address: string | null;
    personnel_count: number | null; contract_count: number;
  }[];
}

export default async function DiscoverPage() {
  const orgs = await getOrgs();
  return <DiscoverClient orgs={orgs} />;
}

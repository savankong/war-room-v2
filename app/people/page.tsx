import { getDb } from '@/lib/db';
import PeopleClient from './PeopleClient';

export const dynamic = 'force-dynamic';

async function getPeopleData() {
  const db = getDb();
  const [people, orgs] = await Promise.all([
    db`
      SELECT
        p.id, p.full_name, p.role_title, p.avatar_color, p.avatar_url,
        p.org_id, o.name AS org_name, o.slug AS org_slug,
        o.badge_color AS org_badge_color, o.sector AS org_sector,
        o.hq_address AS org_hq
      FROM people p
      LEFT JOIN organizations o ON o.id = p.org_id
      ORDER BY p.full_name
    `,
    db`SELECT id, name, slug, badge_color, badge_text, sector, hq_address FROM organizations ORDER BY name`,
  ]);
  return { people: people as any[], orgs: orgs as any[] };
}

export default async function PeoplePage() {
  const data = await getPeopleData();
  return <PeopleClient {...data} />;
}

import { getDb } from '@/lib/db';
import PeopleClient from './PeopleClient';

export const dynamic = 'force-dynamic';

async function getPeopleData() {
  const db = getDb();
  const [people, orgs] = await Promise.all([
    db`
      SELECT
        c.id, c.name AS full_name, c.title AS role_title,
        c.color AS avatar_color, c.photo_url AS avatar_url,
        c.canonical_org_id AS org_id,
        o.full_name AS org_name, o.id AS org_slug,
        NULL::text AS org_badge_color, NULL::text AS org_sector,
        o.loc AS org_hq
      FROM contacts c
      LEFT JOIN orgs o ON o.id = c.canonical_org_id
      ORDER BY c.name
    `,
    db`
      SELECT id, full_name AS name, id AS slug,
             NULL::text AS badge_color, organization_type AS badge_text,
             NULL::text AS sector, loc AS hq_address
      FROM orgs WHERE is_active = true ORDER BY full_name
    `,
  ]);
  return { people: people as any[], orgs: orgs as any[] };
}

export default async function PeoplePage() {
  const data = await getPeopleData();
  return <PeopleClient {...data} />;
}

export const dynamic = 'force-dynamic';

import { getDb } from '@/lib/db';
import PeopleClient, { type PersonRow } from './PeopleClient';

async function getPeople(): Promise<PersonRow[]> {
  const db = getDb();
  const rows = await db`
    SELECT
      p.id, p.full_name, p.role_title,
      COALESCE(p.email, p.contact_info->>'email')   AS email,
      COALESCE(p.phone, p.contact_info->>'phone')   AS phone,
      p.avatar_color, p.avatar_url, p.org_id,
      o.name AS org_name,
      COALESCE(p.location, p.contact_info->>'location') AS location,
      COALESCE(
        (SELECT json_agg(t.name ORDER BY t.name)
         FROM team_members tm
         JOIN teams t ON t.id = tm.team_id
         WHERE tm.person_id = p.id),
        '[]'
      ) AS team_names
    FROM people p
    LEFT JOIN organizations o ON o.id = p.org_id
    ORDER BY p.full_name
    LIMIT 1000
  `;
  return (rows as any[]).map((r) => ({
    ...r,
    team_names: Array.isArray(r.team_names) ? r.team_names : [],
  })) as PersonRow[];
}

export default async function PeoplePage() {
  const people = await getPeople();
  return <PeopleClient people={people} />;
}

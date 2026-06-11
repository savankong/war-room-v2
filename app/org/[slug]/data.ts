import { getDb } from '@/lib/db';

export interface OrgProfile {
  id: string;
  name: string;
  slug: string;
  badge_text: string | null;
  badge_color: string | null;
  description: string | null;
  sector: string | null;
  hq_address: string | null;
  personnel_count: number | null;
  follower_count: number;
  contact_count: number;
}

export interface Person {
  id: string;
  manager_id: string | null;
  full_name: string;
  role_title: string | null;
  avatar_url: string | null;
  avatar_color: string | null;
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  members: { id: string; full_name: string; role_title: string | null; avatar_color: string | null }[];
}

export interface Office {
  id: string;
  name: string | null;
  location: string | null;
  lat: number | null;
  lng: number | null;
  members: { id: string; full_name: string; role_title: string | null }[];
}

export interface Contract {
  id: string;
  title: string;
  value: number | null;
  status: string | null;
  signal_type: string | null;
  award_date: string | null;
  source: string;
}

export async function getOrgProfile(slug: string): Promise<OrgProfile | null> {
  const db = getDb();
  const rows = await db`
    SELECT
      o.*,
      COUNT(DISTINCT f.user_id)::int   AS follower_count,
      COUNT(DISTINCT p.id)::int        AS contact_count
    FROM organizations o
    LEFT JOIN followers f ON f.org_id = o.id
    LEFT JOIN people p    ON p.org_id = o.id
    WHERE o.slug = ${slug}
    GROUP BY o.id
  `;
  return rows[0] as OrgProfile ?? null;
}

export async function getOrgPeople(orgId: string): Promise<Person[]> {
  const db = getDb();
  return db`
    SELECT id, manager_id, full_name, role_title, avatar_url, avatar_color
    FROM people
    WHERE org_id = ${orgId}
    ORDER BY full_name
  ` as unknown as Person[];
}

export async function getOrgTeams(orgId: string): Promise<Team[]> {
  const db = getDb();
  const teams = await db`
    SELECT t.id, t.name, t.description,
      json_agg(json_build_object(
        'id', p.id, 'full_name', p.full_name,
        'role_title', p.role_title, 'avatar_color', p.avatar_color
      ) ORDER BY p.full_name) FILTER (WHERE p.id IS NOT NULL) AS members
    FROM teams t
    LEFT JOIN team_members tm ON tm.team_id = t.id
    LEFT JOIN people p        ON p.id = tm.person_id
    WHERE t.org_id = ${orgId}
    GROUP BY t.id
    ORDER BY t.name
  `;
  return teams as unknown as Team[];
}

export async function getOrgOffices(orgId: string): Promise<Office[]> {
  const db = getDb();
  const offices = await db`
    SELECT o.id, o.name, o.location, o.lat, o.lng,
      json_agg(json_build_object(
        'id', p.id, 'full_name', p.full_name, 'role_title', p.role_title
      ) ORDER BY p.full_name) FILTER (WHERE p.id IS NOT NULL) AS members
    FROM offices o
    LEFT JOIN office_members om ON om.office_id = o.id
    LEFT JOIN people p          ON p.id = om.person_id
    WHERE o.org_id = ${orgId}
    GROUP BY o.id
    ORDER BY o.name
  `;
  return offices as unknown as Office[];
}

export async function getOrgContracts(orgId: string): Promise<Contract[]> {
  const db = getDb();
  return db`
    SELECT id, title, value, status, signal_type, award_date, source
    FROM contracts
    WHERE org_id = ${orgId}
    ORDER BY award_date DESC NULLS LAST, created_at DESC
    LIMIT 50
  ` as unknown as Contract[];
}

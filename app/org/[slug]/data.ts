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
  id: string; name: string; description: string | null;
  members: { id: string; full_name: string; role_title: string | null; avatar_color: string | null }[];
}

export interface Office {
  id: string; name: string | null; location: string | null;
  lat: number | null; lng: number | null;
  members: { id: string; full_name: string; role_title: string | null }[];
}

export interface Contract {
  id: string; title: string; value: number | null;
  status: string | null; signal_type: string | null;
  award_date: string | null; source: string;
}

export async function getOrgProfile(slug: string): Promise<OrgProfile | null> {
  const db = getDb();
  const rows = await db`
    SELECT
      o.id,
      o.full_name           AS name,
      o.id                  AS slug,
      o.organization_type   AS badge_text,
      NULL::text            AS badge_color,
      o.description,
      NULL::text            AS sector,
      o.loc                 AS hq_address,
      NULL::int             AS personnel_count,
      0::int                AS follower_count,
      COUNT(DISTINCT c.id)::int AS contact_count
    FROM orgs o
    LEFT JOIN contacts c ON c.canonical_org_id = o.id
    WHERE o.id = ${slug}
    GROUP BY o.id
  `;
  return (rows[0] as OrgProfile) ?? null;
}

export async function getOrgPeople(orgId: string): Promise<Person[]> {
  const db = getDb();
  const rows = await db`
    SELECT
      id,
      NULL::text  AS manager_id,
      name        AS full_name,
      title       AS role_title,
      photo_url   AS avatar_url,
      color       AS avatar_color
    FROM contacts
    WHERE canonical_org_id = ${orgId}
    ORDER BY name
  `;
  return rows as unknown as Person[];
}

export async function getOrgTeams(_orgId: string): Promise<Team[]> {
  return [];
}

export async function getOrgOffices(_orgId: string): Promise<Office[]> {
  return [];
}

export async function getOrgContracts(orgId: string): Promise<Contract[]> {
  const db = getDb();
  const rows = await db`
    SELECT id, title, value::numeric AS value, set_aside AS status,
           signal_type, award_date, source
    FROM contracts
    WHERE org_id = ${orgId}
      AND signal_type IS NOT NULL
    ORDER BY award_date DESC NULLS LAST, created_at DESC
    LIMIT 50
  `;
  return rows as unknown as Contract[];
}

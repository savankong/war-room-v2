import { getDb } from '@/lib/db';

export interface OrgProfile {
  id: string; name: string; slug: string;
  badge_text: string | null; badge_color: string | null;
  description: string | null; sector: string | null;
  hq_address: string | null; personnel_count: number | null;
  follower_count: number; contact_count: number;
  branch: string | null; parent_id: string | null;
  abs_hierarchy_level: number | null;
}

export interface NavOrg {
  id: string; name: string; parent_id: string | null;
  hierarchy_level: number; abs_hierarchy_level: number | null;
  branch: string | null; contract_count: number;
}

export interface ChildOrg {
  id: string; name: string; branch: string | null;
  organization_type: string | null; contact_count: number; contract_count: number;
}

export interface Contact {
  id: string; name: string; title: string | null;
  avatar_color: string | null; photo_url: string | null;
  email: string | null; phone: string | null; linkedin: string | null;
  org_id: string; org_full: string | null;
  tags: string[] | null; opps: number | null; awards: string | null;
  last_signal: string | null; hierarchy_order: number | null;
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
      o.id, o.full_name AS name, o.id AS slug,
      o.organization_type AS badge_text, NULL::text AS badge_color,
      o.description, NULL::text AS sector, o.loc AS hq_address,
      NULL::int AS personnel_count, 0::int AS follower_count,
      COUNT(DISTINCT c.id)::int AS contact_count,
      o.branch, o.parent_id, o.abs_hierarchy_level
    FROM orgs o
    LEFT JOIN contacts c ON c.org_id = o.id
    WHERE o.id = ${slug}
    GROUP BY o.id
  `;
  return (rows[0] as OrgProfile) ?? null;
}

export async function getNavOrgs(): Promise<NavOrg[]> {
  const db = getDb();
  const rows = await db`
    SELECT o.id, o.full_name AS name, o.parent_id,
      COALESCE(o.hierarchy_level, 2)::int AS hierarchy_level,
      o.abs_hierarchy_level,
      o.branch,
      COUNT(DISTINCT ct.id)::int AS contract_count
    FROM orgs o
    LEFT JOIN contracts ct ON ct.org_id = o.id
    WHERE o.is_active = true
    GROUP BY o.id
    ORDER BY o.branch, o.abs_hierarchy_level NULLS LAST, o.hierarchy_level, o.full_name
  `;
  return rows as NavOrg[];
}

export async function getChildOrgs(orgId: string): Promise<ChildOrg[]> {
  const db = getDb();
  const rows = await db`
    SELECT o.id, o.full_name AS name, o.branch, o.organization_type,
      COUNT(DISTINCT c.id)::int  AS contact_count,
      COUNT(DISTINCT ct.id)::int AS contract_count
    FROM orgs o
    LEFT JOIN contacts c   ON c.org_id = o.id
    LEFT JOIN contracts ct ON ct.org_id = o.id
    WHERE o.parent_id = ${orgId} AND o.is_active = true
    GROUP BY o.id
    ORDER BY o.full_name
  `;
  return rows as ChildOrg[];
}

export async function getOrgContacts(orgId: string): Promise<Contact[]> {
  const db = getDb();
  const rows = await db`
    SELECT id, name, title, color AS avatar_color, photo_url,
           email, phone, linkedin, org_id, org_full,
           tags, opps, awards, last_signal, hierarchy_order
    FROM contacts
    WHERE org_id = ${orgId}
    ORDER BY hierarchy_order NULLS LAST, name
    LIMIT 100
  `;
  return rows as Contact[];
}

export async function getOrgContracts(orgId: string): Promise<Contract[]> {
  const db = getDb();
  const rows = await db`
    SELECT id, title, value::numeric AS value, set_aside AS status,
           signal_type, award_date, source
    FROM contracts
    WHERE org_id = ${orgId} AND signal_type IS NOT NULL
    ORDER BY award_date DESC NULLS LAST, created_at DESC
    LIMIT 50
  `;
  return rows as unknown as Contract[];
}

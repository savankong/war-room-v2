/**
 * Row shapes for the admin screen.
 *
 * Each of these mirrors, column for column, one of the SELECTs in
 * `app/(app)/admin/page.tsx`. They are written by hand rather than inferred
 * because the queries go through `getDb()`, which returns `any` — nothing in
 * the chain would catch a column being renamed in SQL but not here, so these
 * are a description of the query, and the query is the thing to check against
 * when a field looks wrong.
 *
 * Every column is optional-or-null where the SQL can produce NULL: LEFT JOINs
 * on `org_types`, and plain nullable columns.
 */

/** One row of the orgs SELECT: orgs LEFT JOIN org_types, with joined counts. */
export interface AdminOrg {
  id: string;
  name: string | null;
  abbreviation: string | null;
  branch: string | null;
  /** ot.name — selected twice under two aliases, both nullable via LEFT JOIN. */
  type: string | null;
  organization_type: string | null;
  description: string | null;
  website: string | null;
  parent_id: string | null;
  is_active: boolean | null;
  loc: string | null;
  abs_hierarchy_level: number | null;
  /** COUNT(DISTINCT c.id)::int */
  contacts: number;
  /** COUNT(DISTINCT ct.id)::int */
  contracts: number;
}

/** One row of the contacts SELECT: contacts LEFT JOIN orgs LEFT JOIN org_types. */
export interface AdminContact {
  id: string;
  name: string | null;
  title: string | null;
  org_id: string | null;
  org_full: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  hierarchy_order: number | null;
  is_inbox: boolean | null;
  tags: string[] | null;
  opps: number | null;
  last_signal: string | null;
  org_type: string | null;
}

/** One row of the contracts SELECT. */
export interface AdminContract {
  id: string;
  title: string | null;
  signal_type: string | null;
  value: string | number | null;
  award_date: string | null;
  org_id: string | null;
  source: string | null;
  /** awardee AS recipient */
  recipient: string | null;
  /** naics_code AS naics */
  naics: string | null;
  description: string | null;
}

export interface AdminStats {
  orgCount: number;
  contactCount: number;
  contractCount: number;
  activeOrgs: number;
}

/** Any row the admin table can display. The screen switches on its `tab`. */
export type AdminRow = AdminOrg | AdminContact | AdminContract;

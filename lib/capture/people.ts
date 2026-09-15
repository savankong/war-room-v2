/**
 * Candidate people — engineering spec §6 and §7.3.
 *
 * "up to 8 candidate people joined on the org lineage" go into the prompt; the
 * model picks at most five for the brief, and every one it names must resolve
 * to a real contacts.id (acceptance criterion 7).
 *
 * Roles the brief cares about (§7): contracting officer, program manager,
 * small business specialist, technical lead. Those are inferred from the
 * title text, because `contacts` has no role column. Inference is explicit and
 * conservative: an unmatched title keeps the person as a candidate with role
 * 'other' rather than being assigned a role we are guessing at.
 */
import type postgres from 'postgres';

type Sql = ReturnType<typeof postgres>;

export type PersonRole =
  | 'contracting_officer'
  | 'program_manager'
  | 'small_business_specialist'
  | 'technical_lead'
  | 'leadership'
  | 'other';

export interface CandidatePerson {
  personId: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  orgId: string | null;
  orgLabel: string | null;
  role: PersonRole;
}

/**
 * Checked in order, so the more specific pattern wins. "Deputy Program
 * Manager" is a program manager; "Contract Specialist" is on the contracting
 * side, not the technical one.
 */
const ROLE_PATTERNS: Array<[RegExp, PersonRole]> = [
  // Any title mentioning small business at all. Inside a DoD org that always
  // means the small business office, and the variants are endless — "Small
  // Business Specialist", "Office of Small Business Programs Director",
  // "Deputy for Small Business". Requiring the role noun to follow "small
  // business" directly sent the OSBP director to `leadership`, which would
  // drop the single most useful contact a small business has at an office.
  [/small\s+business|\bosbp\b/i, 'small_business_specialist'],
  [/contracting\s+officer|\bpco\b|\bkо\b|\bco\b(?![a-z])|contract\s+specialist|procurement\s+(officer|analyst)/i, 'contracting_officer'],
  [/program\s+manager|project\s+manager|\bpm\b|program\s+executive|\bpeo\b|product\s+(manager|lead)/i, 'program_manager'],
  [/chief\s+engineer|technical\s+(lead|director|advisor)|lead\s+engineer|\bcto\b|chief\s+technology/i, 'technical_lead'],
  [/director|commander|deputy|chief|executive/i, 'leadership'],
];

export function inferRole(title: string | null | undefined): PersonRole {
  const text = (title ?? '').trim();
  if (!text) return 'other';
  for (const [pattern, role] of ROLE_PATTERNS) {
    if (pattern.test(text)) return role;
  }
  return 'other';
}

/**
 * Ranking: the roles the brief is built around first, then leadership, then
 * anyone else. Within a role, someone attached to the exact org outranks
 * someone further up the lineage.
 */
const ROLE_RANK: Record<PersonRole, number> = {
  contracting_officer: 0,
  program_manager: 1,
  small_business_specialist: 2,
  technical_lead: 3,
  leadership: 4,
  other: 5,
};

export const MAX_CANDIDATES = 8;

export async function findCandidatePeople(
  sql: Sql,
  orgLineage: string[],
  exactOrgId: string | null,
  limit = MAX_CANDIDATES,
): Promise<CandidatePerson[]> {
  if (!orgLineage.length) return [];

  const rows = await sql<
    {
      id: string;
      name: string | null;
      title: string | null;
      email: string | null;
      phone: string | null;
      canonical_org_id: string | null;
      org_id: string | null;
      org_label: string | null;
    }[]
  >`
    SELECT c.id, c.name, c.title, c.email, c.phone, c.canonical_org_id, c.org_id,
           COALESCE(o.abbreviation, o.full_name, c.org_full) AS org_label
    FROM contacts c
    LEFT JOIN orgs o ON o.id = COALESCE(c.canonical_org_id, c.org_id)
    WHERE COALESCE(c.canonical_org_id, c.org_id) = ANY(${orgLineage})
      AND c.name IS NOT NULL
      AND btrim(c.name) <> ''
    -- Over-fetch: ranking by inferred role happens in TypeScript, and the
    -- roles the brief needs are not always the first rows the database returns.
    LIMIT 200
  `;

  const candidates: CandidatePerson[] = rows.map((r) => ({
    personId: r.id,
    name: r.name!.trim(),
    title: r.title,
    email: r.email,
    phone: r.phone,
    orgId: r.canonical_org_id ?? r.org_id,
    orgLabel: r.org_label,
    role: inferRole(r.title),
  }));

  candidates.sort((a, b) => {
    const roleDelta = ROLE_RANK[a.role] - ROLE_RANK[b.role];
    if (roleDelta !== 0) return roleDelta;

    // Exact-org match beats a lineage match at the same role.
    const aExact = exactOrgId && a.orgId === exactOrgId ? 0 : 1;
    const bExact = exactOrgId && b.orgId === exactOrgId ? 0 : 1;
    if (aExact !== bExact) return aExact - bExact;

    return a.name.localeCompare(b.name);
  });

  return candidates.slice(0, limit);
}

export const ROLE_LABELS: Record<PersonRole, string> = {
  contracting_officer: 'Contracting Officer',
  program_manager: 'Program Manager',
  small_business_specialist: 'Small Business Specialist',
  technical_lead: 'Technical Lead',
  leadership: 'Leadership',
  other: '',
};

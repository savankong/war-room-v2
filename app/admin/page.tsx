import { getDb } from '@/lib/db';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

async function getAdminData() {
  const db = getDb();

  // Idempotent migration
  await db`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_inbox boolean DEFAULT false`;

  const [orgs, contacts, contracts, statsRaw] = await Promise.all([
    db`
      SELECT o.id, o.full_name AS name, o.abbreviation, o.branch,
             o.organization_type AS type, o.organization_type,
             o.description, o.website, o.parent_id,
             o.is_active, o.loc, o.abs_hierarchy_level,
             COUNT(DISTINCT c.id)::int  AS contacts,
             COUNT(DISTINCT ct.id)::int AS contracts
      FROM orgs o
      LEFT JOIN contacts  c  ON c.org_id  = o.id
      LEFT JOIN contracts ct ON ct.org_id = o.id
      GROUP BY o.id ORDER BY o.full_name
    `,
    db`
      SELECT c.id, c.name, c.title, c.org_id, c.org_full,
             c.email, c.phone, c.linkedin,
             c.hierarchy_order, c.is_inbox,
             c.tags, c.opps, c.last_signal
      FROM contacts c
      ORDER BY c.hierarchy_order NULLS LAST, c.name
    `,
    db`
      SELECT id, title, signal_type, value, award_amt, award_date,
             set_aside, org_id, source, recipient,
             poc, poc_email, naics, description, deadline
      FROM contracts
      ORDER BY created_at DESC NULLS LAST
      LIMIT 2000
    `,
    db`
      SELECT
        (SELECT COUNT(*) FROM orgs)::int      AS org_count,
        (SELECT COUNT(*) FROM contacts)::int  AS contact_count,
        (SELECT COUNT(*) FROM contracts)::int AS contract_count,
        (SELECT COUNT(*) FROM orgs WHERE is_active = true)::int AS active_orgs
    `,
  ]);

  const s = statsRaw[0] ?? {};
  return {
    orgs:      orgs      as any[],
    contacts:  contacts  as any[],
    contracts: contracts as any[],
    stats: {
      orgCount:      s.org_count      ?? 0,
      contactCount:  s.contact_count  ?? 0,
      contractCount: s.contract_count ?? 0,
      activeOrgs:    s.active_orgs    ?? 0,
    },
  };
}

export default async function AdminPage() {
  const data = await getAdminData();
  return <AdminClient {...data} />;
}

import { getDb } from '@/lib/db';
import SignalsClient from './SignalsClient';

export const dynamic = 'force-dynamic';

async function getSignalsData() {
  const db = getDb();

  const [contracts, orgs, stats, indStats, [indCompanies, indAgencies]] = await Promise.all([
    // Gov contracts: only contracts linked to gov orgs (branch != 'Industry') or unlinked
    db`
      SELECT
        c.id, c.external_id, c.title, c.value, c.status, c.signal_type,
        COALESCE(c.award_date, c.created_at::date) AS award_date,
        c.source, c.status AS set_aside, NULL::text AS deadline,
        c.canonical_org_id AS org_id, c.awardee AS recipient,
        NULL::numeric AS award_amt,
        c.poc AS poc_name, c.poc_email, c.alt_poc AS alt_poc_name, c.alt_poc_email,
        c.naics_code AS naics, c.agency_or_lab AS sub_agency,
        o.full_name AS org_name, o.id::text AS org_slug,
        o.org_type_id AS badge_text, NULL::text AS badge_color
      FROM contracts c
      LEFT JOIN orgs o ON o.id = c.canonical_org_id
      WHERE c.signal_type IS NOT NULL
        AND (o.id IS NULL OR o.branch IS DISTINCT FROM 'Industry')
      ORDER BY c.created_at DESC NULLS LAST
      LIMIT 10000
    `,
    // Only gov orgs for the Organization filter
    db`
      SELECT id::text, full_name AS name, id::text AS slug, sub
      FROM orgs
      WHERE is_active = true
        AND branch IS DISTINCT FROM 'Industry'
      ORDER BY full_name
    `,
    // Gov stats matching same filter
    db`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE c.signal_type = 'Opportunity')::int AS opps,
        COUNT(*) FILTER (WHERE c.signal_type = 'Award')::int AS awards,
        COALESCE(SUM(c.value) FILTER (WHERE c.signal_type = 'Award'), 0)::bigint AS total_value
      FROM contracts c
      LEFT JOIN orgs o ON o.id = c.canonical_org_id
      WHERE c.signal_type IS NOT NULL
        AND (o.id IS NULL OR o.branch IS DISTINCT FROM 'Industry')
    `,
    // Industry stats (lightweight — no contract rows loaded here)
    db`
      SELECT
        COUNT(*)::int AS total,
        COUNT(DISTINCT o.id)::int AS companies,
        COALESCE(SUM(c.value), 0)::bigint AS total_value
      FROM contracts c
      JOIN orgs o ON o.id = c.canonical_org_id AND o.branch = 'Industry'
      WHERE c.signal_type = 'Award'
    `,
    // Industry filter options: top companies + top agencies
    Promise.all([
      db`
        SELECT o.full_name AS name, COUNT(*)::int AS cnt
        FROM contracts c
        JOIN orgs o ON o.id = c.canonical_org_id AND o.branch = 'Industry'
        WHERE c.signal_type = 'Award'
        GROUP BY o.full_name
        ORDER BY cnt DESC
        LIMIT 20
      `,
      db`
        SELECT c.service_branch AS name, COUNT(*)::int AS cnt
        FROM contracts c
        JOIN orgs o ON o.id = c.canonical_org_id AND o.branch = 'Industry'
        WHERE c.signal_type = 'Award'
          AND c.service_branch IS NOT NULL
        GROUP BY c.service_branch
        ORDER BY cnt DESC
        LIMIT 12
      `,
    ]),
  ]);

  return {
    contracts: contracts as any[],
    orgs: orgs as any[],
    stats: (stats[0] ?? { total: 0, opps: 0, awards: 0, total_value: 0 }) as any,
    indStats: (indStats[0] ?? { total: 0, companies: 0, total_value: 0 }) as any,
    indFilterOptions: {
      companies: (indCompanies as any[]).map(r => [r.name, r.cnt] as [string, number]),
      agencies:  (indAgencies  as any[]).map(r => [r.name, r.cnt] as [string, number]),
    },
  };
}

export default async function SignalsPage() {
  const data = await getSignalsData();
  return <SignalsClient {...data} />;
}

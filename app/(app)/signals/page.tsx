import { getDb } from '@/lib/db';
import SignalsClient from './SignalsClient';

export const dynamic = 'force-dynamic';

const IND_WHERE = `(
  awardee ILIKE 'LOCKHEED MARTIN%'
  OR awardee ILIKE 'THE BOEING COMPANY%'
  OR awardee ILIKE 'BOEING%'
  OR awardee ILIKE '%RAYTHEON%'
  OR awardee ILIKE 'RTX CORPORATION%'
  OR awardee ILIKE 'NORTHROP GRUMMAN%'
  OR awardee ILIKE 'HUNTINGTON INGALLS%'
  OR awardee ILIKE 'GENERAL DYNAMICS%'
  OR awardee ILIKE 'LEIDOS%'
  OR awardee ILIKE 'SCIENCE APPLICATIONS%'
  OR awardee ILIKE 'BAE SYSTEMS%'
  OR awardee ILIKE 'KBR SERVICES%'
  OR awardee ILIKE 'AMENTUM%'
  OR awardee ILIKE 'ELECTRIC BOAT%'
  OR awardee ILIKE 'BATH IRON WORKS%'
  OR awardee ILIKE 'SIKORSKY%'
  OR awardee ILIKE 'GENERAL ATOMICS%'
)`;

async function getSignalsData() {
  const db = getDb();

  const [contracts, orgs, stats, industryContracts, indStats] = await Promise.all([
    db`
      SELECT
        c.id, c.external_id, c.title, c.value, c.status, c.signal_type,
        COALESCE(c.award_date, c.created_at::date) AS award_date,
        c.source, c.status AS set_aside, NULL::text AS deadline, c.canonical_org_id AS org_id, c.awardee AS recipient,
        NULL::numeric AS award_amt, NULL::text AS poc_email, c.naics_code AS naics, c.agency_or_lab AS sub_agency,
        o.full_name AS org_name, o.id::text AS org_slug,
        o.org_type_id AS badge_text, NULL::text AS badge_color
      FROM contracts c
      LEFT JOIN orgs o ON o.id = c.canonical_org_id
      WHERE c.signal_type IS NOT NULL
      ORDER BY c.created_at DESC NULLS LAST
      LIMIT 5000
    `,
    db`SELECT id::text, full_name AS name, id::text AS slug, sub FROM orgs WHERE is_active = true ORDER BY full_name`,
    db`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE signal_type = 'Opportunity')::int AS opps,
        COUNT(*) FILTER (WHERE signal_type = 'Award')::int AS awards,
        0::bigint AS total_value
      FROM contracts
      WHERE signal_type IS NOT NULL
    `,
    db`
      SELECT
        c.id, c.title, NULL::numeric AS award_amt, c.award_date, c.awardee AS recipient,
        c.agency_or_lab AS sub_agency, c.service_branch AS agency, c.naics_code AS naics, c.status AS set_aside, c.source,
        c.canonical_org_id AS org_id, o.full_name AS org_name
      FROM contracts c
      LEFT JOIN orgs o ON o.id = c.canonical_org_id
      WHERE c.signal_type = 'Award'
        AND c.awardee IS NOT NULL
        AND ${db.unsafe(IND_WHERE)}
      ORDER BY c.created_at DESC NULLS LAST
      LIMIT 2000
    `,
    db`
      SELECT
        COUNT(*)::int AS total,
        COUNT(DISTINCT awardee)::int AS companies,
        0::bigint AS total_value
      FROM contracts
      WHERE signal_type = 'Award'
        AND awardee IS NOT NULL
        AND ${db.unsafe(IND_WHERE)}
    `,
  ]);

  return {
    contracts: contracts as any[],
    orgs: orgs as any[],
    stats: (stats[0] ?? { total: 0, opps: 0, awards: 0, total_value: 0 }) as any,
    industryContracts: industryContracts as any[],
    indStats: (indStats[0] ?? { total: 0, companies: 0, total_value: 0 }) as any,
  };
}

export default async function SignalsPage() {
  const data = await getSignalsData();
  return <SignalsClient {...data} />;
}

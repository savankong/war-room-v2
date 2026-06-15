import { getDb } from '@/lib/db';
import SignalsClient from './SignalsClient';

export const revalidate = 300;

const IND_WHERE = `(
  recipient ILIKE 'LOCKHEED MARTIN%'
  OR recipient ILIKE 'THE BOEING COMPANY%'
  OR recipient ILIKE 'BOEING%'
  OR recipient ILIKE '%RAYTHEON%'
  OR recipient ILIKE 'RTX CORPORATION%'
  OR recipient ILIKE 'NORTHROP GRUMMAN%'
  OR recipient ILIKE 'HUNTINGTON INGALLS%'
  OR recipient ILIKE 'GENERAL DYNAMICS%'
  OR recipient ILIKE 'LEIDOS%'
  OR recipient ILIKE 'SCIENCE APPLICATIONS%'
  OR recipient ILIKE 'BAE SYSTEMS%'
  OR recipient ILIKE 'KBR SERVICES%'
  OR recipient ILIKE 'AMENTUM%'
  OR recipient ILIKE 'ELECTRIC BOAT%'
  OR recipient ILIKE 'BATH IRON WORKS%'
  OR recipient ILIKE 'SIKORSKY%'
  OR recipient ILIKE 'GENERAL ATOMICS%'
)`;

async function getSignalsData() {
  const db = getDb();

  const [contracts, orgs, stats, industryContracts, indStats] = await Promise.all([
    db`
      SELECT
        c.id, c.external_id, c.title, c.value, c.set_aside AS status, c.signal_type,
        COALESCE(c.award_date, c.created_at::date) AS award_date,
        c.source, c.set_aside, c.deadline, c.org_id, c.recipient,
        c.award_amt, c.poc_email, c.naics, c.sub_agency,
        o.full_name AS org_name, o.id AS org_slug,
        o.organization_type AS badge_text, NULL::text AS badge_color
      FROM contracts c
      LEFT JOIN orgs o ON o.id = c.org_id
      WHERE c.signal_type IS NOT NULL
      ORDER BY c.created_at DESC NULLS LAST
      LIMIT 5000
    `,
    db`SELECT id, full_name AS name, id AS slug FROM orgs WHERE is_active = true ORDER BY full_name`,
    db`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE signal_type = 'Opportunity')::int AS opps,
        COUNT(*) FILTER (WHERE signal_type = 'Award')::int AS awards,
        COALESCE(SUM(value::numeric) FILTER (WHERE signal_type = 'Award'), 0)::bigint AS total_value
      FROM contracts
      WHERE signal_type IS NOT NULL
    `,
    db`
      SELECT
        c.id, c.title, c.award_amt, c.award_date, c.recipient,
        c.sub_agency, c.agency, c.naics, c.set_aside, c.source,
        c.org_id, o.full_name AS org_name
      FROM contracts c
      LEFT JOIN orgs o ON o.id = c.org_id
      WHERE c.signal_type = 'Award'
        AND c.recipient IS NOT NULL
        AND ${db.unsafe(IND_WHERE)}
      ORDER BY c.award_amt::numeric DESC NULLS LAST
      LIMIT 2000
    `,
    db`
      SELECT
        COUNT(*)::int AS total,
        COUNT(DISTINCT recipient)::int AS companies,
        COALESCE(SUM(award_amt::numeric), 0)::bigint AS total_value
      FROM contracts
      WHERE signal_type = 'Award'
        AND recipient IS NOT NULL
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

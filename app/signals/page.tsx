import { getDb } from '@/lib/db';
import SignalsClient from './SignalsClient';

export const dynamic = 'force-dynamic';

async function getSignalsData() {
  const db = getDb();

  const [contracts, orgs, stats] = await Promise.all([
    db`
      SELECT
        c.id, c.external_id, c.title, c.value, c.status, c.signal_type,
        c.award_date, c.source, c.set_aside, c.deadline, c.org_id,
        o.name AS org_name, o.slug AS org_slug, o.badge_color
      FROM contracts c
      LEFT JOIN organizations o ON o.id = c.org_id
      ORDER BY c.award_date DESC NULLS LAST, c.created_at DESC
      LIMIT 200
    `,
    db`SELECT id, name, slug, badge_color, badge_text FROM organizations ORDER BY name`,
    db`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE signal_type = 'Opportunity')::int AS opps,
        COUNT(*) FILTER (WHERE signal_type = 'Award')::int AS awards,
        COALESCE(SUM(value) FILTER (WHERE signal_type = 'Award'), 0)::bigint AS total_value
      FROM contracts
    `,
  ]);

  return {
    contracts: contracts as any[],
    orgs: orgs as any[],
    stats: (stats[0] ?? { total: 0, opps: 0, awards: 0, total_value: 0 }) as any,
  };
}

export default async function SignalsPage() {
  const data = await getSignalsData();
  return <SignalsClient {...data} />;
}

export const dynamic = 'force-dynamic';

import { getDb } from '@/lib/db';
import SignalsClient, { type Signal } from './SignalsClient';

async function getSignals(): Promise<Signal[]> {
  const db = getDb();
  const rows = await db`
    SELECT
      c.id, c.title, c.signal_type, c.value, c.status,
      c.award_date, c.source, c.org_id,
      c.naics_code, c.psc_code, c.description,
      c.awardee, c.solicitation_number,
      o.name AS org_name
    FROM contracts c
    LEFT JOIN organizations o ON o.id = c.org_id
    ORDER BY c.award_date DESC NULLS LAST, c.created_at DESC
    LIMIT 500
  `;
  return rows as Signal[];
}

export default async function SignalsPage() {
  const signals = await getSignals();
  return <SignalsClient signals={signals} />;
}

import { getDb } from '../../db';
import { startRun, completeRun, failRun } from '../logger';
import { fetchUsaSpendingAwards } from './fetch';
import { transformAward } from './transform';

export async function syncUsaSpending(): Promise<void> {
  const db = getDb();
  const runId = await startRun('usaspending');
  try {
    const awards = await fetchUsaSpendingAwards();
    const rows = awards.map(transformAward);

    for (const row of rows) {
      await db`
        INSERT INTO contracts (external_id, source, title, value, status, signal_type, award_date, raw_payload)
        VALUES (
          ${row.external_id}, ${row.source}, ${row.title}, ${row.value},
          ${row.status}, ${row.signal_type}, ${row.award_date}, ${JSON.stringify(row.raw_payload)}
        )
        ON CONFLICT (external_id)
        DO UPDATE SET
          value       = EXCLUDED.value,
          status      = EXCLUDED.status,
          award_date  = EXCLUDED.award_date,
          raw_payload = EXCLUDED.raw_payload
        WHERE contracts.source != 'manual'
      `;
    }

    await completeRun(runId, rows.length);
    console.log(`USASpending sync complete: ${rows.length} records`);
  } catch (err) {
    await failRun(runId, (err as Error).message);
    throw err;
  }
}

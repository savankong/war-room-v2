import { db } from '../../db';
import { startRun, completeRun, failRun } from '../logger';
import { fetchSamOpportunities } from './fetch';
import { transformOpportunity } from './transform';

export async function syncSamGov(): Promise<void> {
  const runId = await startRun('sam_gov');
  try {
    const opportunities = await fetchSamOpportunities();
    const rows = opportunities.map(transformOpportunity);

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
    console.log(`SAM.gov sync complete: ${rows.length} records`);
  } catch (err) {
    await failRun(runId, (err as Error).message);
    throw err;
  }
}

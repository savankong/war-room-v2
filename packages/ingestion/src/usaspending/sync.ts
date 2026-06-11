import sql from '../../db';
import { startRun, completeRun, failRun } from '../logger';
import { fetchUsaSpendingAwards } from './fetch';
import { transformAward } from './transform';
import { resolveOrgId } from '../org-matcher';

export async function syncUsaSpending(): Promise<void> {
  const runId = await startRun('usaspending');
  try {
    const awards = await fetchUsaSpendingAwards();
    const rows = await Promise.all(
      awards.map(async (award) => {
        const row = transformAward(award);
        row.org_id = await resolveOrgId(row.awarding_agency);
        return row;
      })
    );

    for (const row of rows) {
      await sql`
        INSERT INTO contracts (external_id, source, title, value, status, signal_type, award_date, raw_payload, org_id)
        VALUES (
          ${row.external_id}, ${row.source}, ${row.title}, ${row.value},
          ${row.status}, ${row.signal_type}, ${row.award_date},
          ${JSON.stringify(row.raw_payload)}, ${row.org_id}
        )
        ON CONFLICT (external_id)
        DO UPDATE SET
          value       = EXCLUDED.value,
          status      = EXCLUDED.status,
          award_date  = EXCLUDED.award_date,
          raw_payload = EXCLUDED.raw_payload,
          org_id      = COALESCE(EXCLUDED.org_id, contracts.org_id)
        WHERE contracts.source != 'manual'
      `;
    }

    const linked = rows.filter((r) => r.org_id).length;
    await completeRun(runId, rows.length);
    console.log(`USASpending sync complete: ${rows.length} records (${linked} linked to orgs)`);
  } catch (err) {
    await failRun(runId, (err as Error).message);
    throw err;
  }
}

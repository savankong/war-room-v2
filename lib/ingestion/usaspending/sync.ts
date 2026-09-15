/**
 * USASpending awards sync — engineering spec §4, "existing pipeline ports over
 * as is".
 *
 * Three changes made during the port, all mechanical:
 *
 *  1. Takes its `sql` handle as a parameter instead of calling getDb() itself,
 *     so the worker can hand it a connection it owns and close it on shutdown.
 *  2. Uses run-log's per-outcome counters rather than logger's single total.
 *  3. Writes the period-of-performance, vehicle, obligation and modification
 *     columns added in migration 052. Incumbent detection (§6) and the
 *     contract_expiring job (§4) both need end_date, and nothing populated it
 *     before.
 */
import type postgres from 'postgres';
import { startRun, completeRun, failRun, emptyCounters, type RunCounters } from '../run-log';
import { fetchUsaSpendingAwards } from './fetch';
import { transformAward } from './transform';

type Sql = ReturnType<typeof postgres>;

export interface UsaSpendingSyncResult extends RunCounters {
  runId: string | null;
  fetched: number;
}

export async function syncUsaSpending(sql: Sql): Promise<UsaSpendingSyncResult> {
  const counters = emptyCounters();
  const runId = await startRun(sql, 'usaspending');
  let fetched = 0;

  try {
    const awards = await fetchUsaSpendingAwards();
    fetched = awards.length;

    for (const award of awards) {
      try {
        const row = transformAward(award);

        const result = await sql<{ inserted: boolean }[]>`
          INSERT INTO contracts (
            id, external_id, source, title, value, status, signal_type,
            award_date, raw_payload, start_date, end_date, psc_code, naics_code,
            vehicle, total_obligation, modification_count, recipient, recipient_uei
          ) VALUES (
            ${row.external_id}, ${row.external_id}, ${row.source}, ${row.title},
            ${row.value}, ${row.status}, ${row.signal_type}, ${row.award_date},
            ${sql.json(row.raw_payload as never)}, ${row.start_date}, ${row.end_date},
            ${row.psc_code}, ${row.naics_code}, ${row.vehicle}, ${row.total_obligation},
            ${row.modification_count}, ${row.recipient}, ${row.recipient_uei}
          )
          ON CONFLICT (id) DO UPDATE SET
            value              = EXCLUDED.value,
            status             = EXCLUDED.status,
            award_date         = EXCLUDED.award_date,
            raw_payload        = EXCLUDED.raw_payload,
            start_date         = COALESCE(EXCLUDED.start_date, contracts.start_date),
            end_date           = COALESCE(EXCLUDED.end_date, contracts.end_date),
            psc_code           = COALESCE(EXCLUDED.psc_code, contracts.psc_code),
            naics_code         = COALESCE(EXCLUDED.naics_code, contracts.naics_code),
            vehicle            = COALESCE(EXCLUDED.vehicle, contracts.vehicle),
            total_obligation   = COALESCE(EXCLUDED.total_obligation, contracts.total_obligation),
            modification_count = COALESCE(EXCLUDED.modification_count, contracts.modification_count),
            recipient          = COALESCE(EXCLUDED.recipient, contracts.recipient),
            recipient_uei      = COALESCE(EXCLUDED.recipient_uei, contracts.recipient_uei)
          -- Convention carried forward from v2: a manually curated row is
          -- never overwritten by an ingestion upsert.
          WHERE contracts.source IS DISTINCT FROM 'manual'
          RETURNING (xmax = 0) AS inserted
        `;

        if (!result.length) counters.skipped++;
        else counters[result[0].inserted ? 'inserted' : 'updated']++;
      } catch (err) {
        counters.errored++;
        console.error(`  award ${award?.generated_internal_id ?? '?'}: ${(err as Error).message}`);
      }
    }

    await completeRun(sql, runId, counters);
    console.log(
      `USASpending: ${counters.inserted} inserted, ${counters.updated} updated, ` +
        `${counters.skipped} skipped, ${counters.errored} errored`,
    );
  } catch (err) {
    await failRun(sql, runId, (err as Error).message, counters);
    throw err;
  }

  return { ...counters, runId, fetched };
}

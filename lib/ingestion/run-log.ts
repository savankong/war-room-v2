/**
 * Ingestion run logging — engineering spec §4.
 *
 * "Log every run to ingestion_runs with inserted, updated, skipped, errored
 *  counts."
 *
 * Replaces lib/ingestion/logger.ts, which only recorded a single
 * records_synced total. Acceptance criterion 2 ("re-running the same day
 * produces zero duplicate rows") is checked by reading inserted_count on the
 * second run, which the old shape could not express.
 */
import type postgres from 'postgres';

type Sql = ReturnType<typeof postgres>;

export interface RunCounters {
  inserted: number;
  updated: number;
  skipped: number;
  errored: number;
  unresolvedOrg: number;
}

export function emptyCounters(): RunCounters {
  return { inserted: 0, updated: 0, skipped: 0, errored: 0, unresolvedOrg: 0 };
}

export async function startRun(sql: Sql, source: string): Promise<string> {
  const rows = await sql<{ id: string }[]>`
    INSERT INTO ingestion_runs (source, status)
    VALUES (${source}, 'running')
    RETURNING id
  `;
  return rows[0].id;
}

export async function completeRun(sql: Sql, id: string, counters: RunCounters): Promise<void> {
  const total = counters.inserted + counters.updated;
  await sql`
    UPDATE ingestion_runs SET
      status               = 'success',
      records_synced       = ${total},
      inserted_count       = ${counters.inserted},
      updated_count        = ${counters.updated},
      skipped_count        = ${counters.skipped},
      errored_count        = ${counters.errored},
      unresolved_org_count = ${counters.unresolvedOrg},
      completed_at         = now()
    WHERE id = ${id}
  `;
}

export async function failRun(
  sql: Sql,
  id: string,
  error: string,
  counters: RunCounters = emptyCounters(),
): Promise<void> {
  await sql`
    UPDATE ingestion_runs SET
      status               = 'failed',
      error_log            = ${error.slice(0, 4000)},
      inserted_count       = ${counters.inserted},
      updated_count        = ${counters.updated},
      skipped_count        = ${counters.skipped},
      errored_count        = ${counters.errored},
      unresolved_org_count = ${counters.unresolvedOrg},
      completed_at         = now()
    WHERE id = ${id}
  `;
}

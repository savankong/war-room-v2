import { db } from '../db';

export async function startRun(source: 'sam_gov' | 'usaspending'): Promise<string> {
  const rows = await db`
    INSERT INTO ingestion_runs (source, status)
    VALUES (${source}, 'running')
    RETURNING id
  `;
  return rows[0].id as string;
}

export async function completeRun(id: string, recordsSynced: number): Promise<void> {
  await db`
    UPDATE ingestion_runs
    SET status = 'success', records_synced = ${recordsSynced}, completed_at = now()
    WHERE id = ${id}
  `;
}

export async function failRun(id: string, errorMessage: string): Promise<void> {
  await db`
    UPDATE ingestion_runs
    SET status = 'failed', error_log = ${errorMessage}, completed_at = now()
    WHERE id = ${id}
  `;
}

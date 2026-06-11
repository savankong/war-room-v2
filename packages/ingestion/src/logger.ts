import sql from '../db';

export async function startRun(source: 'sam_gov' | 'usaspending'): Promise<string> {
  const rows = await sql`
    INSERT INTO ingestion_runs (source, status)
    VALUES (${source}, 'running')
    RETURNING id
  `;
  return rows[0].id as string;
}

export async function completeRun(id: string, recordsSynced: number): Promise<void> {
  await sql`
    UPDATE ingestion_runs
    SET status = 'success', records_synced = ${recordsSynced}, completed_at = now()
    WHERE id = ${id}
  `;
}

export async function failRun(id: string, errorMessage: string): Promise<void> {
  await sql`
    UPDATE ingestion_runs
    SET status = 'failed', error_log = ${errorMessage}, completed_at = now()
    WHERE id = ${id}
  `;
}

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * Health check for the DO App Platform service (.do/app.yaml health_check).
 *
 * Touches the database on purpose: a web container that cannot reach Postgres
 * serves errors on every page, and a health check that only proves Node is
 * running would keep it in rotation.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sql = getDb();
    await sql`SELECT 1`;
    return NextResponse.json({ ok: true, database: 'up' });
  } catch (err) {
    return NextResponse.json(
      { ok: false, database: 'down', error: (err as Error).message },
      { status: 503 },
    );
  }
}

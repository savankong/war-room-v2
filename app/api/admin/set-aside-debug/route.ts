import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Debug: show distinct set_aside values in contracts table
export async function GET() {
  const db = getDb();
  const rows = await db`
    SELECT set_aside, COUNT(*)::int AS cnt, source
    FROM contracts
    WHERE set_aside IS NOT NULL
    GROUP BY set_aside, source
    ORDER BY cnt DESC
    LIMIT 200
  `;
  return NextResponse.json(rows);
}

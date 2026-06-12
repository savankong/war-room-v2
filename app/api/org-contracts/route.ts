import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get('orgId');
  if (!orgId) return NextResponse.json([], { status: 400 });

  const db = getDb();
  const rows = await db`
    SELECT
      id, title, signal_type, value, award_date, award_amt,
      recipient, poc_email, set_aside, source
    FROM contracts
    WHERE org_id = ${orgId}
      AND title IS NOT NULL
    ORDER BY
      award_date DESC NULLS LAST,
      created_at DESC NULLS LAST
    LIMIT 30
  `;
  return NextResponse.json(rows);
}

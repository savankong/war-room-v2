import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const revalidate = 300;

export async function GET(req: NextRequest) {
  const recipient = req.nextUrl.searchParams.get('recipient');
  if (!recipient) return NextResponse.json([], { status: 400 });

  const db = getDb();
  const rows = await db`
    SELECT
      c.id, c.title, c.signal_type, c.source,
      c.value, c.award_amt, c.award_date, c.set_aside,
      c.org_id, c.naics, c.poc_email, c.description,
      o.full_name AS org_name
    FROM contracts c
    LEFT JOIN orgs o ON o.id = c.org_id
    WHERE c.recipient = ${recipient}
      AND c.signal_type IS NOT NULL
    ORDER BY c.award_amt DESC NULLS LAST, c.created_at DESC
    LIMIT 200
  `;
  return NextResponse.json(rows);
}

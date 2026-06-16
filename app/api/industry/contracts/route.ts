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
      c.value, c.award_date, c.status,
      c.org_id, c.naics_code, c.description,
      o.full_name AS org_name
    FROM contracts c
    LEFT JOIN orgs o ON o.id = c.org_id::text
    WHERE c.awardee = ${recipient}
      AND c.signal_type IS NOT NULL
    ORDER BY c.value DESC NULLS LAST, c.created_at DESC
    LIMIT 200
  `;
  return NextResponse.json(rows);
}

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prime = searchParams.get('prime');
  if (!prime) return NextResponse.json({ error: 'prime required' }, { status: 400 });

  const db = getDb();

  const rows = await db`
    SELECT sub_name, total_amount, award_count, description, latest_date
    FROM sub_awards
    WHERE prime_legal_name = ${prime}
    ORDER BY total_amount DESC NULLS LAST
    LIMIT 100
  `;

  return NextResponse.json(rows);
}

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prime = searchParams.get('prime');
  const sub   = searchParams.get('sub');

  if (!prime && !sub) return NextResponse.json({ error: 'prime or sub required' }, { status: 400 });

  const db = getDb();

  if (prime) {
    const rows = await db`
      SELECT sub_name, total_amount, award_count, description, latest_date
      FROM sub_awards
      WHERE prime_legal_name = ${prime}
      ORDER BY total_amount DESC NULLS LAST
      LIMIT 100
    `;
    return NextResponse.json(rows);
  }

  /* Look up all primes that awarded to this sub */
  const rows = await db`
    SELECT prime_legal_name, total_amount, award_count, latest_date
    FROM sub_awards
    WHERE sub_name = ${sub!}
    ORDER BY total_amount DESC NULLS LAST
  `;
  return NextResponse.json(rows);
}

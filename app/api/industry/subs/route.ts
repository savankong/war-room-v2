import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();

  const rows = await db`
    SELECT
      sa.sub_name                                     AS name,
      sc.id,
      sc.name                                         AS display_name,
      sc.logo_url,
      sc.website,
      sc.headquarters,
      sc.description,
      COUNT(DISTINCT sa.prime_legal_name)::int        AS prime_count,
      SUM(sa.total_amount)::bigint                    AS total_value,
      SUM(sa.award_count)::int                        AS award_count,
      ARRAY_AGG(DISTINCT sa.prime_legal_name
        ORDER BY sa.prime_legal_name)                 AS prime_names
    FROM sub_awards sa
    LEFT JOIN sub_companies sc ON sc.legal_name = sa.sub_name
    GROUP BY sa.sub_name, sc.id, sc.name, sc.logo_url, sc.website, sc.headquarters, sc.description
    ORDER BY total_value DESC NULLS LAST
  `;

  return NextResponse.json(rows);
}

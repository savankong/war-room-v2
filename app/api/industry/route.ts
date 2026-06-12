import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const revalidate = 600;

export async function GET() {
  const db = getDb();

  const rows = await db`
    SELECT
      c.recipient                                              AS name,
      ic.name                                                  AS display_name,
      ic.legal_name,
      ic.logo_url,
      ic.ticker,
      ic.headquarters,
      ic.website,
      ic.description,
      COUNT(*)::int                                            AS contract_count,
      SUM(c.award_amt)::bigint                                 AS total_value,
      COUNT(*) FILTER (WHERE c.set_aside IS NOT NULL)::int     AS set_aside_count,
      ARRAY_AGG(DISTINCT COALESCE(c.sub_agency, c.agency))
        FILTER (WHERE COALESCE(c.sub_agency, c.agency) IS NOT NULL) AS agencies,
      ARRAY_AGG(DISTINCT c.source)                             AS sources
    FROM contracts c
    LEFT JOIN industry_companies ic ON ic.legal_name = c.recipient
    WHERE c.recipient IS NOT NULL
      AND c.signal_type = 'Award'
      AND c.award_amt   > 0
    GROUP BY c.recipient, ic.name, ic.logo_url, ic.ticker, ic.headquarters, ic.website, ic.description
    ORDER BY total_value DESC NULLS LAST
    LIMIT 500
  `;

  return NextResponse.json(rows);
}

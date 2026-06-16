import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();

  const rows = await db`
    SELECT
      c.awardee                                                AS name,
      ic.name                                                  AS display_name,
      ic.legal_name,
      ic.logo_url,
      ic.ticker,
      ic.headquarters,
      ic.website,
      ic.description,
      ic.employees,
      ic.revenue_b,
      ic.focus_areas,
      COUNT(*)::int                                            AS contract_count,
      SUM(c.value)::bigint                                     AS total_value,
      COUNT(*) FILTER (WHERE c.status IS NOT NULL)::int        AS set_aside_count,
      ARRAY_AGG(DISTINCT COALESCE(c.agency_or_lab, c.service_branch))
        FILTER (WHERE COALESCE(c.agency_or_lab, c.service_branch) IS NOT NULL) AS agencies,
      ARRAY_AGG(DISTINCT c.source)                             AS sources,
      NULL::text                                               AS sbir_phase,
      NULL::text[]                                             AS sbir_capabilities,
      NULL::text[]                                             AS sbir_designations,
      NULL::int                                                AS sbir_award_count
    FROM contracts c
    LEFT JOIN industry_companies ic ON ic.legal_name = c.awardee
    WHERE c.awardee IS NOT NULL
      AND c.signal_type = 'Award'
      AND c.value > 0
    GROUP BY c.awardee, ic.name, ic.legal_name, ic.logo_url, ic.ticker,
             ic.headquarters, ic.website, ic.description, ic.employees, ic.revenue_b, ic.focus_areas
    ORDER BY total_value DESC NULLS LAST
    LIMIT 500
  `;

  return NextResponse.json(rows);
}

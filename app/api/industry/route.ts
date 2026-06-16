import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();

  const rows = await db`
    SELECT * FROM (

      /* ── Known major primes (from industry_companies catalog) ── */
      SELECT
        ic.legal_name                                          AS name,
        ic.name                                                AS display_name,
        ic.legal_name,
        ic.logo_url,
        ic.ticker,
        ic.headquarters,
        ic.website,
        ic.description,
        ic.employees,
        ic.revenue_b,
        ic.focus_areas,
        COALESCE(agg.contract_count, 0)::int                   AS contract_count,
        COALESCE(agg.total_value,
          ROUND((ic.dod_contract_value_b * 1e9)::numeric))::bigint AS total_value,
        COALESCE(agg.set_aside_count, 0)::int                  AS set_aside_count,
        COALESCE(agg.agencies, ARRAY[]::text[])                AS agencies,
        ARRAY['usaspending']::text[]                           AS sources,
        NULL::text                                             AS sbir_phase,
        NULL::text[]                                           AS sbir_capabilities,
        NULL::text[]                                           AS sbir_designations,
        NULL::int                                              AS sbir_award_count
      FROM industry_companies ic
      LEFT JOIN (
        SELECT
          c.awardee,
          COUNT(*)::int                                            AS contract_count,
          SUM(c.value)::bigint                                     AS total_value,
          COUNT(*) FILTER (WHERE c.status IS NOT NULL)::int        AS set_aside_count,
          ARRAY_AGG(DISTINCT COALESCE(c.agency_or_lab, c.service_branch))
            FILTER (WHERE COALESCE(c.agency_or_lab, c.service_branch) IS NOT NULL) AS agencies
        FROM contracts c
        WHERE c.awardee IS NOT NULL AND c.signal_type = 'Award' AND c.value > 0
        GROUP BY c.awardee
      ) agg ON agg.awardee = ic.legal_name

      UNION ALL

      /* ── All other awardees not in the catalog ── */
      SELECT
        c.awardee                                              AS name,
        NULL::text                                             AS display_name,
        NULL::text                                             AS legal_name,
        NULL::text                                             AS logo_url,
        NULL::text                                             AS ticker,
        NULL::text                                             AS headquarters,
        NULL::text                                             AS website,
        NULL::text                                             AS description,
        NULL::int                                              AS employees,
        NULL::numeric                                          AS revenue_b,
        NULL::text[]                                           AS focus_areas,
        COUNT(*)::int                                          AS contract_count,
        SUM(c.value)::bigint                                   AS total_value,
        COUNT(*) FILTER (WHERE c.status IS NOT NULL)::int      AS set_aside_count,
        ARRAY_AGG(DISTINCT COALESCE(c.agency_or_lab, c.service_branch))
          FILTER (WHERE COALESCE(c.agency_or_lab, c.service_branch) IS NOT NULL) AS agencies,
        ARRAY_AGG(DISTINCT c.source)                           AS sources,
        NULL::text                                             AS sbir_phase,
        NULL::text[]                                           AS sbir_capabilities,
        NULL::text[]                                           AS sbir_designations,
        NULL::int                                              AS sbir_award_count
      FROM contracts c
      WHERE c.awardee IS NOT NULL
        AND c.signal_type = 'Award'
        AND c.value > 0
        AND NOT EXISTS (SELECT 1 FROM industry_companies ic WHERE ic.legal_name = c.awardee)
      GROUP BY c.awardee

    ) combined
    ORDER BY total_value DESC NULLS LAST
    LIMIT 500
  `;

  return NextResponse.json(rows);
}

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();

  const rows = await db`
    SELECT
      c.awardee                                                AS name,
      NULL::text                                               AS display_name,
      NULL::text                                               AS legal_name,
      NULL::text                                               AS logo_url,
      NULL::text                                               AS ticker,
      NULL::text                                               AS headquarters,
      NULL::text                                               AS website,
      NULL::text                                               AS description,
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
    WHERE c.awardee IS NOT NULL
      AND c.signal_type = 'Award'
      AND c.value > 0
    GROUP BY c.awardee
    ORDER BY total_value DESC NULLS LAST
    LIMIT 500
  `;

  return NextResponse.json(rows);
}

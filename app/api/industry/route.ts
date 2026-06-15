import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();

  const rows = await db`
    SELECT * FROM (
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
        ARRAY_AGG(DISTINCT c.source)                             AS sources,
        o.sbir_phase,
        o.sbir_capabilities,
        o.sbir_designations,
        o.sbir_award_count
      FROM contracts c
      LEFT JOIN industry_companies ic ON ic.legal_name = c.recipient
      LEFT JOIN orgs o ON LOWER(o.full_name) = LOWER(c.recipient) AND o.sbir_phase IS NOT NULL
      WHERE c.recipient IS NOT NULL
        AND c.signal_type = 'Award'
        AND c.award_amt   > 0
      GROUP BY c.recipient, ic.name, ic.legal_name, ic.logo_url, ic.ticker, ic.headquarters, ic.website, ic.description, o.sbir_phase, o.sbir_capabilities, o.sbir_designations, o.sbir_award_count
      ORDER BY total_value DESC NULLS LAST
      LIMIT 500
    ) primes

    UNION ALL

    SELECT
      o.full_name                                              AS name,
      NULL                                                     AS display_name,
      NULL                                                     AS legal_name,
      NULL                                                     AS logo_url,
      NULL                                                     AS ticker,
      NULLIF(CONCAT_WS(', ', o.sbir_city, o.sbir_state), '') AS headquarters,
      o.sbir_website                                           AS website,
      o.description                                            AS description,
      o.sbir_award_count                                       AS contract_count,
      (SELECT SUM(award_amount) FROM sbir_awards sa WHERE sa.org_id = o.id)::bigint AS total_value,
      0                                                        AS set_aside_count,
      ARRAY(SELECT DISTINCT agency FROM sbir_awards sa WHERE sa.org_id = o.id AND agency IS NOT NULL) AS agencies,
      ARRAY['SBIR']                                            AS sources,
      o.sbir_phase,
      o.sbir_capabilities,
      o.sbir_designations,
      o.sbir_award_count
    FROM orgs o
    WHERE o.organization_type = 'sbir_company'
  `;

  return NextResponse.json(rows);
}

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

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
      ARRAY_AGG(DISTINCT c.source)                             AS sources,
      (SELECT ARRAY_REMOVE(ARRAY_AGG(DISTINCT tag), NULL)
       FROM contracts c2
       CROSS JOIN LATERAL (VALUES
         (CASE WHEN c2.set_aside ILIKE '%SBIR%Phase I%' OR c2.set_aside ILIKE '%Phase I%SBIR%' OR c2.set_aside = 'PI' THEN 'SBIR I' END),
         (CASE WHEN c2.set_aside ILIKE '%SBIR%Phase II%' OR c2.set_aside ILIKE '%Phase II%SBIR%' OR c2.set_aside = 'PII' THEN 'SBIR II' END),
         (CASE WHEN c2.set_aside ILIKE '%SBIR%' THEN 'SBIR' END),
         (CASE WHEN c2.set_aside ILIKE '%STTR%' THEN 'STTR' END),
         (CASE WHEN c2.set_aside ILIKE '%8(a)%' OR c2.set_aside ILIKE '%8A%' OR c2.set_aside ILIKE '%Sole Source 8%' THEN '8(a)' END),
         (CASE WHEN c2.set_aside ILIKE '%WOSB%' OR c2.set_aside ILIKE '%Women-Owned%' OR c2.set_aside ILIKE '%Women Owned%' THEN 'WOSB' END),
         (CASE WHEN c2.set_aside ILIKE '%HUBZone%' THEN 'HUBZone' END),
         (CASE WHEN c2.set_aside ILIKE '%SDVOSB%' OR c2.set_aside ILIKE '%Service-Disabled%' OR c2.set_aside ILIKE '%Service Disabled%' THEN 'SDVOSB' END),
         (CASE WHEN c2.set_aside ILIKE '%SDB%' OR c2.set_aside ILIKE '%Small Disadvantaged%' THEN 'SDB' END)
       ) AS t(tag)
       WHERE c2.recipient = c.recipient AND c2.set_aside IS NOT NULL
      )                                                        AS set_aside_tags
    FROM contracts c
    LEFT JOIN industry_companies ic ON ic.legal_name = c.recipient
    WHERE c.recipient IS NOT NULL
      AND c.source IN ('sam_gov', 'usaspending')
    GROUP BY c.recipient, ic.name, ic.legal_name, ic.logo_url, ic.ticker, ic.headquarters, ic.website, ic.description
    ORDER BY total_value DESC NULLS LAST
    LIMIT 500
  `;

  return NextResponse.json(rows);
}

import { NextResponse } from 'next/server';
import { getDb, getWriteDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const readDb  = getDb();       // Neon read-only: has contracts, orgs
  const writeDb = getWriteDb();  // Owner DB: has industry_companies

  // Fetch in parallel: catalog from write DB, contract aggregates from read DB
  const [catalog, contractAggs, otherAwardees] = await Promise.all([
    writeDb`
      SELECT id, legal_name, name, logo_url, ticker, headquarters, website,
             description, employees, revenue_b, focus_areas, dod_contract_value_b
      FROM industry_companies
    `,
    readDb`
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
    `,
    readDb`
      SELECT
        c.awardee                                              AS name,
        COUNT(*)::int                                          AS contract_count,
        SUM(c.value)::bigint                                   AS total_value,
        COUNT(*) FILTER (WHERE c.status IS NOT NULL)::int      AS set_aside_count,
        ARRAY_AGG(DISTINCT COALESCE(c.agency_or_lab, c.service_branch))
          FILTER (WHERE COALESCE(c.agency_or_lab, c.service_branch) IS NOT NULL) AS agencies,
        ARRAY_AGG(DISTINCT c.source)                           AS sources
      FROM contracts c
      WHERE c.awardee IS NOT NULL
        AND c.signal_type = 'Award'
        AND c.value > 0
      GROUP BY c.awardee
    `,
  ]);

  // Build a lookup map of contract aggregates by awardee name
  const aggMap = new Map<string, any>();
  for (const row of contractAggs) aggMap.set(row.awardee, row);

  // Build set of known prime legal names for exclusion
  const primeNames = new Set(catalog.map((ic: any) => ic.legal_name));

  // Arm 1: known primes merged with contract data
  const primes = catalog.map((ic: any) => {
    const agg = aggMap.get(ic.legal_name);
    return {
      name:            ic.legal_name,
      display_name:    ic.name,
      legal_name:      ic.legal_name,
      logo_url:        ic.logo_url,
      ticker:          ic.ticker,
      headquarters:    ic.headquarters,
      website:         ic.website,
      description:     ic.description,
      employees:       ic.employees,
      revenue_b:       ic.revenue_b,
      focus_areas:     ic.focus_areas,
      contract_count:  agg?.contract_count  ?? 0,
      total_value:     agg?.total_value     ?? Math.round((ic.dod_contract_value_b ?? 0) * 1e9),
      set_aside_count: agg?.set_aside_count ?? 0,
      agencies:        agg?.agencies        ?? [],
      sources:         ['usaspending'],
      sbir_phase:      null,
      sbir_capabilities:  null,
      sbir_designations:  null,
      sbir_award_count:   null,
    };
  });

  // Arm 2: other awardees not in catalog
  const others = otherAwardees
    .filter((r: any) => !primeNames.has(r.name))
    .map((r: any) => ({
      name:            r.name,
      display_name:    null,
      legal_name:      null,
      logo_url:        null,
      ticker:          null,
      headquarters:    null,
      website:         null,
      description:     null,
      employees:       null,
      revenue_b:       null,
      focus_areas:     null,
      contract_count:  r.contract_count,
      total_value:     r.total_value,
      set_aside_count: r.set_aside_count,
      agencies:        r.agencies ?? [],
      sources:         r.sources  ?? [],
      sbir_phase:      null,
      sbir_capabilities:  null,
      sbir_designations:  null,
      sbir_award_count:   null,
    }));

  const combined = [...primes, ...others]
    .sort((a, b) => (Number(b.total_value) || 0) - (Number(a.total_value) || 0))
    .slice(0, 500);

  return NextResponse.json(combined);
}

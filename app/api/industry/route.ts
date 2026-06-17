import { NextResponse } from 'next/server';
import { getDb, getWriteDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const readDb  = getDb();       // Neon read-only: has contracts, orgs
  const writeDb = getWriteDb();  // Owner DB: has industry_companies

  // Fetch in parallel: catalog from write DB, contract aggregates from read DB,
  // and industry orgs seeded directly to orgs table (e.g. Granicus)
  const [catalog, contractAggs, otherAwardees, industryOrgs] = await Promise.all([
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
    // Arm 3: orgs seeded directly with branch='Industry' (e.g. Granicus)
    readDb`
      SELECT
        o.id, o.full_name AS legal_name, o.full_name AS display_name,
        o.loc AS headquarters, o.website, o.profile,
        COUNT(c.id)::int                                                          AS contract_count,
        COALESCE(SUM(c.value) FILTER (WHERE c.value > 0), 0)::bigint             AS total_value,
        ARRAY_AGG(DISTINCT COALESCE(c.agency_or_lab, c.service_branch))
          FILTER (WHERE COALESCE(c.agency_or_lab, c.service_branch) IS NOT NULL) AS agencies,
        ARRAY_AGG(DISTINCT c.source) FILTER (WHERE c.source IS NOT NULL)         AS sources
      FROM orgs o
      LEFT JOIN contracts c ON c.canonical_org_id = o.id AND c.signal_type = 'Award'
      WHERE o.branch = 'Industry'
      GROUP BY o.id, o.full_name, o.loc, o.website, o.profile
    `,
  ]);

  // Build a lookup map of contract aggregates by awardee name
  const aggMap = new Map<string, any>();
  for (const row of contractAggs) aggMap.set(row.awardee, row);

  // Build case-insensitive sets of known names for deduplication
  const primeNamesLower   = new Set(catalog.map((ic: any) => (ic.legal_name ?? '').toLowerCase()));
  const orgLegalNamesLower = new Set((industryOrgs as any[]).map((o: any) => (o.legal_name ?? '').toLowerCase()));

  // Arm 1: known catalog primes merged with contract data
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
      profile:         null,
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

  // Arm 2: industry orgs from orgs table not already in catalog
  const orgRows = (industryOrgs as any[])
    .filter((o: any) => !primeNamesLower.has((o.legal_name ?? '').toLowerCase()))
    .map((o: any) => ({
      name:            o.legal_name,
      display_name:    o.display_name,
      legal_name:      o.legal_name,
      logo_url:        o.profile?.logo_url ?? null,
      ticker:          null,
      headquarters:    o.headquarters,
      website:         o.website,
      description:     o.profile?.full_description ?? null,
      employees:       null,
      revenue_b:       null,
      focus_areas:     null,
      profile:         o.profile ?? null,
      contract_count:  o.contract_count,
      total_value:     o.total_value,
      set_aside_count: 0,
      agencies:        o.agencies ?? [],
      sources:         o.sources  ?? [],
      sbir_phase:      null,
      sbir_capabilities:  null,
      sbir_designations:  null,
      sbir_award_count:   null,
    }));

  // Arm 3: other awardees not in catalog or orgs table (case-insensitive dedup)
  const others = (otherAwardees as any[])
    .filter((r: any) => !primeNamesLower.has((r.name ?? '').toLowerCase()) && !orgLegalNamesLower.has((r.name ?? '').toLowerCase()))
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
      profile:         null,
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

  const combined = [...primes, ...orgRows, ...others]
    .sort((a, b) => (Number(b.total_value) || 0) - (Number(a.total_value) || 0));

  return NextResponse.json(combined);
}

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const TIERS: Record<string, { min: number; max: number | null }> = {
  '$1B+':         { min: 1_000_000_000, max: null },
  '$100M – $1B':  { min: 100_000_000,   max: 1_000_000_000 },
  '$10M – $100M': { min: 10_000_000,    max: 100_000_000 },
  '$1M – $10M':   { min: 1_000_000,     max: 10_000_000 },
  '< $1M':        { min: 0,             max: 1_000_000 },
};

const SORT_MAP: Record<string, string> = {
  date:  'c.award_date DESC NULLS LAST',
  title: 'c.title ASC NULLS LAST',
  value: 'c.value DESC NULLS LAST',
};

export async function GET(req: NextRequest) {
  const sp      = req.nextUrl.searchParams;
  const page    = Math.max(1, parseInt(sp.get('page') ?? '1'));
  const per     = Math.min(100, Math.max(10, parseInt(sp.get('per') ?? '50')));
  const search  = sp.get('search')?.trim() ?? '';
  const company = sp.get('company')?.trim() ?? '';
  const agency  = sp.get('agency')?.trim() ?? '';
  const tier    = sp.get('tier')?.trim() ?? '';
  const sortKey = sp.get('sort')?.trim() ?? 'value';
  const offset  = (page - 1) * per;

  const db      = getDb();
  const orderBy = SORT_MAP[sortKey] ?? SORT_MAP.value;
  const tierObj = TIERS[tier] ?? null;

  // Build filter fragments
  const searchFrag   = search  ? db`AND (c.title ILIKE ${'%'+search+'%'} OR c.awardee ILIKE ${'%'+search+'%'})` : db``;
  const companyFrag  = company ? db`AND o.full_name ILIKE ${'%'+company+'%'}` : db``;
  const agencyFrag   = agency  ? db`AND (c.agency_or_lab = ${agency} OR c.service_branch = ${agency})` : db``;
  const tierMinFrag  = tierObj ? db`AND c.value >= ${tierObj.min}` : db``;
  const tierMaxFrag  = tierObj?.max != null ? db`AND c.value < ${tierObj.max}` : db``;

  const [rows, countRows] = await Promise.all([
    db`
      SELECT
        c.id, c.title, c.value AS award_amt, c.award_date,
        c.awardee AS recipient, c.agency_or_lab AS sub_agency,
        c.service_branch AS agency, c.naics_code AS naics,
        c.status AS set_aside, c.source,
        c.canonical_org_id AS org_id, o.full_name AS org_name
      FROM contracts c
      JOIN orgs o ON o.id = c.canonical_org_id AND o.branch = 'Industry'
      WHERE c.signal_type = 'Award'
        ${searchFrag} ${companyFrag} ${agencyFrag} ${tierMinFrag} ${tierMaxFrag}
      ORDER BY ${db.unsafe(orderBy)}
      LIMIT ${per} OFFSET ${offset}
    `,
    db`
      SELECT COUNT(*)::int AS total
      FROM contracts c
      JOIN orgs o ON o.id = c.canonical_org_id AND o.branch = 'Industry'
      WHERE c.signal_type = 'Award'
        ${searchFrag} ${companyFrag} ${agencyFrag} ${tierMinFrag} ${tierMaxFrag}
    `,
  ]);

  return NextResponse.json({
    contracts: rows,
    total: countRows[0]?.total ?? 0,
    page,
    per,
  });
}

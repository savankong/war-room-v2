import { NextRequest, NextResponse } from 'next/server';
import { getWriteDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const TOKEN = process.env.SAM_SYNC_TOKEN ?? 'warroom-seed-2026';
const LIMIT = 100;

// Map USASpending sub-agencies to our service_branch / agency_or_lab abbreviations
function mapAgency(subAgency: string | null): { service_branch: string | null; agency_or_lab: string | null } {
  if (!subAgency) return { service_branch: null, agency_or_lab: null };
  const s = subAgency.toLowerCase();
  if (s.includes('army'))           return { service_branch: 'Army',       agency_or_lab: 'Army' };
  if (s.includes('navy') || s.includes('naval'))
                                    return { service_branch: 'Navy',       agency_or_lab: 'Navy' };
  if (s.includes('air force'))      return { service_branch: 'Air Force',  agency_or_lab: 'Air Force' };
  if (s.includes('space force'))    return { service_branch: 'Space Force',agency_or_lab: 'Space Force' };
  if (s.includes('marine'))         return { service_branch: 'Marines',    agency_or_lab: 'Marines' };
  if (s.includes('darpa'))          return { service_branch: null,         agency_or_lab: 'DARPA' };
  if (s.includes('defense advanced'))return { service_branch: null,        agency_or_lab: 'DARPA' };
  if (s.includes('disa') || s.includes('defense information'))
                                    return { service_branch: null,         agency_or_lab: 'DISA' };
  if (s.includes('dia') || s.includes('defense intelligence'))
                                    return { service_branch: null,         agency_or_lab: 'DIA' };
  if (s.includes('mda') || s.includes('missile defense'))
                                    return { service_branch: null,         agency_or_lab: 'MDA' };
  if (s.includes('socom') || s.includes('special operations'))
                                    return { service_branch: null,         agency_or_lab: 'SOCOM' };
  if (s.includes('defense health') || s.includes('dha'))
                                    return { service_branch: null,         agency_or_lab: 'DHA' };
  if (s.includes('dla') || s.includes('defense logistics'))
                                    return { service_branch: null,         agency_or_lab: 'DLA' };
  if (s.includes('dtra') || s.includes('threat reduction'))
                                    return { service_branch: null,         agency_or_lab: 'DTRA' };
  if (s.includes('pentagon') || s.includes('office of the secretary') || s.includes('osd'))
                                    return { service_branch: null,         agency_or_lab: 'OSD' };
  return { service_branch: null, agency_or_lab: subAgency.slice(0, 60) };
}

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('token') !== TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const page        = parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10);
  const startDate   = req.nextUrl.searchParams.get('startDate') ?? '2023-01-01';
  const endDate     = req.nextUrl.searchParams.get('endDate')   ?? '2026-06-15';
  const lastId      = req.nextUrl.searchParams.get('lastId');
  const lastVal     = req.nextUrl.searchParams.get('lastVal');
  const minAmount   = parseInt(req.nextUrl.searchParams.get('minAmount') ?? '100000', 10);

  // Build USASpending request body
  const body: Record<string, any> = {
    filters: {
      award_type_codes: ['A', 'B', 'C', 'D'],  // contract types
      agencies: [{ type: 'awarding', tier: 'toptier', name: 'Department of Defense' }],
      time_period: [{ start_date: startDate, end_date: endDate }],
      award_amounts: [{ lower_bound: minAmount }],
    },
    fields: [
      'Award ID', 'Recipient Name', 'Award Amount', 'Award Date',
      'Awarding Agency', 'Awarding Sub Agency', 'Contract Award Type',
      'NAICS Code', 'Description', 'Place of Performance State Code',
      'generated_internal_id',
    ],
    page,
    limit: LIMIT,
    sort: 'Award Amount',
    order: 'desc',
  };

  // Use cursor pagination for pages > 1
  if (page > 1 && lastId && lastVal) {
    body.last_record_unique_id = parseInt(lastId, 10);
    body.last_record_sort_value = lastVal;
  }

  const usa = await fetch('https://api.usaspending.gov/api/v2/search/spending_by_award/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!usa.ok) {
    const txt = await usa.text();
    return NextResponse.json({ error: 'USASpending API error', detail: txt.slice(0, 300) }, { status: 502 });
  }

  const data = await usa.json();
  const results: any[] = data.results ?? [];
  const meta = data.page_metadata ?? {};

  const db = getWriteDb();

  // Ensure required columns exist
  await db`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS awardee TEXT`;
  await db`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS naics_code TEXT`;
  await db`CREATE INDEX IF NOT EXISTS idx_contracts_awardee ON contracts(awardee)`;

  let inserted = 0;
  const errors: string[] = [];

  for (const r of results) {
    const uid: string = r['generated_internal_id'] ?? r['Award ID'];
    if (!uid) continue;

    const amount = Math.round(Number(r['Award Amount'] ?? 0));
    const { service_branch, agency_or_lab } = mapAgency(r['Awarding Sub Agency']);
    const rawDesc = (r['Description'] ?? '') as string;
    const title = rawDesc.slice(0, 200) || (r['Award ID'] ?? uid);

    try {
      await db`
        INSERT INTO contracts (
          id, title, description, signal_type, source,
          value, awardee, naics_code,
          award_date, agency_or_lab, service_branch
        ) VALUES (
          ${uid},
          ${title},
          ${rawDesc.slice(0, 1000) || null},
          'Award',
          'usaspending',
          ${String(amount)},
          ${r['Recipient Name'] ?? null},
          ${r['NAICS Code'] ?? null},
          ${r['Award Date'] ? new Date(r['Award Date']) : null},
          ${agency_or_lab},
          ${service_branch}
        )
        ON CONFLICT (id) DO UPDATE SET
          title          = EXCLUDED.title,
          awardee        = EXCLUDED.awardee,
          value          = EXCLUDED.value,
          naics_code     = EXCLUDED.naics_code,
          award_date     = EXCLUDED.award_date,
          agency_or_lab  = EXCLUDED.agency_or_lab,
          service_branch = EXCLUDED.service_branch
      `;
      inserted++;
    } catch (e: unknown) {
      errors.push(`${uid}: ${e instanceof Error ? e.message.slice(0, 80) : String(e)}`);
    }
  }

  const hasNext = meta.hasNext ?? false;
  const nextLastId  = meta.last_record_unique_id  ?? null;
  const nextLastVal = meta.last_record_sort_value  ?? null;

  // Build next-page URL for convenience
  const base = req.nextUrl.origin;
  const nextUrl = hasNext
    ? `${base}/api/sync-usaspending?token=${TOKEN}&startDate=${startDate}&endDate=${endDate}&minAmount=${minAmount}&page=${page + 1}&lastId=${nextLastId}&lastVal=${nextLastVal}`
    : null;

  return NextResponse.json({
    page,
    inserted,
    fetched: results.length,
    hasNext,
    nextLastId,
    nextLastVal,
    nextUrl,
    errors: errors.length ? errors : undefined,
  });
}

/**
 * Fetch DoD contract awards from USASpending.gov and upsert into contracts table.
 * Deduplicates by external_id. Matches awarding agency to orgs by name.
 *
 * Run: npx ts-node --project tsconfig.scripts.json scripts/fetch-usaspending.ts
 */

import postgres from 'postgres';

const DB_URL = process.env.DATABASE_URL!;
if (!DB_URL) { console.error('DATABASE_URL not set'); process.exit(1); }

const sql = postgres(DB_URL, { ssl: 'require', max: 3 });

const USA_API = 'https://api.usaspending.gov/api/v2';

/* ── Fetch org name → id map from DB ─────────────────────────────── */
async function buildOrgMap(): Promise<Map<string, string>> {
  const rows = await sql`SELECT id, full_name FROM orgs WHERE is_active = true`;
  const map = new Map<string, string>();
  for (const r of rows) {
    map.set(r.full_name.toLowerCase().trim(), r.id);
  }
  return map;
}

function matchOrg(name: string, orgMap: Map<string, string>): string | null {
  if (!name) return null;
  const key = name.toLowerCase().trim();
  if (orgMap.has(key)) return orgMap.get(key)!;
  // Partial match — longest key that is contained in the name
  let best: string | null = null;
  let bestLen = 0;
  for (const [k, v] of orgMap) {
    if (key.includes(k) && k.length > bestLen) { best = v; bestLen = k.length; }
    if (k.includes(key) && key.length > bestLen) { best = v; bestLen = key.length; }
  }
  return best;
}

/* ── Fetch one page of awards (cursor-based) ─────────────────────── */
async function fetchAwardsPage(cursor: { lastId?: number; lastVal?: string } | null, pageSize: number): Promise<{ results: any[]; hasNext: boolean; lastId: number | null; lastVal: string | null }> {
  const body: any = {
    filters: {
      agencies: [{ type: 'awarding', tier: 'toptier', name: 'Department of Defense' }],
      award_type_codes: ['A', 'B', 'C', 'D'],
      time_period: [{ start_date: '2022-01-01', end_date: new Date().toISOString().slice(0,10) }],
    },
    fields: [
      'Award ID', 'Recipient Name', 'Award Amount', 'Awarding Agency',
      'Awarding Sub Agency', 'Award Date', 'Description', 'NAICS Code',
    ],
    sort: 'Award Amount',
    order: 'desc',
    limit: pageSize,
    page: 1,
  };

  if (cursor?.lastId) {
    body.last_record_unique_id   = cursor.lastId;
    body.last_record_sort_value  = cursor.lastVal;
  }

  const res = await fetch(`${USA_API}/search/spending_by_award/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`USASpending ${res.status}: ${await res.text()}`);
  const data = await res.json() as any;
  const meta = data.page_metadata ?? {};
  return {
    results: data.results ?? [],
    hasNext: meta.hasNext ?? false,
    lastId:  meta.last_record_unique_id  ?? null,
    lastVal: meta.last_record_sort_value ?? null,
  };
}

/* ── Main ─────────────────────────────────────────────────────────── */
async function main() {
  const orgMap = await buildOrgMap();
  console.log(`Loaded ${orgMap.size} orgs for matching`);

  // Fetch existing external IDs to avoid re-inserting
  const existing = await sql`SELECT external_id FROM contracts WHERE source = 'usaspending' AND external_id IS NOT NULL`;
  const existingIds = new Set(existing.map((r: any) => r.external_id));
  console.log(`${existingIds.size} existing USASpending records`);

  const PAGE_SIZE = 100;
  let cursor: { lastId?: number; lastVal?: string } | null = null;
  let inserted = 0;
  let skipped = 0;
  let batchNum = 0;
  const MAX_BATCHES = 50; // cap at 5,000 records per run

  do {
    batchNum++;
    console.log(`Fetching batch ${batchNum} (inserted so far: ${inserted})…`);
    const { results, hasNext, lastId, lastVal } = await fetchAwardsPage(cursor, PAGE_SIZE);

    for (const r of results) {
      const extId = (r['Award ID'] ?? r['generated_internal_id']) as string | null;
      if (!extId || existingIds.has(extId)) { skipped++; continue; }
      existingIds.add(extId);

      const awardingAgency    = r['Awarding Agency']     as string | null;
      const awardingSubAgency = r['Awarding Sub Agency'] as string | null;
      const orgId = matchOrg(awardingSubAgency ?? '', orgMap) ?? matchOrg(awardingAgency ?? '', orgMap) ?? null;
      const awardAmt = r['Award Amount'] ? Math.round(Number(r['Award Amount'])) : null;

      await sql`
        INSERT INTO contracts (
          id, external_id, title, signal_type, source, value, award_amt,
          award_date, recipient, agency, sub_agency, naics, org_id, raw_payload
        ) VALUES (
          ${'usa-' + extId.replace(/[^a-z0-9]/gi, '-').toLowerCase()},
          ${extId},
          ${`${r['Recipient Name'] ?? 'Unknown'} — ${awardingSubAgency ?? awardingAgency ?? 'DoD'}`},
          ${'Award'},
          ${'usaspending'},
          ${awardAmt ? String(awardAmt) : null},
          ${awardAmt},
          ${r['Award Date'] ? new Date(r['Award Date']) : null},
          ${r['Recipient Name'] ?? null},
          ${awardingAgency ?? null},
          ${awardingSubAgency ?? null},
          ${r['NAICS Code'] ?? null},
          ${orgId},
          ${sql.json(r)}
        )
        ON CONFLICT (id) DO NOTHING
      `;
      inserted++;
    }

    console.log(`  → batch done, inserted total: ${inserted}, skipped: ${skipped}`);

    if (!hasNext || !lastId) break;
    cursor = { lastId, lastVal: lastVal ?? undefined };
    await new Promise(r => setTimeout(r, 150));
  } while (batchNum < MAX_BATCHES);

  console.log(`\nDone. Inserted: ${inserted}, Skipped (already existed): ${skipped}`);
  await sql.end();
}

main().catch(e => { console.error(e); process.exit(1); });

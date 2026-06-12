/**
 * Fetch DoD contract opportunities from SAM.gov and upsert into contracts table.
 * Deduplicates by external_id (SAM.gov notice ID). Matches org by name.
 *
 * Run: npx ts-node --project tsconfig.scripts.json scripts/fetch-sam-opportunities.ts
 */

import postgres from 'postgres';

const DB_URL    = process.env.DATABASE_URL!;
const SAM_KEY   = process.env.SAM_GOV_API_KEY!;

if (!DB_URL)  { console.error('DATABASE_URL not set'); process.exit(1); }
if (!SAM_KEY) { console.error('SAM_GOV_API_KEY not set'); process.exit(1); }

const sql = postgres(DB_URL, { ssl: 'require', max: 3 });
const SAM_API = 'https://api.sam.gov/opportunities/v2/search';

/* ── Org name → id map ───────────────────────────────────────────── */
async function buildOrgMap(): Promise<Map<string, string>> {
  const rows = await sql`SELECT id, full_name FROM orgs WHERE is_active = true`;
  const map = new Map<string, string>();
  for (const r of rows) map.set(r.full_name.toLowerCase().trim(), r.id);
  return map;
}

function matchOrg(name: string | null | undefined, orgMap: Map<string, string>): string | null {
  if (!name) return null;
  const key = name.toLowerCase().trim();
  if (orgMap.has(key)) return orgMap.get(key)!;
  let best: string | null = null, bestLen = 0;
  for (const [k, v] of orgMap) {
    if (key.includes(k) && k.length > bestLen) { best = v; bestLen = k.length; }
    if (k.includes(key) && key.length > bestLen) { best = v; bestLen = key.length; }
  }
  return best;
}

/* ── SAM.gov fetch ───────────────────────────────────────────────── */
function fmtSamDate(d: Date): string {
  return `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`;
}

async function fetchSamPage(offset: number, limit: number, postedFrom: string): Promise<{ opportunities: any[]; totalRecords: number }> {
  const params = new URLSearchParams({
    api_key:    SAM_KEY,
    limit:      String(limit),
    offset:     String(offset),
    postedFrom,
    postedTo:   fmtSamDate(new Date()),
    deptname:   'Department of Defense',
  });

  const res = await fetch(`${SAM_API}?${params}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SAM.gov ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json() as any;
  return {
    opportunities: data.opportunitiesData ?? [],
    totalRecords:  data.totalRecords ?? 0,
  };
}

/* ── Determine signal type from SAM.gov opportunity ─────────────── */
function signalType(opp: any): 'Opportunity' | 'Award' {
  const t = (opp.type ?? '').toLowerCase();
  if (t.includes('award') || t === 'a') return 'Award';
  return 'Opportunity';
}

/* ── Main ─────────────────────────────────────────────────────────── */
async function main() {
  const orgMap = await buildOrgMap();
  console.log(`Loaded ${orgMap.size} orgs for matching`);

  const existing = await sql`SELECT external_id FROM contracts WHERE source = 'sam_gov' AND external_id IS NOT NULL`;
  const existingIds = new Set(existing.map((r: any) => r.external_id as string));
  console.log(`${existingIds.size} existing SAM.gov records`);

  // SAM.gov range must be UNDER 1 year — pull the last 11 months
  const elevenMonthsAgo = new Date();
  elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11);
  const postedFrom = fmtSamDate(elevenMonthsAgo);

  const LIMIT = 100;
  let offset = 0;
  let inserted = 0, skipped = 0;
  let totalRecords = 1;

  while (offset < totalRecords && offset < 5000) {
    console.log(`Fetching SAM.gov offset ${offset} / ${totalRecords}…`);
    const { opportunities, totalRecords: total } = await fetchSamPage(offset, LIMIT, postedFrom);
    totalRecords = total;

    for (const opp of opportunities) {
      const extId = opp.noticeId as string | null;
      if (!extId || existingIds.has(extId)) { skipped++; continue; }
      existingIds.add(extId);

      const orgName = opp.organizationName ?? opp.department ?? null;
      const orgId   = matchOrg(orgName, orgMap);

      const valueRaw = opp.awardAmount ?? opp.baseAndAllOptionsValue ?? null;
      const valueNum = valueRaw ? Math.round(Number(String(valueRaw).replace(/[^0-9.]/g, ''))) || null : null;

      const postedDate  = opp.postedDate   ? new Date(opp.postedDate)   : null;
      const responseEnd = opp.responseDeadLine ? new Date(opp.responseDeadLine) : null;

      const row = {
        id:                `sam-${extId}`,
        external_id:       extId,
        title:             opp.title ?? `SAM.gov notice ${extId}`,
        signal_type:       signalType(opp),
        source:            'sam_gov' as const,
        value:             valueNum ? String(valueNum) : null,
        award_amt:         valueNum,
        award_date:        postedDate,
        deadline:          responseEnd ? responseEnd.toISOString().slice(0, 10) : null,
        recipient:         opp.awardee ?? null,
        agency:            opp.department ?? null,
        sub_agency:        opp.subTier ?? opp.organizationName ?? null,
        set_aside:         opp.typeOfSetAside ?? opp.typeOfSetAsideDescription ?? null,
        poc_email:         opp.pointOfContact?.[0]?.email ?? null,
        poc:               opp.pointOfContact?.[0]?.fullName ?? null,
        naics:             opp.naicsCode ?? null,
        description:       opp.description ?? null,
        sam_url:           opp.uiLink ?? null,
        org_id:            orgId,
        raw_payload:       opp,
      };

      await sql`
        INSERT INTO contracts (
          id, external_id, title, signal_type, source, value, award_amt,
          award_date, deadline, recipient, agency, sub_agency, set_aside,
          poc_email, poc, naics, description, sam_url, org_id, raw_payload
        ) VALUES (
          ${row.id}, ${row.external_id}, ${row.title}, ${row.signal_type}, ${row.source},
          ${row.value}, ${row.award_amt}, ${row.award_date},
          ${row.deadline}, ${row.recipient}, ${row.agency}, ${row.sub_agency},
          ${row.set_aside}, ${row.poc_email}, ${row.poc}, ${row.naics},
          ${row.description}, ${row.sam_url}, ${row.org_id},
          ${sql.json(row.raw_payload)}
        )
        ON CONFLICT (id) DO NOTHING
      `;
      inserted++;
    }

    console.log(`  → inserted ${inserted} so far (skipped: ${skipped})`);
    offset += LIMIT;
    await new Promise(r => setTimeout(r, 300)); // rate limit
  }

  console.log(`\nDone. Inserted: ${inserted}, Skipped (already existed): ${skipped}`);
  await sql.end();
}

main().catch(e => { console.error(e); process.exit(1); });

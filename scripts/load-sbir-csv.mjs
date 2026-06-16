#!/usr/bin/env node
/**
 * Fast bulk SBIR CSV loader.
 * Strategy:
 *   1. Pre-load all existing org names + IDs into memory (one query)
 *   2. Stream CSV, match against in-memory map (no per-row DB calls)
 *   3. Bulk-insert sbir_awards in batches of 1000
 *   4. Bulk-UPDATE matched orgs using a single VALUES CTE
 *   5. Bulk-INSERT new sbir_company orgs in chunks of 500
 *
 * Run: node scripts/load-sbir-csv.mjs /path/to/award_data.csv [row_limit]
 */

import postgres from 'postgres';
import { readFileSync, createReadStream } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __dir = dirname(fileURLToPath(import.meta.url));
const CSV_PATH  = process.argv[2] ?? '/tmp/sbir_sorted.csv';
const ROW_LIMIT = parseInt(process.argv[3] ?? '0'); // 0 = no limit

/* ── DB ─────────────────────────────────────────────────────────────── */
let DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  try {
    const env = readFileSync(resolve(__dir, '../.env.local'), 'utf8');
    const m = env.match(/^DATABASE_URL=(.+)$/m);
    if (m) DATABASE_URL = m[1].trim();
  } catch {}
}
if (!DATABASE_URL) { console.error('DATABASE_URL not found'); process.exit(1); }
const db = postgres(DATABASE_URL, { ssl: 'require', max: 10, prepare: false });

/* ── Helpers ─────────────────────────────────────────────────────────── */
const CAP_MAP = [
  { c: 'UX',        re: /\bux\b|user experience/i },
  { c: 'HCD',       re: /\bhcd\b|human.?centered/i },
  { c: 'AI/ML',     re: /\bai\b|machine learning|\bml\b|artificial intelligence/i },
  { c: 'Cyber',     re: /cybersecurity|\bcyber\b/i },
  { c: 'C2',        re: /\bc2\b|command and control/i },
  { c: 'ISR',       re: /\bisr\b|intelligence.{1,5}surveillance/i },
  { c: 'Logistics', re: /logistics/i },
  { c: 'Autonomy',  re: /autonom/i },
  { c: 'Space',     re: /\bspace\b|satellite/i },
  { c: 'Biotech',   re: /biotech|medical device|life science/i },
];
const extractCaps = t => CAP_MAP.filter(({ re }) => re.test(t)).map(({ c }) => c);

const PHASE_RANK = { I: 1, II: 2, III: 3 };
const higherPhase = (a, b) => !a ? (b||null) : !b ? a : (PHASE_RANK[a]??0) >= (PHASE_RANK[b]??0) ? a : b;

const normFirm = n =>
  n.replace(/[,.]?\s*(inc\.?|llc\.?|corp\.?|co\.?|ltd\.?|incorporated|corporation|company)\.?\s*$/i, '')
   .trim().toLowerCase();

const parsePhase = raw => {
  if (!raw) return null;
  const m = raw.match(/\b(III|II|I|3|2|1)\b/i);
  if (!m) return null;
  return { '1':'I','2':'II','3':'III','i':'I','ii':'II','iii':'III' }[m[1].toLowerCase()] ?? null;
};

const parseBool = v => v?.toUpperCase() === 'Y' ? true : v?.toUpperCase() === 'N' ? false : null;

const parseDate = v => {
  if (!v || !v.trim()) return null;
  const d = new Date(v.trim());
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0,10);
};

const parseIntSafe = v => {
  const n = parseInt(v ?? '');
  return isNaN(n) ? null : n;
};

function* splitCSVLine(line) {
  let field = '', inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === ',' && !inQ) { yield field; field = ''; continue; }
    field += ch;
  }
  yield field;
}

/* ── Main ────────────────────────────────────────────────────────────── */
async function main() {
  console.log('Ensuring schema…');
  await db`ALTER TABLE orgs ADD COLUMN IF NOT EXISTS uei TEXT`;
  await db`ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sbir_phase TEXT`;
  await db`ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sbir_capabilities TEXT[]`;
  await db`ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sbir_designations TEXT[]`;
  await db`ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sbir_award_count INT DEFAULT 0`;
  await db`ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sbir_address   TEXT`;
  await db`ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sbir_city      TEXT`;
  await db`ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sbir_state     TEXT`;
  await db`ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sbir_zip       TEXT`;
  await db`ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sbir_poc_phone TEXT`;
  await db`ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sbir_poc_email TEXT`;
  await db`ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sbir_website   TEXT`;
  await db`CREATE TABLE IF NOT EXISTS sbir_awards (
    id SERIAL PRIMARY KEY, uei TEXT, firm TEXT, award_title TEXT,
    agency TEXT, branch TEXT, phase TEXT, program TEXT,
    award_year INT, award_amount BIGINT, abstract TEXT,
    hubzone_owned BOOLEAN, women_owned BOOLEAN,
    socially_economically_disadvantaged BOOLEAN,
    poc_name TEXT, poc_email TEXT,
    org_id TEXT REFERENCES orgs(id),
    synced_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await db`ALTER TABLE sbir_awards ADD COLUMN IF NOT EXISTS contract_number         TEXT`;
  await db`ALTER TABLE sbir_awards ADD COLUMN IF NOT EXISTS agency_tracking_number  TEXT`;
  await db`ALTER TABLE sbir_awards ADD COLUMN IF NOT EXISTS solicitation_number     TEXT`;
  await db`ALTER TABLE sbir_awards ADD COLUMN IF NOT EXISTS solicitation_topic_code TEXT`;
  await db`ALTER TABLE sbir_awards ADD COLUMN IF NOT EXISTS award_start_date        DATE`;
  await db`ALTER TABLE sbir_awards ADD COLUMN IF NOT EXISTS award_end_date          DATE`;
  await db`ALTER TABLE sbir_awards ADD COLUMN IF NOT EXISTS number_employees        INTEGER`;
  await db`ALTER TABLE sbir_awards ADD COLUMN IF NOT EXISTS company_website         TEXT`;
  await db`ALTER TABLE sbir_awards ADD COLUMN IF NOT EXISTS address1                TEXT`;
  await db`ALTER TABLE sbir_awards ADD COLUMN IF NOT EXISTS address2                TEXT`;
  await db`ALTER TABLE sbir_awards ADD COLUMN IF NOT EXISTS city                    TEXT`;
  await db`ALTER TABLE sbir_awards ADD COLUMN IF NOT EXISTS state                   TEXT`;
  await db`ALTER TABLE sbir_awards ADD COLUMN IF NOT EXISTS zip                     TEXT`;
  await db`ALTER TABLE sbir_awards ADD COLUMN IF NOT EXISTS poc_phone               TEXT`;
  await db`ALTER TABLE sbir_awards ADD COLUMN IF NOT EXISTS pi_name                 TEXT`;
  await db`ALTER TABLE sbir_awards ADD COLUMN IF NOT EXISTS pi_phone                TEXT`;
  await db`ALTER TABLE sbir_awards ADD COLUMN IF NOT EXISTS pi_email                TEXT`;
  await db`ALTER TABLE sbir_awards ADD COLUMN IF NOT EXISTS congressional_district  TEXT`;

  /* Step 1: load all existing orgs into memory */
  console.log('Loading existing orgs into memory…');
  const existingOrgs = await db`SELECT id, full_name, uei, sbir_phase, sbir_capabilities, sbir_designations FROM orgs`;

  const byUei  = new Map();
  const byName = new Map();
  for (const o of existingOrgs) {
    if (o.uei) byUei.set(o.uei.trim(), o);
    if (o.full_name) byName.set(normFirm(o.full_name), o);
  }
  console.log(`  ${existingOrgs.length.toLocaleString()} orgs loaded.\n`);

  /* Step 2: stream CSV */
  console.log(`Streaming ${CSV_PATH}…`);
  let headers = null;
  let processed = 0, matched = 0, created = 0, errors = 0;

  const orgUpdates = new Map(); // orgId → accumulated update
  const newOrgs    = new Map(); // normName → org to insert
  const awardBatch = [];

  const flushAwards = async () => {
    if (!awardBatch.length) return;
    const batch = awardBatch.splice(0);
    try {
      await db`INSERT INTO sbir_awards ${db(batch)} ON CONFLICT DO NOTHING`;
    } catch {
      for (const r of batch) {
        try { await db`INSERT INTO sbir_awards ${db([r])} ON CONFLICT DO NOTHING`; } catch {}
      }
    }
  };

  const rl = createInterface({ input: createReadStream(CSV_PATH), crlfDelay: Infinity });

  for await (const rawLine of rl) {
    if (!rawLine.trim()) continue;
    if (!headers) {
      headers = [...splitCSVLine(rawLine)].map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
      continue;
    }

    const vals = [...splitCSVLine(rawLine)];
    const row  = Object.fromEntries(headers.map((h, i) => [h, (vals[i] ?? '').trim()]));

    try {
      const firm  = row.company ?? '';
      const uei   = row.uei || null;
      const phase = parsePhase(row.phase);
      const caps  = extractCaps(row.abstract ?? '');
      const desig = [
        parseBool(row['hubzone_owned'])                           === true ? 'HUBZone' : null,
        parseBool(row['woman_owned'])                             === true ? 'WOSB'    : null,
        parseBool(row['socially_and_economically_disadvantaged']) === true ? 'SDB'     : null,
      ].filter(Boolean);

      const norm = normFirm(firm);
      let existing = (uei && byUei.get(uei)) || byName.get(norm) || null;
      let orgId = null;

      if (existing) {
        orgId = existing.id;
        matched++;
        const acc = orgUpdates.get(orgId) ?? {
          id: orgId,
          sbir_phase: existing.sbir_phase,
          sbir_capabilities: [...(existing.sbir_capabilities ?? [])],
          sbir_designations: [...(existing.sbir_designations ?? [])],
          award_count_delta: 0,
          uei: existing.uei,
          // address/contact from most recent award row (first seen = highest year since sorted desc)
          sbir_address:   null,
          sbir_city:      null,
          sbir_state:     null,
          sbir_zip:       null,
          sbir_poc_phone: null,
          sbir_poc_email: null,
          sbir_website:   null,
        };
        acc.sbir_phase = higherPhase(acc.sbir_phase, phase);
        for (const c of caps)  if (!acc.sbir_capabilities.includes(c))  acc.sbir_capabilities.push(c);
        for (const d of desig) if (!acc.sbir_designations.includes(d))  acc.sbir_designations.push(d);
        acc.award_count_delta++;
        if (uei && !acc.uei) acc.uei = uei;
        // Only set address/contact from first (most recent) award
        if (!acc.sbir_address && row.address1) acc.sbir_address = row.address1 + (row.address2 ? ' ' + row.address2 : '');
        if (!acc.sbir_city    && row.city)     acc.sbir_city    = row.city;
        if (!acc.sbir_state   && row.state)    acc.sbir_state   = row.state;
        if (!acc.sbir_zip     && row.zip)      acc.sbir_zip     = row.zip;
        if (!acc.sbir_poc_phone && (row.contact_phone || row.pi_phone)) acc.sbir_poc_phone = row.contact_phone || row.pi_phone;
        if (!acc.sbir_poc_email && (row.contact_email || row.pi_email)) acc.sbir_poc_email = row.contact_email || row.pi_email;
        if (!acc.sbir_website   && row.company_website)                 acc.sbir_website   = row.company_website;
        orgUpdates.set(orgId, acc);

      } else if (firm) {
        created++;
        const acc = newOrgs.get(norm) ?? {
          id: norm.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 72) + '-sbir',
          full_name: firm,
          abbreviation: firm.split(/\s+/).map(w=>w[0]).slice(0,4).join('').toUpperCase() || null,
          organization_type: 'sbir_company',
          uei,
          sbir_phase: null,
          sbir_capabilities: [],
          sbir_designations: [],
          sbir_award_count: 0,
          is_active: true,
          loc: [row.city, row.state].filter(Boolean).join(', ') || null,
          description: null, // populated later via AI summarization or manual entry
          sbir_address:   row.address1 ? row.address1 + (row.address2 ? ' ' + row.address2 : '') : null,
          sbir_city:      row.city   || null,
          sbir_state:     row.state  || null,
          sbir_zip:       row.zip    || null,
          sbir_poc_phone: row.contact_phone || row.pi_phone || null,
          sbir_poc_email: row.contact_email || row.pi_email || null,
          sbir_website:   row.company_website || null,
        };
        acc.sbir_phase = higherPhase(acc.sbir_phase, phase);
        for (const c of caps)  if (!acc.sbir_capabilities.includes(c))  acc.sbir_capabilities.push(c);
        for (const d of desig) if (!acc.sbir_designations.includes(d))  acc.sbir_designations.push(d);
        acc.sbir_award_count++;
        if (uei && !acc.uei) acc.uei = uei;
        newOrgs.set(norm, acc);
        orgId = acc.id;
      }

      awardBatch.push({
        uei,
        firm:                          firm || null,
        award_title:                   row['award_title']    || null,
        agency:                        row.agency            || null,
        branch:                        row.branch            || null,
        phase,
        program:                       row.program           || null,
        award_year:                    parseIntSafe(row['award_year']),
        award_amount:                  row['award_amount'] ? Math.round(parseFloat(row['award_amount'])) : null,
        abstract:                      (row.abstract || '').slice(0, 4000) || null,
        hubzone_owned:                 parseBool(row['hubzone_owned']),
        women_owned:                   parseBool(row['woman_owned']),
        socially_economically_disadvantaged: parseBool(row['socially_and_economically_disadvantaged']),
        poc_name:                      row['contact_name']   || null,
        poc_email:                     row['contact_email']  || null,
        poc_phone:                     row['contact_phone']  || null,
        pi_name:                       row['pi_name']        || null,
        pi_phone:                      row['pi_phone']       || null,
        pi_email:                      row['pi_email']       || null,
        contract_number:               row['contract']       || null,
        agency_tracking_number:        row['agency_tracking_number'] || null,
        solicitation_number:           row['solicitation_number']    || null,
        solicitation_topic_code:       row['topic_code']     || null,
        award_start_date:              parseDate(row['proposal_award_date']),
        award_end_date:                parseDate(row['contract_end_date']),
        number_employees:              parseIntSafe(row['number_employees']),
        company_website:               row['company_website'] || null,
        address1:                      row['address1']       || null,
        address2:                      row['address2']       || null,
        city:                          row['city']           || null,
        state:                         row['state']          || null,
        zip:                           row['zip']            || null,
        congressional_district:        null, // not in CSV, only on sbir.gov detail page
        org_id: orgId,
      });

      processed++;
      if (awardBatch.length >= 1000) await flushAwards();
      if (processed % 100 === 0)
        process.stdout.write(`\r  rows=${processed.toLocaleString()} matched=${matched.toLocaleString()} new=${created.toLocaleString()}   `);
      if (ROW_LIMIT > 0 && processed >= ROW_LIMIT) { rl.close(); break; }

    } catch (e) {
      errors++;
      if (errors <= 3) console.error('\nRow error:', e.message);
    }
  }

  await flushAwards();
  console.log(`\n\nCSV streamed. Now writing org changes to DB…`);

  /* Step 3: bulk-UPDATE matched orgs using unnest arrays */
  console.log(`  Bulk-updating ${orgUpdates.size.toLocaleString()} existing orgs…`);
  const updateArr = [...orgUpdates.values()];

  // Parallel batch updates — 50 concurrent at a time
  const PARALLEL = 50;
  let updated = 0;
  for (let i = 0; i < updateArr.length; i += PARALLEL) {
    const chunk = updateArr.slice(i, i + PARALLEL);
    await Promise.all(chunk.map(r =>
      db`UPDATE orgs SET
        uei              = COALESCE(uei,          ${r.uei ?? null}),
        sbir_phase       = ${r.sbir_phase ?? null},
        sbir_capabilities= ${r.sbir_capabilities}::text[],
        sbir_designations= ${r.sbir_designations}::text[],
        sbir_award_count = COALESCE(sbir_award_count,0) + ${r.award_count_delta},
        sbir_address     = COALESCE(sbir_address,  ${r.sbir_address    ?? null}),
        sbir_city        = COALESCE(sbir_city,     ${r.sbir_city       ?? null}),
        sbir_state       = COALESCE(sbir_state,    ${r.sbir_state      ?? null}),
        sbir_zip         = COALESCE(sbir_zip,      ${r.sbir_zip        ?? null}),
        sbir_poc_phone   = COALESCE(sbir_poc_phone,${r.sbir_poc_phone  ?? null}),
        sbir_poc_email   = COALESCE(sbir_poc_email,${r.sbir_poc_email  ?? null}),
        sbir_website     = COALESCE(sbir_website,  ${r.sbir_website    ?? null})
        WHERE id = ${r.id}`
    ));
    updated += chunk.length;
    process.stdout.write(`\r    updated ${updated.toLocaleString()}/${updateArr.length.toLocaleString()}   `);
  }

  /* Step 4: bulk-insert new orgs */
  console.log(`\n  Inserting ${newOrgs.size.toLocaleString()} new sbir_company orgs…`);
  const newOrgArr = [...newOrgs.values()];
  const CHUNK = 500;
  for (let i = 0; i < newOrgArr.length; i += CHUNK) {
    const chunk = newOrgArr.slice(i, i + CHUNK);
    try {
      await db`INSERT INTO orgs ${db(chunk)} ON CONFLICT (id) DO UPDATE SET sbir_award_count=orgs.sbir_award_count+EXCLUDED.sbir_award_count`;
    } catch {
      for (const o of chunk) {
        try { await db`INSERT INTO orgs ${db([o])} ON CONFLICT (id) DO UPDATE SET sbir_award_count=orgs.sbir_award_count+EXCLUDED.sbir_award_count`; } catch {}
      }
    }
    process.stdout.write(`\r    inserted ${Math.min(i+CHUNK, newOrgArr.length).toLocaleString()}/${newOrgArr.length.toLocaleString()}   `);
  }

  console.log(`\n\n✓ Done!`);
  console.log(`  processed : ${processed.toLocaleString()}`);
  console.log(`  matched   : ${matched.toLocaleString()} (enriched existing orgs)`);
  console.log(`  created   : ${created.toLocaleString()} (new sbir_company orgs)`);
  console.log(`  errors    : ${errors}`);
  await db.end();
}

main().catch(e => { console.error(e); process.exit(1); });

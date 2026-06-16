#!/usr/bin/env node
/**
 * Run locally: node scripts/sync-sbir.mjs
 * Syncs DoD SBIR/STTR awards from sbir.gov directly into the Netlify DB.
 */

import postgres from 'postgres';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));

// Load DATABASE_URL from .env.local
let DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  try {
    const env = readFileSync(resolve(__dir, '../.env.local'), 'utf8');
    const match = env.match(/^DATABASE_URL=(.+)$/m);
    if (match) DATABASE_URL = match[1].trim();
  } catch {}
}
if (!DATABASE_URL) { console.error('DATABASE_URL not found'); process.exit(1); }

const db = postgres(DATABASE_URL, { ssl: 'require', max: 3, prepare: false });

/* ── Capability extraction ─────────────────────────────────────────── */
const CAP_MAP = [
  { canonical: 'UX',        re: /\bux\b|user experience/i },
  { canonical: 'HCD',       re: /\bhcd\b|human.?centered/i },
  { canonical: 'AI/ML',     re: /\bai\b|machine learning|\bml\b|artificial intelligence/i },
  { canonical: 'Cyber',     re: /cybersecurity|\bcyber\b/i },
  { canonical: 'C2',        re: /\bc2\b|command and control/i },
  { canonical: 'ISR',       re: /\bisr\b|intelligence.{1,5}surveillance/i },
  { canonical: 'Logistics', re: /logistics/i },
  { canonical: 'Autonomy',  re: /autonom/i },
  { canonical: 'Space',     re: /\bspace\b|satellite/i },
  { canonical: 'Biotech',   re: /biotech|medical device|life science/i },
];
function caps(text) {
  return CAP_MAP.filter(({ re }) => re.test(text)).map(({ canonical }) => canonical);
}

const PHASE_RANK = { 'III': 3, 'II': 2, 'I': 1 };
function higherPhase(a, b) {
  if (!a) return b;
  return (PHASE_RANK[a] ?? 0) >= (PHASE_RANK[b] ?? 0) ? a : b;
}

function normFirm(name) {
  return name
    .replace(/[,.]?\s*(inc\.?|llc\.?|corp\.?|co\.?|ltd\.?|incorporated|corporation|company)\.?\s*$/i, '')
    .trim().toLowerCase();
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchWithRetry(url, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'WarRoom-SBIR-Sync/1.0 (contact: savan@lifebetweentitles.com)',
      },
    });
    if (res.ok) return res;
    if (res.status === 429 || res.status === 503) {
      const wait = (i + 1) * 15000; // 15s, 30s, 45s, 60s, 75s
      console.log(`  Rate limited (${res.status}), waiting ${wait/1000}s…`);
      await sleep(wait);
      continue;
    }
    return res; // other errors — return as-is
  }
  return null;
}

async function main() {
  console.log('Running schema migrations…');
  await db`ALTER TABLE orgs ADD COLUMN IF NOT EXISTS uei TEXT`;
  await db`ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sbir_phase TEXT`;
  await db`ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sbir_capabilities TEXT[]`;
  await db`ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sbir_designations TEXT[]`;
  await db`ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sbir_award_count INT DEFAULT 0`;
  await db`
    CREATE TABLE IF NOT EXISTS sbir_awards (
      id                                  SERIAL PRIMARY KEY,
      uei                                 TEXT,
      firm                                TEXT,
      award_title                         TEXT,
      agency                              TEXT,
      branch                              TEXT,
      phase                               TEXT,
      program                             TEXT,
      award_year                          INT,
      award_amount                        BIGINT,
      research_area_keywords              TEXT,
      abstract                            TEXT,
      hubzone_owned                       BOOLEAN,
      women_owned                         BOOLEAN,
      socially_economically_disadvantaged BOOLEAN,
      poc_name                            TEXT,
      poc_email                           TEXT,
      org_id                              TEXT REFERENCES orgs(id),
      synced_at                           TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('Schema ready.\n');

  let start = 0, processed = 0, matched = 0, created = 0, errors = 0;
  const BATCH = 100;

  while (true) {
    const url = `https://api.www.sbir.gov/public/api/awards?agency=DOD&rows=${BATCH}&start=${start}`;
    process.stdout.write(`Fetching start=${start}… `);

    let awards;
    try {
      const res = await fetchWithRetry(url);
      if (!res || !res.ok) { console.log(`HTTP ${res?.status ?? 'error'}, stopping.`); break; }
      awards = await res.json();
      if (!Array.isArray(awards) || awards.length === 0) { console.log('No more results.'); break; }
      console.log(`${awards.length} awards`);
    } catch (e) {
      console.log(`Fetch error: ${e.message}`); break;
    }
    // Polite delay between pages (2s)
    await sleep(2000);

    for (const a of awards) {
      try {
        const firm  = (a.firm ?? '').trim();
        const uei   = (a.uei ?? '').trim() || null;
        const rawPhase = (a.phase ?? '').replace(/^phase\s*/i, '').trim().toUpperCase();
        const phase = ['I','II','III'].includes(rawPhase) ? rawPhase : null;
        const text  = `${a.research_keywords ?? a.research_area_keywords ?? ''} ${a.abstract ?? ''}`;
        const capabilities  = caps(text);
        const designations  = [
          a.hubzone_owned                      ? 'HUBZone' : null,
          a.women_owned                        ? 'WOSB'    : null,
          a.socially_economically_disadvantaged? 'SDB'     : null,
        ].filter(Boolean);

        /* Match */
        let existing = null;
        if (uei) {
          const rows = await db`SELECT id, sbir_phase, sbir_capabilities, sbir_designations FROM orgs WHERE uei = ${uei} LIMIT 1`;
          if (rows.length) existing = rows[0];
        }
        if (!existing && firm) {
          const norm = normFirm(firm);
          const rows = await db`
            SELECT id, sbir_phase, sbir_capabilities, sbir_designations
            FROM orgs
            WHERE LOWER(REGEXP_REPLACE(COALESCE(full_name, id), '[,.]?\\s*(inc\\.?|llc\\.?|corp\\.?|co\\.?|ltd\\.?)\\s*$', '', 'i')) = ${norm}
            LIMIT 1
          `;
          if (rows.length) existing = rows[0];
        }

        let orgId = null;
        if (existing) {
          orgId = existing.id;
          matched++;
          const mergedCaps  = [...new Set([...(existing.sbir_capabilities ?? []), ...capabilities])];
          const mergedDesig = [...new Set([...(existing.sbir_designations ?? []), ...designations])];
          await db`
            UPDATE orgs SET
              uei               = COALESCE(${uei}, uei),
              sbir_phase        = ${higherPhase(existing.sbir_phase, phase)},
              sbir_capabilities = ${mergedCaps},
              sbir_designations = ${mergedDesig},
              sbir_award_count  = COALESCE(sbir_award_count, 0) + 1
            WHERE id = ${existing.id}
          `;
        } else if (firm) {
          created++;
          const abbr = firm.split(/\s+/).map(w => w[0]).slice(0, 4).join('').toUpperCase();
          const slug = normFirm(firm).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 72)
                     + '-' + Date.now().toString(36);
          const rows = await db`
            INSERT INTO orgs (id, full_name, abbreviation, organization_type, uei, sbir_phase, sbir_capabilities, sbir_designations, sbir_award_count, is_active)
            VALUES (${slug}, ${firm}, ${abbr || null}, ${'sbir_company'}, ${uei}, ${phase}, ${capabilities}, ${designations}, ${1}, ${true})
            ON CONFLICT (id) DO NOTHING
            RETURNING id
          `;
          orgId = rows[0]?.id ?? null;
        }

        /* Store raw award */
        await db`
          INSERT INTO sbir_awards (uei, firm, award_title, agency, branch, phase, program,
            award_year, award_amount, research_area_keywords, abstract,
            hubzone_owned, women_owned, socially_economically_disadvantaged,
            poc_name, poc_email, org_id)
          VALUES (
            ${uei}, ${firm || null}, ${a.award_title ?? null},
            ${a.agency ?? null}, ${a.branch ?? null}, ${phase},
            ${a.program ?? null},
            ${a.award_year ? Number(a.award_year) : null},
            ${a.award_amount ? Number(a.award_amount) : null},
            ${a.research_keywords ?? a.research_area_keywords ?? null},
            ${a.abstract ?? null},
            ${!!a.hubzone_owned}, ${!!a.women_owned}, ${!!a.socially_economically_disadvantaged},
            ${a.poc_name ?? null}, ${a.poc_email ?? null},
            ${orgId}
          )
        `;
        processed++;
      } catch (e) {
        errors++;
        console.error('  Record error:', e.message);
      }
    }

    console.log(`  → processed=${processed} matched=${matched} created=${created} errors=${errors}`);
    if (awards.length < BATCH) break;
    start += BATCH;
  }

  console.log(`\nDone. processed=${processed} matched=${matched} created=${created} errors=${errors}`);
  await db.end();
}

main().catch(e => { console.error(e); process.exit(1); });

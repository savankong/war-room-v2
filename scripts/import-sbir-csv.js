#!/usr/bin/env node
/**
 * Import SBIR/STTR award_data.csv into contracts + industry_companies + sub_companies.
 *
 * Prerequisites:
 *   npm install postgres duckdb-async
 *   Run migrate-set-aside-tags.js first.
 *
 * Usage:
 *   node scripts/import-sbir-csv.js ~/Desktop/War_Room_v2/award_data.csv
 */

const postgres = require('postgres');
const { DuckDBInstance } = require('duckdb-async');
const path = require('path');

const CSV_PATH = process.argv[2];
if (!CSV_PATH) { console.error('Usage: node import-sbir-csv.js <path-to-csv>'); process.exit(1); }

const DB = process.env.DATABASE_URL ||
  'postgresql://netlifydb_owner:npg_r3FGVA1pbSWY@ep-mute-dream-aj877gn6.c-3.us-east-2.db.netlify.com/netlifydb?sslmode=require';

const db = postgres(DB, { ssl: 'require', max: 5, prepare: false });

// ── tag normalization ────────────────────────────────────────────────────────
function buildTags(row) {
  const tags = new Set();
  const prog = (row['Program'] || '').toUpperCase();
  const phase = (row['Phase'] || '').toUpperCase();

  if (prog.includes('STTR')) tags.add('STTR');
  else tags.add('SBIR');

  if (phase.includes('I') && !phase.includes('II') && !phase.includes('III')) tags.add('SBIR I');
  else if (phase.includes('II') && !phase.includes('III')) tags.add('SBIR II');
  else if (phase.includes('III')) tags.add('SBIR III');

  if (row['HUBZone Owned'] === 'Y') tags.add('HUBZone');
  if (row['Woman Owned'] === 'Y') tags.add('WOSB');
  if (row['Socially and Economically Disadvantaged'] === 'Y') tags.add('SDB');

  return [...tags];
}

// ── slug helper ──────────────────────────────────────────────────────────────
function toId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
    + '-sbir-' + Date.now().toString(36);
}

async function run() {
  const absPath = path.resolve(CSV_PATH.replace(/^~/, process.env.HOME));
  console.log(`Reading: ${absPath}`);

  const duck = await DuckDBInstance.create(':memory:');
  const conn = await duck.connect();

  const rows = await conn.all(
    `SELECT * FROM read_csv('${absPath}', AUTO_DETECT=TRUE)`
  );
  console.log(`Loaded ${rows.length} rows from CSV`);

  // ── Upsert industry_companies (PRIME) ─────────────────────────────────────
  const companies = [...new Map(rows.map(r => [r['Company'], r])).values()];
  console.log(`Upserting ${companies.length} companies into industry_companies...`);

  let newCompanies = 0;
  for (const r of companies) {
    const name = (r['Company'] || '').trim();
    if (!name) continue;
    const existing = await db`SELECT id FROM industry_companies WHERE legal_name = ${name} LIMIT 1`;
    if (existing.length === 0) {
      const id = toId(name);
      await db`
        INSERT INTO industry_companies (id, name, legal_name, website, headquarters)
        VALUES (${id}, ${name}, ${name}, ${r['Company Website'] || null}, ${[r['City'], r['State']].filter(Boolean).join(', ') || null})
        ON CONFLICT DO NOTHING
      `;
      newCompanies++;
    }
  }
  console.log(`  ${newCompanies} new companies added`);

  // ── Upsert sub_companies for Research Institutions ────────────────────────
  const riNames = [...new Set(rows.map(r => r['RI Name']).filter(Boolean).map(n => n.trim()))];
  console.log(`Upserting ${riNames.length} research institutions into sub_companies...`);

  let newRI = 0;
  for (const name of riNames) {
    const existing = await db`SELECT id FROM sub_companies WHERE legal_name = ${name} LIMIT 1`;
    if (existing.length === 0) {
      const id = toId(name);
      await db`
        INSERT INTO sub_companies (id, legal_name, name)
        VALUES (${id}, ${name}, ${name})
        ON CONFLICT DO NOTHING
      `;
      newRI++;
    }
  }
  console.log(`  ${newRI} new research institutions added`);

  // ── Upsert contracts ──────────────────────────────────────────────────────
  console.log('Upserting contracts...');
  let inserted = 0;
  let skipped = 0;

  for (const r of rows) {
    const externalId = [
      r['Agency Tracking Number'],
      r['Contract'],
      r['Solicitation Number'],
    ].filter(Boolean)[0];

    if (!externalId) { skipped++; continue; }

    const tags = buildTags(r);
    const awardAmt = parseFloat(r['Award Amount']) || null;
    const awardDate = r['Proposal Award Date'] || null;

    const raw = {
      uei: r['UEI'] || null,
      duns: r['Duns'] || null,
      phase: r['Phase'] || null,
      program: r['Program'] || null,
      topic_code: r['Topic Code'] || null,
      solicitation_number: r['Solicitation Number'] || null,
      solicitation_year: r['Solicitation Year'] || null,
      contract_end_date: r['Contract End Date'] || null,
      pi_name: r['PI Name'] || null,
      pi_email: r['PI Email'] || null,
      pi_phone: r['PI Phone'] || null,
      ri_name: r['RI Name'] || null,
      ri_poc_name: r['RI POC Name'] || null,
      number_employees: r['Number Employees'] || null,
      address: [r['Address1'], r['Address2']].filter(Boolean).join(', ') || null,
      zip: r['Zip'] || null,
    };

    await db`
      INSERT INTO contracts (
        id, external_id, title, signal_type, source,
        value, award_amt, award_date,
        recipient, agency, sub_agency,
        set_aside, set_aside_tags,
        naics, description,
        poc, poc_email,
        raw_payload
      ) VALUES (
        gen_random_uuid(),
        ${externalId},
        ${(r['Award Title'] || '').trim() || null},
        'Award',
        'manual',
        ${awardAmt},
        ${awardAmt},
        ${awardDate},
        ${(r['Company'] || '').trim() || null},
        ${(r['Agency'] || '').trim() || null},
        ${(r['Branch'] || '').trim() || null},
        ${tags.join(', ')},
        ${tags},
        ${r['NAICS'] || null},
        ${(r['Abstract'] || '').trim() || null},
        ${(r['Contact Name'] || '').trim() || null},
        ${(r['Contact Email'] || '').trim() || null},
        ${raw}
      )
      ON CONFLICT (external_id) DO UPDATE SET
        set_aside_tags = EXCLUDED.set_aside_tags,
        set_aside      = EXCLUDED.set_aside,
        award_amt      = EXCLUDED.award_amt,
        description    = EXCLUDED.description,
        raw_payload    = EXCLUDED.raw_payload
    `;
    inserted++;

    if (inserted % 1000 === 0) console.log(`  ${inserted} processed...`);
  }

  console.log(`Done. ${inserted} upserted, ${skipped} skipped (no external ID).`);
  await db.end();
  await conn.close();
}

run().catch(e => { console.error(e); process.exit(1); });

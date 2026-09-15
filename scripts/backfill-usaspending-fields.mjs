#!/usr/bin/env node
/**
 * Backfills USASpending records from existing raw_payload JSONB.
 * Run: node scripts/backfill-usaspending-fields.mjs
 */

import postgres from 'postgres';
const DB = process.env.DATABASE_URL;
if (!DB) { console.error('DATABASE_URL not set'); process.exit(1); }

const db = postgres(DB, { ssl: 'require', max: 3, prepare: false });

async function run() {
  const rows = await db`
    SELECT id, raw_payload FROM contracts
    WHERE source = 'usaspending' AND raw_payload IS NOT NULL
  `;
  console.log(`${rows.length} USASpending records to backfill`);

  let updated = 0;
  for (const row of rows) {
    const p = row.raw_payload;
    const city  = p['Place of Performance City Name'] || null;
    const state = p['Place of Performance State Code'] || null;
    const place = [city, state].filter(Boolean).join(', ') || null;

    await db`
      UPDATE contracts SET
        recipient            = COALESCE(recipient,            ${p['Recipient Name'] || null}),
        agency               = COALESCE(agency,               ${p['Awarding Agency'] || null}),
        sub_agency           = COALESCE(sub_agency,           ${p['Awarding Sub Agency'] || null}),
        description          = COALESCE(description,          ${p['Description'] || null}),
        naics                = COALESCE(naics,                ${p['NAICS Code'] ? String(p['NAICS Code']) : null}),
        psc_code             = COALESCE(psc_code,             ${p['PSC Code'] || null}),
        notice_type          = COALESCE(notice_type,          ${p['Contract Award Type'] || null}),
        place_of_performance = COALESCE(place_of_performance, ${place})
      WHERE id = ${row.id}
    `;
    updated++;
    if (updated % 500 === 0) process.stdout.write(`\r  ${updated} updated...`);
  }

  console.log(`\nDone. ${updated} updated.`);
  await db.end();
}

run().catch(e => { console.error(e); process.exit(1); });

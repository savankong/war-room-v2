#!/usr/bin/env node
/**
 * Backfills contracts.description, naics, psc_code, poc, poc_email, poc_phone,
 * deadline, set_aside, solicitation_number, notice_type, place_of_performance,
 * agency, sub_agency from existing raw_payload JSONB for SAM.gov records.
 *
 * Run from War_Room_v2/ root (where node_modules lives):
 *   node scripts/backfill-sam-fields.js
 */

const postgres = require('postgres');

const DB = process.env.DATABASE_URL ||
  'postgresql://netlifydb_owner:npg_r3FGVA1pbSWY@ep-mute-dream-aj877gn6.c-3.us-east-2.db.netlify.com/netlifydb?sslmode=require';

const db = postgres(DB, { ssl: 'require', max: 3, prepare: false });

function extractFields(payload) {
  if (!payload || typeof payload !== 'object') return null;

  // Point of contact
  const pocs = Array.isArray(payload.pointOfContact) ? payload.pointOfContact : [];
  const primaryPoc = pocs.find(p => (p.type || '').toLowerCase() === 'primary') || pocs[0] || null;

  // Place of performance
  const pop = payload.placeOfPerformance;
  let place = null;
  if (pop) {
    const parts = [pop.city?.name, pop.state?.name, pop.country?.code].filter(Boolean);
    place = parts.join(', ') || null;
  }

  // Agency from hierarchy
  const pathName = payload.fullParentPathName || '';
  const pathParts = pathName.split('.');
  const agency = pathParts[1]?.trim() || pathParts[0]?.trim() || null;
  const subAgency = pathParts[2]?.trim() || null;

  // Set-aside description
  const setAside = payload.typeOfSetAsideDesc || payload.typeOfSetAside || null;

  // NAICS description
  const naicsCode = payload.naicsCode || null;

  // PSC / classification code
  const pscCode = payload.classificationCode || null;

  // Solicitation number
  const solNum = payload.solicitationNumber || null;

  // Notice type (SAM type field)
  const noticeType = payload.type || payload.baseType || null;

  // Description — SAM returns HTML; strip tags for storage
  let description = payload.description || null;
  if (description && description.includes('<')) {
    description = description
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#\d+;/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  // Deadline
  const deadline = payload.responseDeadLine || null;

  // Published date
  const publishedDate = payload.postedDate || null;

  return {
    description,
    naics: naicsCode,
    psc_code: pscCode,
    poc: primaryPoc?.fullName || null,
    poc_email: primaryPoc?.email || null,
    poc_phone: primaryPoc?.phone || null,
    deadline,
    published_date: publishedDate,
    set_aside: setAside,
    solicitation_number: solNum,
    notice_type: noticeType,
    place_of_performance: place,
    agency,
    sub_agency: subAgency,
  };
}

async function run() {
  console.log('Adding missing columns if needed...');

  await db`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS poc_phone           VARCHAR(100)`;
  await db`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS notice_type         VARCHAR(100)`;
  await db`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS published_date      TIMESTAMPTZ`;
  await db`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS place_of_performance TEXT`;
  await db`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS naics               VARCHAR(20)`;
  await db`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS agency              VARCHAR(500)`;
  await db`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS sub_agency          VARCHAR(500)`;
  await db`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS poc                 VARCHAR(255)`;
  await db`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS poc_email           VARCHAR(255)`;
  await db`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS deadline            TIMESTAMPTZ`;
  await db`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS set_aside           VARCHAR(255)`;
  await db`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS solicitation_number VARCHAR(255)`;
  await db`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS psc_code            VARCHAR(20)`;

  console.log('Fetching SAM.gov records with raw_payload...');
  const rows = await db`
    SELECT id, raw_payload
    FROM contracts
    WHERE source = 'sam_gov'
      AND raw_payload IS NOT NULL
  `;
  console.log(`  ${rows.length} records to process`);

  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const fields = extractFields(row.raw_payload);
    if (!fields) { skipped++; continue; }

    await db`
      UPDATE contracts SET
        description          = COALESCE(description, ${fields.description}),
        naics                = COALESCE(naics, ${fields.naics}),
        psc_code             = COALESCE(psc_code, ${fields.psc_code}),
        poc                  = COALESCE(poc, ${fields.poc}),
        poc_email            = COALESCE(poc_email, ${fields.poc_email}),
        poc_phone            = COALESCE(poc_phone, ${fields.poc_phone}),
        deadline             = COALESCE(deadline, ${fields.deadline || null}),
        published_date       = COALESCE(published_date, ${fields.published_date || null}),
        set_aside            = COALESCE(set_aside, ${fields.set_aside}),
        solicitation_number  = COALESCE(solicitation_number, ${fields.solicitation_number}),
        notice_type          = COALESCE(notice_type, ${fields.notice_type}),
        place_of_performance = COALESCE(place_of_performance, ${fields.place_of_performance}),
        agency               = COALESCE(agency, ${fields.agency}),
        sub_agency           = COALESCE(sub_agency, ${fields.sub_agency})
      WHERE id = ${row.id}
    `;
    updated++;
    if (updated % 500 === 0) process.stdout.write(`\r  ${updated} updated...`);
  }

  console.log(`\nDone. ${updated} updated, ${skipped} skipped.`);
  await db.end();
}

run().catch(e => { console.error(e); process.exit(1); });

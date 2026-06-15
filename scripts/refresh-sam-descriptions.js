#!/usr/bin/env node
/**
 * Refreshes SAM.gov records by fetching all opportunities in one wide-date-range
 * paginated sweep (1000/page), matching by noticeId, and updating description +
 * any other null fields in the DB.
 *
 * Uses SAM_GOV_API_KEY env var.
 *
 * Run from War_Room_v2/ root:
 *   SAM_GOV_API_KEY=your_key node scripts/refresh-sam-descriptions.js
 */

const postgres = require('postgres');

const DB = process.env.DATABASE_URL ||
  'postgresql://netlifydb_owner:npg_r3FGVA1pbSWY@ep-mute-dream-aj877gn6.c-3.us-east-2.db.netlify.com/netlifydb?sslmode=require';
const API_KEY = process.env.SAM_GOV_API_KEY;
if (!API_KEY) { console.error('SAM_GOV_API_KEY not set'); process.exit(1); }

const db = postgres(DB, { ssl: 'require', max: 3, prepare: false });

function stripHtml(html) {
  if (!html) return null;
  if (!html.includes('<')) return html.trim() || null;
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, '')
    .replace(/\n{3,}/g, '\n\n').trim() || null;
}

async function fetchPage(postedFrom, postedTo, offset) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    limit: '1000',
    offset: String(offset),
    postedFrom,
    postedTo,
  });
  const url = `https://api.sam.gov/opportunities/v2/search?${params}`;
  console.log(`  Fetching offset=${offset} (${postedFrom} → ${postedTo})...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`SAM API ${res.status}: ${res.statusText}`);
  const data = await res.json();
  return {
    opps: data.opportunitiesData ?? [],
    total: data.totalRecords ?? 0,
  };
}

async function run() {
  // Get all SAM.gov notice IDs from the DB
  const dbRows = await db`
    SELECT id, external_id FROM contracts
    WHERE source = 'sam_gov' AND raw_payload IS NOT NULL
  `;
  const idMap = new Map(dbRows.map(r => [r.external_id, r.id]));
  console.log(`${idMap.size} SAM.gov records in DB to enrich`);

  // Sweep: last 3 years in one wide window
  // SAM.gov expects MM/dd/yyyy
  const fmt = d => `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`;
  const now = new Date();
  const past = new Date(); past.setDate(now.getDate() - 364);
  const postedTo = fmt(now);
  const postedFrom = fmt(past);

  let updated = 0;
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    const { opps, total: t } = await fetchPage(postedFrom, postedTo, offset);
    total = t;

    // Update DB immediately for any matches found on this page
    for (const opp of opps) {
      if (!idMap.has(opp.noticeId)) continue;
      const dbId = idMap.get(opp.noticeId);
      const pocs = Array.isArray(opp.pointOfContact) ? opp.pointOfContact : [];
      const poc = pocs.find(p => (p.type || '').toLowerCase() === 'primary') || pocs[0] || null;

      const description = stripHtml(opp.description);
      const naics = opp.naicsCode || null;
      const pscCode = opp.classificationCode || null;
      const setAside = opp.typeOfSetAsideDesc || opp.typeOfSetAside || null;
      const solNum = opp.solicitationNumber || null;
      const noticeType = opp.type || null;
      const deadline = opp.responseDeadLine || null;
      const pocName = poc?.fullName || null;
      const pocEmail = poc?.email || null;
      const pocPhone = poc?.phone || null;
      const path = (opp.fullParentPathName || '').split('.');
      const agency = path[1]?.trim() || path[0]?.trim() || null;
      const subAgency = path[2]?.trim() || null;

      await db`
        UPDATE contracts SET
          description         = COALESCE(NULLIF(description, ''), ${description}),
          naics               = COALESCE(naics,               ${naics}),
          psc_code            = COALESCE(psc_code,            ${pscCode}),
          set_aside           = COALESCE(set_aside,           ${setAside}),
          solicitation_number = COALESCE(solicitation_number, ${solNum}),
          notice_type         = COALESCE(notice_type,         ${noticeType}),
          poc                 = COALESCE(poc,                 ${pocName}),
          poc_email           = COALESCE(poc_email,           ${pocEmail}),
          poc_phone           = COALESCE(poc_phone,           ${pocPhone}),
          agency              = COALESCE(agency,              ${agency}),
          sub_agency          = COALESCE(sub_agency,          ${subAgency}),
          raw_payload         = ${db.json(opp)}
        WHERE id = ${dbId}
      `;
      updated++;
      idMap.delete(opp.noticeId); // remove so we know what's left
    }

    console.log(`  Got ${opps.length} opps (total=${t}, updated so far: ${updated}, remaining: ${idMap.size})`);
    offset += 1000;
    if (opps.length === 0) break;
    if (idMap.size === 0) { console.log('  All records updated — stopping early.'); break; }
    if (offset < total) await new Promise(r => setTimeout(r, 800));
  }

  console.log(`Updated ${updated} records.`);
  await db.end();
}

run().catch(e => { console.error(e); process.exit(1); });

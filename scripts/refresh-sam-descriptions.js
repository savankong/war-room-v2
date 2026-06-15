#!/usr/bin/env node
/**
 * Daily SAM.gov sync:
 *   1. Fetches last 7 days → inserts new records, updates existing ones
 *   2. Fetches full 364-day window → fills in any blank fields on existing records
 *
 * Uses SAM_GOV_API_KEY and optionally DATABASE_URL env vars.
 */

const postgres = require('postgres');

const DB = process.env.DATABASE_URL ||
  'postgresql://netlifydb_owner:npg_r3FGVA1pbSWY@ep-mute-dream-aj877gn6.c-3.us-east-2.db.netlify.com/netlifydb?sslmode=require';
const API_KEY = process.env.SAM_GOV_API_KEY;
if (!API_KEY) { console.error('SAM_GOV_API_KEY not set'); process.exit(1); }

const db = postgres(DB, { ssl: 'require', max: 3, prepare: false });

const fmt = d => `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`;

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

function extractFields(opp) {
  const pocs = Array.isArray(opp.pointOfContact) ? opp.pointOfContact : [];
  const poc = pocs.find(p => (p.type || '').toLowerCase() === 'primary') || pocs[0] || null;
  const path = (opp.fullParentPathName || '').split('.');
  const pop = opp.placeOfPerformance;
  const popParts = pop ? [pop.city?.name, pop.state?.name, pop.country?.code].filter(Boolean) : [];
  return {
    description:         stripHtml(opp.description),
    naics:               opp.naicsCode || null,
    psc_code:            opp.classificationCode || null,
    set_aside:           opp.typeOfSetAsideDesc || opp.typeOfSetAside || null,
    solicitation_number: opp.solicitationNumber || null,
    notice_type:         opp.type || null,
    deadline:            opp.responseDeadLine || null,
    published_date:      opp.postedDate || null,
    poc:                 poc?.fullName || null,
    poc_email:           poc?.email || null,
    poc_phone:           poc?.phone || null,
    agency:              path[1]?.trim() || path[0]?.trim() || null,
    sub_agency:          path[2]?.trim() || null,
    place_of_performance: popParts.join(', ') || null,
    title:               opp.title || null,
    value:               opp.award?.amount || null,
    award_date:          opp.award?.date || null,
    recipient:           opp.award?.awardee?.name || null,
  };
}

async function fetchPage(postedFrom, postedTo, offset) {
  const params = new URLSearchParams({ api_key: API_KEY, limit: '1000', offset: String(offset), postedFrom, postedTo });
  const url = `https://api.sam.gov/opportunities/v2/search?${params}`;
  console.log(`  Fetching offset=${offset} (${postedFrom} → ${postedTo})...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`SAM API ${res.status}: ${res.statusText}`);
  const data = await res.json();
  return { opps: data.opportunitiesData ?? [], total: data.totalRecords ?? 0 };
}

async function sweep(postedFrom, postedTo, idMap, insertNew) {
  let updated = 0, inserted = 0, offset = 0, total = Infinity, pagesNoNew = 0;

  while (offset < total) {
    const { opps, total: t } = await fetchPage(postedFrom, postedTo, offset);
    total = t;

    const before = updated + inserted;
    for (const opp of opps) {
      const f = extractFields(opp);
      if (idMap.has(opp.noticeId)) {
        const dbId = idMap.get(opp.noticeId);
        await db`
          UPDATE contracts SET
            description         = COALESCE(NULLIF(description, ''), ${f.description}),
            naics               = COALESCE(naics,               ${f.naics}),
            psc_code            = COALESCE(psc_code,            ${f.psc_code}),
            set_aside           = COALESCE(set_aside,           ${f.set_aside}),
            solicitation_number = COALESCE(solicitation_number, ${f.solicitation_number}),
            notice_type         = COALESCE(notice_type,         ${f.notice_type}),
            poc                 = COALESCE(poc,                 ${f.poc}),
            poc_email           = COALESCE(poc_email,           ${f.poc_email}),
            poc_phone           = COALESCE(poc_phone,           ${f.poc_phone}),
            agency              = COALESCE(agency,              ${f.agency}),
            sub_agency          = COALESCE(sub_agency,          ${f.sub_agency}),
            place_of_performance= COALESCE(place_of_performance,${f.place_of_performance}),
            published_date      = COALESCE(published_date,      ${f.published_date}::timestamptz),
            deadline            = COALESCE(deadline,            ${f.deadline}),
            raw_payload         = ${db.json(opp)}
          WHERE id = ${dbId}
        `;
        idMap.delete(opp.noticeId);
        updated++;
      } else if (insertNew) {
        const signalType = opp.type === 'Award' ? 'Award' : 'Opportunity';
        await db`
          INSERT INTO contracts (
            external_id, source, title, value, set_aside, signal_type,
            award_date, published_date, deadline, raw_payload,
            description, naics, psc_code, solicitation_number, notice_type,
            poc, poc_email, poc_phone, place_of_performance, agency, sub_agency, recipient
          ) VALUES (
            ${opp.noticeId}, 'sam_gov', ${f.title}, ${f.value}, ${f.set_aside}, ${signalType},
            ${f.award_date}, ${f.published_date}::timestamptz, ${f.deadline}, ${db.json(opp)},
            ${f.description}, ${f.naics}, ${f.psc_code}, ${f.solicitation_number}, ${f.notice_type},
            ${f.poc}, ${f.poc_email}, ${f.poc_phone}, ${f.place_of_performance}, ${f.agency}, ${f.sub_agency}, ${f.recipient}
          )
          ON CONFLICT (external_id) DO NOTHING
        `;
        idMap.set(opp.noticeId, null); // mark as seen so backfill sweep can update it
        inserted++;
      }
    }

    const after = updated + inserted;
    pagesNoNew = (after === before) ? pagesNoNew + 1 : 0;

    console.log(`  offset=${offset}: ${opps.length} opps, +${inserted} inserted, updated=${updated}, remaining=${idMap.size}, noNewStreak=${pagesNoNew}`);
    offset += 1000;
    if (opps.length === 0) break;
    if (idMap.size === 0 && !insertNew) { console.log('  All existing records matched — stopping.'); break; }
    if (pagesNoNew >= 3) { console.log('  No new matches in 3 pages — stopping.'); break; }
    if (offset < total) await new Promise(r => setTimeout(r, 800));
  }

  return { updated, inserted };
}

async function run() {
  const now = new Date();

  // --- Phase 1: last 7 days — insert new + update existing ---
  const week = new Date(); week.setDate(now.getDate() - 7);
  console.log('\n=== Phase 1: last 7 days (new records + updates) ===');
  const dbRowsAll = await db`SELECT id, external_id FROM contracts WHERE source = 'sam_gov'`;
  const idMapAll = new Map(dbRowsAll.map(r => [r.external_id, r.id]));
  const p1 = await sweep(fmt(week), fmt(now), idMapAll, true);
  console.log(`Phase 1 done: ${p1.inserted} new, ${p1.updated} updated`);

  // --- Phase 2: full 364-day window — fill blank fields on existing records ---
  console.log('\n=== Phase 2: 364-day backfill for existing records with null fields ===');
  const dbRowsNull = await db`
    SELECT id, external_id FROM contracts
    WHERE source = 'sam_gov'
      AND raw_payload IS NOT NULL
      AND (description IS NULL OR description = '')
  `;
  if (dbRowsNull.length === 0) {
    console.log('No records with blank descriptions — skipping.');
  } else {
    const past = new Date(); past.setDate(now.getDate() - 364);
    const idMapNull = new Map(dbRowsNull.map(r => [r.external_id, r.id]));
    console.log(`${idMapNull.size} records need description backfill`);
    const p2 = await sweep(fmt(past), fmt(now), idMapNull, false);
    console.log(`Phase 2 done: ${p2.updated} updated`);
  }

  await db.end();
  console.log('\nDaily SAM.gov sync complete.');
}

run().catch(e => { console.error(e); process.exit(1); });

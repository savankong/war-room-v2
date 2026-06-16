#!/usr/bin/env node
const postgres = require('postgres');
const DB = 'postgresql://netlifydb_owner:npg_r3FGVA1pbSWY@ep-mute-dream-aj877gn6.c-3.us-east-2.db.netlify.com/netlifydb?sslmode=require';
const USA_SPENDING = 'https://api.usaspending.gov/api/v2';
const SLEEP_MS = 300;

const PRIMES = [
  { display: 'L3Harris Technologies', legal: 'L3HARRIS TECHNOLOGIES, INC.' },
  { display: 'Leidos',                legal: 'LEIDOS, INC.' },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchJSON(url, body) {
  const opts = body
    ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    : { method: 'GET' };
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.json();
}

async function getTopAwardIds(primeRecipient, limit = 15) {
  const data = await fetchJSON(`${USA_SPENDING}/search/spending_by_award/`, {
    filters: {
      recipient_search_text: [primeRecipient],
      award_type_codes: ['A', 'B', 'C', 'D'],
      time_period: [{ start_date: '2020-01-01', end_date: '2025-12-31' }],
    },
    fields: ['Award ID', 'Award Amount', 'Recipient Name'],
    sort: 'Award Amount',
    order: 'desc',
    limit,
    page: 1,
  });
  return (data.results ?? []).map(r => r.internal_id).filter(Boolean);
}

async function getSubawardsForAward(internalId) {
  const subs = {};
  let page = 1;
  while (true) {
    let data;
    try {
      data = await fetchJSON(`${USA_SPENDING}/subawards/`, {
        filters: { prime_award_internal_ids: [internalId] },
        fields: ['subaward_number', 'description', 'action_date', 'amount', 'recipient_name'],
        limit: 100,
        page,
        sort: 'amount',
        order: 'desc',
      });
    } catch (e) { console.warn(`    ⚠ ${e.message}`); break; }

    const results = data.results ?? [];
    for (const r of results) {
      const name = r.recipient_name?.trim()?.toUpperCase();
      if (!name || name.length < 2) continue;
      const raw = Number(r.amount ?? 0);
      const amount = raw > 0 && raw < 50_000_000_000 ? raw : null;
      if (!subs[name]) subs[name] = { name, total: 0, count: 0, desc: null, date: null };
      if (amount) subs[name].total += amount;
      subs[name].count += 1;
      if (!subs[name].desc && r.description) subs[name].desc = r.description;
      if (r.action_date && (!subs[name].date || r.action_date > subs[name].date)) subs[name].date = r.action_date;
    }
    if (!data.page_metadata?.hasNext || results.length < 100) break;
    page++;
    if (page > 5) break;
    await sleep(SLEEP_MS);
  }
  return subs;
}

async function run() {
  const db = postgres(DB);

  for (const prime of PRIMES) {
    console.log(`\n📦 ${prime.display} (${prime.legal})`);
    const awardIds = await getTopAwardIds(prime.legal);
    console.log(`  Found ${awardIds.length} top contracts`);

    const allSubs = {};
    for (const id of awardIds) {
      await sleep(SLEEP_MS);
      const subs = await getSubawardsForAward(id);
      for (const [name, data] of Object.entries(subs)) {
        if (!allSubs[name]) allSubs[name] = { name, total: 0, count: 0, desc: null, date: null };
        allSubs[name].total += data.total;
        allSubs[name].count += data.count;
        if (!allSubs[name].desc && data.desc) allSubs[name].desc = data.desc;
        if (data.date && (!allSubs[name].date || data.date > allSubs[name].date)) allSubs[name].date = data.date;
      }
    }

    const skipWords = [prime.display.toUpperCase().split(' ')[0], prime.legal.split(' ')[0]];
    const rows = Object.values(allSubs)
      .filter(s => !skipWords.some(w => s.name.includes(w)))
      .filter(s => s.count > 0)
      .sort((a, b) => (b.total || 0) - (a.total || 0))
      .slice(0, 100);

    console.log(`  → ${rows.length} unique subcontractors`);
    if (rows.length === 0) continue;

    for (const row of rows) {
      await db`
        INSERT INTO sub_awards (prime_legal_name, sub_name, total_amount, award_count, description, latest_date)
        VALUES (
          ${prime.legal},
          ${row.name},
          ${row.total > 0 ? Math.round(row.total) : null},
          ${row.count},
          ${row.desc ?? null},
          ${row.date ?? null}
        )
        ON CONFLICT (prime_legal_name, sub_name) DO UPDATE SET
          total_amount = EXCLUDED.total_amount,
          award_count  = sub_awards.award_count + EXCLUDED.award_count,
          description  = COALESCE(sub_awards.description, EXCLUDED.description),
          latest_date  = GREATEST(sub_awards.latest_date, EXCLUDED.latest_date)
      `;
    }
    console.log(`  ✓ Seeded ${rows.length} subs for ${prime.display}`);
  }

  await db.end();
  console.log('\n✅ Done');
}

run().catch(e => { console.error(e); process.exit(1); });

#!/usr/bin/env node
/**
 * Migration: adds set_aside_tags TEXT[] column to contracts and backfills from set_aside VARCHAR.
 * Run once: node scripts/migrate-set-aside-tags.js
 */

const postgres = require('postgres');

const DB = process.env.DATABASE_URL ||
  'postgresql://netlifydb_owner:npg_r3FGVA1pbSWY@ep-mute-dream-aj877gn6.c-3.us-east-2.db.netlify.com/netlifydb?sslmode=require';

const db = postgres(DB, { ssl: 'require', max: 1, prepare: false });

// Normalize a raw set_aside string into an array of canonical tags
function normalizeTags(raw) {
  if (!raw) return [];
  const tags = new Set();
  const u = raw.toUpperCase();

  if (u.includes('SBIR') || u.includes('STTR')) {
    if (u.includes('STTR')) tags.add('STTR');
    else tags.add('SBIR');
    if (u.includes('PHASE I') || u.includes('PHASE 1') || u === 'SBIR I' || u === 'SBI') tags.add('SBIR I');
    else if (u.includes('PHASE II') || u.includes('PHASE 2') || u === 'SBIR II') tags.add('SBIR II');
    else if (u.includes('PHASE III') || u.includes('PHASE 3') || u === 'SBIR III') tags.add('SBIR III');
  }
  if (u.includes('8(A)') || u === '8A' || u.includes('EIGHT-A')) tags.add('8(a)');
  if (u.includes('SDVOSB') || u.includes('SERVICE-DISABLED') || u.includes('VET')) tags.add('SDVOSB');
  if (u.includes('WOSB') || u.includes('WOMAN OWNED') || u.includes('WOMEN-OWNED')) tags.add('WOSB');
  if (u.includes('HUBZONE')) tags.add('HUBZone');
  if (u.includes('SDB') || u.includes('SOCIALLY AND ECONOMICALLY')) tags.add('SDB');
  if (u.includes('EDWOSB')) tags.add('EDWOSB');
  if (u.includes('VOSB') && !u.includes('SDVOSB')) tags.add('VOSB');
  if (u.includes('SBA')) tags.add('SBA');

  // Fallback: keep original if nothing matched
  if (tags.size === 0) tags.add(raw.trim());

  return [...tags];
}

async function run() {
  console.log('Adding set_aside_tags column...');
  await db`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS set_aside_tags TEXT[]`;
  await db`CREATE INDEX IF NOT EXISTS idx_contracts_set_aside_tags ON contracts USING GIN(set_aside_tags)`;

  console.log('Backfilling from set_aside...');
  const rows = await db`SELECT id, set_aside FROM contracts WHERE set_aside IS NOT NULL AND set_aside_tags IS NULL`;
  console.log(`  ${rows.length} rows to backfill`);

  let updated = 0;
  for (const row of rows) {
    const tags = normalizeTags(row.set_aside);
    await db`UPDATE contracts SET set_aside_tags = ${tags} WHERE id = ${row.id}`;
    updated++;
  }

  console.log(`Done. ${updated} rows updated.`);
  await db.end();
}

run().catch(e => { console.error(e); process.exit(1); });

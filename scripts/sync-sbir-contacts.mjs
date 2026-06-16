#!/usr/bin/env node
/**
 * Creates contacts from SBIR award PI and business contact fields.
 * Links each person to their sbir_company org via the contacts table.
 *
 * Run: node scripts/sync-sbir-contacts.mjs
 */

import postgres from 'postgres';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));

let DATABASE_URL = process.env.DATABASE_URL;
try {
  const env = readFileSync(resolve(__dir, '../.env.local'), 'utf8');
  const m = env.match(/^DATABASE_URL=(.+)$/m);
  if (m) DATABASE_URL = m[1].trim();
} catch {}
if (!DATABASE_URL) { console.error('DATABASE_URL not found'); process.exit(1); }

const db = postgres(DATABASE_URL, { ssl: 'require', max: 5, prepare: false });

const slugify = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);

const GOV_DOMAINS = /\.(mil|gov)$/i;
const isGovEmail  = (email) => !!email && GOV_DOMAINS.test(email.split('@')[1] ?? '');
const isCommEmail = (email) => !!email && !GOV_DOMAINS.test(email.split('@')[1] ?? '');

const colorFor = (name) => {
  const colors = ['#4A6FA5','#2F8676','#8B5CF6','#D97706','#DC2626','#059669','#7C3AED','#B45309'];
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return colors[Math.abs(h) % colors.length];
};

async function main() {
  // Get all sbir awards with contact info, grouped by org
  const awards = await db`
    SELECT
      sa.org_id,
      o.full_name AS org_name,
      sa.pi_name,
      sa.pi_email,
      sa.pi_phone,
      sa.poc_name,
      sa.poc_email,
      sa.poc_phone,
      sa.award_title,
      sa.award_year,
      sa.agency
    FROM sbir_awards sa
    JOIN orgs o ON o.id = sa.org_id
    WHERE sa.org_id IS NOT NULL
      AND (sa.pi_name IS NOT NULL OR sa.poc_name IS NOT NULL)
    ORDER BY sa.org_id, sa.award_year DESC
  `;

  console.log(`Processing ${awards.length} awards for contact extraction…`);

  // Build a dedup map: org_id + normalized name → best record
  const contactMap = new Map(); // key: `${org_id}::${slug}` → contact data

  for (const a of awards) {
    // Principal Investigator — skip if government email
    if (a.pi_name?.trim() && !isGovEmail(a.pi_email)) {
      const key = `${a.org_id}::${slugify(a.pi_name)}`;
      if (!contactMap.has(key)) {
        contactMap.set(key, {
          id: `${slugify(a.pi_name)}-${slugify(a.org_name).slice(0,16)}-pi`,
          name: a.pi_name.trim(),
          title: 'Principal Investigator',
          org_id: a.org_id,
          org_full: a.org_name,
          email: a.pi_email?.trim() || null,
          phone: a.pi_phone?.trim() || null,
          color: colorFor(a.pi_name),
          hierarchy_order: 2,
          is_inbox: false,
        });
      }
    }

    // Business Contact — skip if government email or same person as PI
    if (a.poc_name?.trim() && a.poc_name?.trim() !== a.pi_name?.trim() && !isGovEmail(a.poc_email)) {
      const key = `${a.org_id}::${slugify(a.poc_name)}`;
      if (!contactMap.has(key)) {
        contactMap.set(key, {
          id: `${slugify(a.poc_name)}-${slugify(a.org_name).slice(0,16)}-bc`,
          name: a.poc_name.trim(),
          title: 'Business Contact',
          org_id: a.org_id,
          org_full: a.org_name,
          email: a.poc_email?.trim() || null,
          phone: a.poc_phone?.trim() || null,
          color: colorFor(a.poc_name),
          hierarchy_order: 3,
          is_inbox: false,
        });
      }
    }
  }

  const contacts = [...contactMap.values()];
  console.log(`  ${contacts.length} unique contacts to upsert…`);

  // Upsert in chunks of 200
  let inserted = 0, errors = 0;
  const CHUNK = 200;
  for (let i = 0; i < contacts.length; i += CHUNK) {
    const chunk = contacts.slice(i, i + CHUNK);
    try {
      await db`
        INSERT INTO contacts ${db(chunk)}
        ON CONFLICT (id) DO UPDATE SET
          email    = COALESCE(EXCLUDED.email,    contacts.email),
          phone    = COALESCE(EXCLUDED.phone,    contacts.phone),
          title    = EXCLUDED.title,
          org_full = EXCLUDED.org_full
      `;
      inserted += chunk.length;
    } catch (e) {
      // Fall back to row-by-row on chunk failure
      for (const c of chunk) {
        try {
          await db`
            INSERT INTO contacts ${db([c])}
            ON CONFLICT (id) DO UPDATE SET
              email    = COALESCE(EXCLUDED.email,    contacts.email),
              phone    = COALESCE(EXCLUDED.phone,    contacts.phone),
              title    = EXCLUDED.title,
              org_full = EXCLUDED.org_full
          `;
          inserted++;
        } catch (e2) {
          errors++;
          if (errors <= 3) console.error('\n  Error:', e2.message, JSON.stringify(c));
        }
      }
    }
    process.stdout.write(`\r  ${inserted} inserted, ${errors} errors   `);
  }

  console.log(`\n\n✓ Done!`);
  console.log(`  contacts created/updated : ${inserted}`);
  console.log(`  errors                   : ${errors}`);
  await db.end();
}

main().catch(e => { console.error(e); process.exit(1); });

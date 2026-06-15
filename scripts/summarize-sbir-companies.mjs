#!/usr/bin/env node
/**
 * Generates plain-English company descriptions for sbir_company orgs
 * by summarizing their award abstracts using Claude.
 *
 * Run after a full SBIR data load:
 *   node scripts/summarize-sbir-companies.mjs
 *
 * Options:
 *   --limit 50       only process first N companies (default: all)
 *   --overwrite      re-summarize companies that already have a description
 *   --concurrency 5  parallel Claude calls (default: 5)
 */

import Anthropic from '@anthropic-ai/sdk';
import postgres from 'postgres';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));

/* ── Args ─────────────────────────────────────────────────────────────── */
const args = process.argv.slice(2);
const argVal = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i+1] : null; };
const LIMIT       = parseInt(argVal('--limit') ?? '0');       // 0 = no limit
const OVERWRITE   = args.includes('--overwrite');
const CONCURRENCY = parseInt(argVal('--concurrency') ?? '5');

/* ── DB ─────────────────────────────────────────────────────────────── */
let DATABASE_URL = process.env.DATABASE_URL;
let ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
try {
  const env = readFileSync(resolve(__dir, '../.env.local'), 'utf8');
  if (!DATABASE_URL)     { const m = env.match(/^DATABASE_URL=(.+)$/m);     if (m) DATABASE_URL     = m[1].trim(); }
  if (!ANTHROPIC_API_KEY){ const m = env.match(/^ANTHROPIC_API_KEY=(.+)$/m);if (m) ANTHROPIC_API_KEY = m[1].trim(); }
} catch {}

if (!DATABASE_URL)      { console.error('DATABASE_URL not found');      process.exit(1); }
if (!ANTHROPIC_API_KEY) { console.error('ANTHROPIC_API_KEY not found — add it to .env.local'); process.exit(1); }

const db     = postgres(DATABASE_URL, { ssl: 'require', max: 10, prepare: false });
const claude = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

/* ── Summarize one company ────────────────────────────────────────────── */
async function summarize(company) {
  // Collect up to 3 abstracts to give Claude a fuller picture
  const prompt = `You are writing a 1-2 sentence company description for a defense intelligence platform.

Company: ${company.full_name}
SBIR Phase: ${company.sbir_phase ?? 'unknown'}
Location: ${[company.sbir_city, company.sbir_state].filter(Boolean).join(', ') || 'unknown'}

Award abstracts (most recent first):
${company.abstracts.map((a, i) => `[${i+1}] ${a}`).join('\n\n')}

Write a concise, factual description of what this company does — focused on their technology and mission, not the specific award. Write in third person. Do not mention "SBIR", "Phase I/II", or funding amounts. Do not say "proposed" or "will develop" — describe what they do as a company. Maximum 60 words.`;

  const msg = await claude.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 120,
    messages: [{ role: 'user', content: prompt }],
  });

  return msg.content[0].type === 'text' ? msg.content[0].text.trim() : null;
}

/* ── Main ────────────────────────────────────────────────────────────── */
async function main() {
  console.log('Loading SBIR companies…');

  const companies = await db`
    SELECT
      o.id,
      o.full_name,
      o.sbir_phase,
      o.sbir_city,
      o.sbir_state,
      o.description,
      ARRAY(
        SELECT sa.abstract
        FROM sbir_awards sa
        WHERE sa.org_id = o.id
          AND sa.abstract IS NOT NULL
          AND length(sa.abstract) > 100
        ORDER BY sa.award_year DESC, sa.award_amount DESC NULLS LAST
        LIMIT 3
      ) AS abstracts
    FROM orgs o
    WHERE o.organization_type = 'sbir_company'
      ${OVERWRITE ? db`` : db`AND (o.description IS NULL OR o.description = '')`}
    ORDER BY o.sbir_award_count DESC NULLS LAST
    ${LIMIT > 0 ? db`LIMIT ${LIMIT}` : db``}
  `;

  const total = companies.length;
  console.log(`  ${total} companies to summarize (concurrency: ${CONCURRENCY})\n`);

  if (total === 0) {
    console.log('Nothing to do. Use --overwrite to re-summarize existing descriptions.');
    await db.end();
    return;
  }

  let done = 0, errors = 0;

  // Process in batches of CONCURRENCY
  for (let i = 0; i < companies.length; i += CONCURRENCY) {
    const batch = companies.slice(i, i + CONCURRENCY);

    await Promise.all(batch.map(async (company) => {
      if (company.abstracts.length === 0) {
        done++;
        return; // nothing to summarize
      }
      try {
        const description = await summarize(company);
        if (description) {
          await db`UPDATE orgs SET description = ${description} WHERE id = ${company.id}`;
        }
      } catch (e) {
        errors++;
        console.error(`\n  Error on ${company.full_name}: ${e.message}`);
      }
      done++;
      process.stdout.write(`\r  ${done}/${total} done, ${errors} errors   `);
    }));
  }

  console.log(`\n\n✓ Done!`);
  console.log(`  summarized : ${done - errors}`);
  console.log(`  errors     : ${errors}`);
  await db.end();
}

main().catch(e => { console.error(e); process.exit(1); });

/**
 * Verify the DoD agency list against the live APIs — engineering spec §4.
 *
 * "Confirm the current agency code list against the live SAM and USASpending
 *  APIs at build time rather than hardcoding from memory."
 *
 * lib/dod-scope.ts ships an unverified starting list. This script is how it
 * gets verified. It reports, in both directions:
 *
 *   - codes in DOD_DEPARTMENT_CODES that the live APIs no longer recognise
 *   - toptier DoD agencies the APIs return that our list does not cover
 *
 * Run it, fix lib/dod-scope.ts from the output, then set VERIFIED_AT there to
 * today's date. Requires SAM_GOV_API_KEY for the SAM half; the USASpending
 * half needs no key.
 *
 *   npm run verify-dod-agencies
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { DOD_DEPARTMENT_CODES, DOD_DEPARTMENT_NAMES, IN_SCOPE_PTYPES } from '../lib/dod-scope';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const USASPENDING_TOPTIER = 'https://api.usaspending.gov/api/v2/references/toptier_agencies/';
const SAM_SEARCH = 'https://api.sam.gov/opportunities/v2/search';

interface ToptierAgency {
  agency_id: number;
  toptier_code: string;
  agency_name: string;
  abbreviation?: string;
}

function isDefenseAgency(name: string): boolean {
  const n = name.toLowerCase();
  return (
    n.includes('defense') ||
    n.includes('army') ||
    n.includes('navy') ||
    n.includes('air force') ||
    n.includes('space force')
  );
}

async function checkUsaSpending(): Promise<void> {
  console.log('\n── USASpending toptier agencies ──────────────────────────────');

  const res = await fetch(USASPENDING_TOPTIER);
  if (!res.ok) {
    console.error(`  FAILED: ${res.status} ${res.statusText}`);
    return;
  }

  const body = (await res.json()) as { results?: ToptierAgency[] };
  const agencies = body.results ?? [];
  console.log(`  ${agencies.length} toptier agencies returned`);

  const defense = agencies.filter((a) => isDefenseAgency(a.agency_name));
  const ourCodes = new Set<string>(DOD_DEPARTMENT_CODES);

  console.log('\n  Defense-looking toptier agencies upstream:');
  for (const a of defense) {
    const have = ourCodes.has(a.toptier_code) ? '✓' : ' ';
    console.log(`    ${have} ${a.toptier_code}  ${a.agency_name}${a.abbreviation ? ` (${a.abbreviation})` : ''}`);
  }

  const upstreamCodes = new Set(defense.map((a) => a.toptier_code));
  const stale = [...ourCodes].filter((c) => !upstreamCodes.has(c));
  if (stale.length) {
    console.log(`\n  ! In DOD_DEPARTMENT_CODES but not upstream: ${stale.join(', ')}`);
  }

  const missing = defense.filter((a) => !ourCodes.has(a.toptier_code));
  if (missing.length) {
    console.log('\n  ! Upstream but missing from DOD_DEPARTMENT_CODES:');
    for (const a of missing) console.log(`      ${a.toptier_code}  ${a.agency_name}`);
  }

  if (!stale.length && !missing.length) {
    console.log('\n  DOD_DEPARTMENT_CODES matches USASpending.');
  }
}

async function checkSam(): Promise<void> {
  console.log('\n── SAM.gov notice types and department paths ─────────────────');

  const apiKey = process.env.SAM_GOV_API_KEY ?? process.env.SAM_API_KEY;
  if (!apiKey) {
    console.log('  SKIPPED: SAM_GOV_API_KEY not set.');
    return;
  }

  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 7);
  const fmt = (d: Date) =>
    `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;

  // One probe per ptype confirms the code is still accepted and still means
  // what we think it means.
  for (const ptype of IN_SCOPE_PTYPES) {
    const params = new URLSearchParams({
      api_key: apiKey,
      limit: '10',
      offset: '0',
      postedFrom: fmt(from),
      postedTo: fmt(today),
      ptype,
    });

    const res = await fetch(`${SAM_SEARCH}?${params}`);
    if (!res.ok) {
      console.log(`  ptype=${ptype}: FAILED ${res.status} ${res.statusText}`);
      continue;
    }

    const body = (await res.json()) as {
      totalRecords?: number;
      opportunitiesData?: { type?: string; fullParentPathName?: string }[];
    };
    const sample = body.opportunitiesData ?? [];
    const types = [...new Set(sample.map((o) => o.type).filter(Boolean))];
    console.log(`  ptype=${ptype}: ${body.totalRecords ?? 0} records, type field = ${types.join(' | ') || '(none)'}`);
  }

  // Department names as SAM actually spells them this week.
  const params = new URLSearchParams({
    api_key: apiKey,
    limit: '200',
    offset: '0',
    postedFrom: fmt(from),
    postedTo: fmt(today),
    ptype: 'o',
  });
  const res = await fetch(`${SAM_SEARCH}?${params}`);
  if (!res.ok) return;

  const body = (await res.json()) as {
    opportunitiesData?: { fullParentPathName?: string; fullParentPathCode?: string }[];
  };
  const departments = new Map<string, string>();
  for (const o of body.opportunitiesData ?? []) {
    const dept = o.fullParentPathName?.split('.')[0]?.trim();
    const code = o.fullParentPathCode?.split('.')[0]?.trim();
    if (dept) departments.set(dept.toLowerCase(), code ?? '');
  }

  console.log('\n  Department names seen in the last 7 days of solicitations:');
  const known = new Set<string>(DOD_DEPARTMENT_NAMES);
  for (const [name, code] of [...departments].sort()) {
    const covered = known.has(name) || (DOD_DEPARTMENT_CODES as readonly string[]).includes(code);
    const defenseLooking = isDefenseAgency(name);
    const flag = covered ? '✓' : defenseLooking ? '!' : ' ';
    console.log(`    ${flag} ${code.padEnd(5)} ${name}`);
  }
  console.log('\n  ! marks a defense-looking department our filter would drop.');
}

async function main() {
  console.log('Verifying lib/dod-scope.ts against the live APIs.');
  await checkUsaSpending();
  await checkSam();
  console.log(
    '\nCorrect lib/dod-scope.ts from the above, then set VERIFIED_AT to today.\n',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

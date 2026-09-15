/**
 * Link `contracts.contracting_office` strings to rows in `orgs`.
 *
 * Ported verbatim (behaviour, not style) out of the `dod-procurement-offices`
 * branch of the old `app/api/seed/[fn]/route.ts`. Unlike everything else in
 * that file this was never seed data — it reads `contracts`, resolves each
 * distinct contracting-office string to an org, and writes `contracts.org_id`.
 * That makes it an operational job, so it lives here rather than in `seeds/`.
 *
 * The matching below is the heuristic the route shipped with, unchanged, down
 * to the mappings that are visibly approximations (DLA resolving to DARPA, for
 * one — see NOTE). It is not the org resolver used by ingestion: `lib/
 * ingestion/org-resolver.ts` walks the parent path and follows
 * `orgs.canonical_org_id`, and is what new code should use. This script exists
 * to finish backfilling the contracts that predate it.
 *
 * Usage:
 *   npm run link-offices -- --dry-run    report what it would link
 *   npm run link-offices                 write contracts.org_id
 *   npm run link-offices -- --limit=500  widen the office sample (default 200)
 */
import { resolve } from 'node:path';
import postgres from 'postgres';
import { config } from 'dotenv';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

/**
 * Abbreviation-to-org mappings, most specific first. The comments are the
 * original author's reasoning and are kept because several are judgement calls
 * rather than facts.
 */
const DIRECT_MATCHES: Array<{ pattern: RegExp; org: string }> = [
  { pattern: /\bNAVSUP\b/, org: 'NAVSEA' }, // Naval Supply -> Naval Sea Systems
  { pattern: /\bNAVWAR\b/, org: 'NAVSEA' }, // Naval Warfare -> NAVSEA
  { pattern: /\bNIWC\b/, org: 'NAVSEA' }, // Naval Info Warfare -> NAVSEA
  { pattern: /\bNAWC\b/, org: 'NAVAIR' }, // Naval Air Warfare Center
  { pattern: /\bNSWC\b/, org: 'NAVSEA' }, // Naval Surface Warfare
  { pattern: /\bNUWC\b/, org: 'NAVSEA' }, // Naval Undersea Warfare

  { pattern: /\bAFMC\b/, org: 'AFMC' },
  { pattern: /\bAFRL\b/, org: 'AFMC' }, // AFRL under AFMC
  { pattern: /\bAFLC\b/, org: 'AFMC' }, // Air Force Logistics Center
  { pattern: /\bAFSC\b/, org: 'USAF' },
  { pattern: /\bAFNWC\b/, org: 'USAF' }, // Air Force Nuclear Weapons Center

  { pattern: /\bNAVSEA\b/, org: 'NAVSEA' },
  { pattern: /\bNAVAIR\b/, org: 'NAVAIR' },

  { pattern: /\bDARPA\b/, org: 'DARPA' },
  { pattern: /\bDISA\b/, org: 'DISA' },
  { pattern: /\bDIA\b/, org: 'DIA' },
  // NOTE: this is wrong and was wrong in the route — the Defense Logistics
  // Agency is not DARPA. It is left as-is so this port changes no behaviour;
  // fix it and the rows it mislabelled in the same change, not here.
  { pattern: /\bDLA\b/, org: 'DARPA' },
  { pattern: /\bCAPE\b/, org: 'CAPE' },
  { pattern: /\bONR\b/, org: 'NAVAIR' }, // Office of Naval Research
];

/** Resolve a contracting-office string to a service or agency abbreviation. */
export function extractPrimaryOrg(contractingOffice: string | null): string | null {
  if (!contractingOffice) return null;
  const text = contractingOffice.toUpperCase();

  for (const match of DIRECT_MATCHES) {
    if (match.pattern.test(text)) return match.org;
  }

  if (text.includes('DEPT OF THE ARMY') || (text.includes('ARMY') && !text.includes('NAVY'))) {
    return 'ARMY';
  }
  if (text.includes('DEPT OF THE NAVY') || (text.includes('NAVY') && !text.includes('AIR'))) {
    return 'NAVY';
  }
  if (
    text.includes('DEPT OF THE AIR FORCE') ||
    text.includes('USAF') ||
    (text.includes('AIR FORCE') && !text.includes('NAVAL'))
  ) {
    return 'USAF';
  }
  if (text.includes('MARINE CORPS') || text.includes('USMC')) return 'USMC';
  if (text.includes('SPACE FORCE') || text.includes('USSF')) return 'USSF';
  if (text.includes('COAST GUARD') || text.includes('USCG')) return 'USCG';
  if (text.includes('NATIONAL GUARD') || text.includes('ANG') || text.includes('ARNG')) {
    return 'ARMY';
  }

  return null;
}

/**
 * Pull the procurement-office name out of a dotted contracting-office string,
 * skipping the office codes that follow it (`W91QF`, `FA8501`, and so on).
 */
export function extractProcurementOfficeName(contractingOffice: string | null): string | null {
  if (!contractingOffice) return null;

  const parts = contractingOffice
    .split('.')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i].toUpperCase();
    if (/^[A-Z]\d{4}$|^[A-Z]{2}\d{3,5}$/.test(part)) continue; // an office code, not a name

    if (
      part.includes('PROCUREMENT') ||
      part.includes('PROCURE') ||
      part.includes('CONTRACTING') ||
      part.includes('ACTIVITY')
    ) {
      return parts[i]; // original casing
    }
  }

  return null;
}

export interface LinkResult {
  processed: number;
  linked: number;
  orgsFound: number;
  errors: string[];
}

export async function linkProcurementOffices(
  sql: postgres.Sql,
  opts: { dryRun?: boolean; limit?: number } = {},
): Promise<LinkResult> {
  const limit = opts.limit ?? 200;
  const result: LinkResult = { processed: 0, linked: 0, orgsFound: 0, errors: [] };

  const offices = await sql<{ contracting_office: string }[]>`
    SELECT DISTINCT contracting_office
    FROM contracts
    WHERE contracting_office IS NOT NULL
      AND contracting_office != ''
    ORDER BY contracting_office
    LIMIT ${limit}
  `;

  for (const office of offices) {
    result.processed++;

    try {
      const abbreviation = extractPrimaryOrg(office.contracting_office);
      if (!abbreviation) {
        result.errors.push(`No primary org in: ${office.contracting_office}`);
        continue;
      }

      const [org] = await sql<{ id: string }[]>`
        SELECT id FROM orgs
        WHERE org_type_id IS NOT NULL
          AND (
            abbreviation = ${abbreviation}
            OR sub = ${abbreviation}
            OR UPPER(abbreviation) = ${abbreviation}
            OR UPPER(sub) = ${abbreviation}
            OR description LIKE ${'%' + abbreviation + '%'}
            OR full_name LIKE ${'%' + abbreviation + '%'}
          )
        LIMIT 1
      `;

      if (!org) {
        result.errors.push(`No org for ${abbreviation} in: ${office.contracting_office}`);
        continue;
      }

      result.orgsFound++;

      if (!opts.dryRun) {
        await sql`
          UPDATE contracts
          SET org_id = ${org.id}
          WHERE contracting_office = ${office.contracting_office}
        `;
        result.linked++;
      }
    } catch (err) {
      result.errors.push(`${office.contracting_office}: ${(err as Error).message.slice(0, 80)}`);
    }
  }

  return result;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined;

  if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) {
    throw new Error(`--limit must be a positive integer, got: ${limitArg}`);
  }

  const url = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL_DIRECT (or DATABASE_URL) is required.');

  const sql = postgres(url, { max: 2, onnotice: () => {} });
  try {
    const result = await linkProcurementOffices(sql, { dryRun, limit });
    console.log(`  offices processed  ${result.processed}`);
    console.log(`  orgs resolved      ${result.orgsFound}`);
    console.log(`  contracts linked   ${dryRun ? '0 (dry run)' : result.linked}`);
    if (result.errors.length) {
      console.log(`  unresolved         ${result.errors.length}`);
      for (const error of result.errors.slice(0, 10)) console.log(`      ${error}`);
    }
  } finally {
    await sql.end();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

/**
 * Reference-data seed runner.
 *
 * The DoD org graph, its abbreviations, its relationship metadata and ~1,500
 * leadership contacts used to live inside `app/api/seed/[fn]/route.ts` — a
 * single 6,956-line request handler. That file was large enough to trip
 * TypeScript's TS2563 ("containing function or module body is too large for
 * control flow analysis"), which then degraded inference across the whole
 * program and forced `typescript: { ignoreBuildErrors: true }` in
 * next.config.ts. The data is now plain .sql in `seeds/` where no type checker
 * has to read it, and this script runs it.
 *
 * Semantics are deliberately the same as the route's: idempotent upserts, one
 * statement at a time, a failure on one row never stops the rest, and a count
 * of what happened at the end. This is reference data loaded by hand, not
 * schema — it is NOT part of `npm run migrate`, because a bad row here should
 * never block a deploy.
 *
 * Usage:
 *   npm run seed                      run every seed in order
 *   npm run seed -- orgs-master       run one
 *   npm run seed -- --list            list them, change nothing
 *   npm run seed -- --dry-run         parse and count, execute nothing
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import postgres from 'postgres';
import { config } from 'dotenv';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const SEEDS_DIR = join(resolve(__dirname, '..'), 'seeds');

/**
 * Order matters, because `contacts.org_id` is a foreign key onto `orgs`.
 *
 * `dow-directory` runs third rather than in its original position: it defines
 * `army-hq`, `army-rccto`, `army-arcyber` and others that `pdf-army`'s contacts
 * reference, so calling the endpoints in their historical order left 90 Army
 * contacts failing their foreign key on a database built from zero. In that
 * order the whole set applies with no failures.
 *
 * `org-abbreviations` and `org-metadata` update orgs, so they go last.
 */
const ORDER = [
  'orgs-master',
  'pdf-orgs',
  'dow-directory',
  'pdf-army',
  'pdf-remaining',
  'pdf-remaining-1',
  'pdf-remaining-2',
  'pdf-remaining-3',
  'senior-1',
  'senior-2',
  'org-abbreviations',
  'org-metadata',
] as const;

export interface SeedResult {
  name: string;
  applied: number;
  failed: number;
  errors: string[];
}

/**
 * Split a seed file into statements.
 *
 * Splitting on `;` alone is wrong: descriptions in this data legitimately
 * contain semicolons ("Computational intelligence; systems engineering"), so
 * the split has to know when it is inside a string literal. Postgres escapes a
 * quote inside a literal by doubling it, which is the only escape form these
 * files use — there are no dollar-quoted blocks and no comments.
 */
export function splitStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let inLiteral = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];

    if (char === "'") {
      if (inLiteral && sql[i + 1] === "'") {
        current += "''";
        i++;
        continue;
      }
      inLiteral = !inLiteral;
      current += char;
      continue;
    }

    if (char === ';' && !inLiteral) {
      const trimmed = current.trim();
      if (trimmed) statements.push(trimmed);
      current = '';
      continue;
    }

    current += char;
  }

  const tail = current.trim();
  if (tail) statements.push(tail);
  return statements;
}

function seedPath(name: string): string {
  return join(SEEDS_DIR, `${name}.sql`);
}

function availableSeeds(): string[] {
  if (!existsSync(SEEDS_DIR)) return [];
  const onDisk = readdirSync(SEEDS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .map((f) => f.replace(/\.sql$/, ''));

  // Known order first, then anything new that has not been slotted in yet.
  const known = ORDER.filter((n) => onDisk.includes(n));
  const extra = onDisk.filter((n) => !ORDER.includes(n as (typeof ORDER)[number])).sort();
  return [...known, ...extra];
}

/**
 * Run one seed file. Each statement gets its own try/catch: these are
 * `ON CONFLICT DO UPDATE` upserts against reference data, and one row with a
 * stale org_id must not abort the other several thousand.
 */
export async function runSeed(
  sql: postgres.Sql,
  name: string,
  opts: { dryRun?: boolean } = {},
): Promise<SeedResult> {
  const path = seedPath(name);
  if (!existsSync(path)) throw new Error(`No seed file: ${path}`);

  const statements = splitStatements(readFileSync(path, 'utf8'));
  const result: SeedResult = { name, applied: 0, failed: 0, errors: [] };

  if (opts.dryRun) {
    result.applied = statements.length;
    return result;
  }

  for (const statement of statements) {
    try {
      await sql.unsafe(statement);
      result.applied++;
    } catch (err) {
      result.failed++;
      if (result.errors.length < 10) {
        result.errors.push(`${(err as Error).message} — ${statement.slice(0, 120)}`);
      }
    }
  }

  return result;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const names = args.filter((a) => !a.startsWith('--'));

  const all = availableSeeds();

  if (args.includes('--list')) {
    for (const name of all) {
      const count = splitStatements(readFileSync(seedPath(name), 'utf8')).length;
      console.log(`  ${name.padEnd(20)} ${String(count).padStart(5)} statements`);
    }
    return;
  }

  const selected = names.length ? names : all;
  for (const name of selected) {
    if (!all.includes(name)) throw new Error(`Unknown seed: ${name}. Try --list.`);
  }

  // Seeds are reference data, not schema, but they are bulk writes of the same
  // shape as migrations — take the direct connection for the same reason.
  const url = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL_DIRECT (or DATABASE_URL) is required.');

  const sql = postgres(url, { max: 2, onnotice: () => {} });
  let totalApplied = 0;
  let totalFailed = 0;

  try {
    for (const name of selected) {
      const result = await runSeed(sql, name, { dryRun });
      totalApplied += result.applied;
      totalFailed += result.failed;

      const label = dryRun ? 'would run' : 'applied';
      console.log(
        `  ${name.padEnd(20)} ${label} ${String(result.applied).padStart(5)}` +
          (result.failed ? `  failed ${result.failed}` : ''),
      );
      for (const error of result.errors) console.log(`      ${error}`);
    }
  } finally {
    await sql.end();
  }

  console.log(
    `\n${dryRun ? 'would apply' : 'applied'} ${totalApplied} statements` +
      (totalFailed ? `, ${totalFailed} failed` : ''),
  );

  // A failed row is survivable and reported, but it should not read as success
  // to a CI step or a shell `&&` chain.
  if (totalFailed) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

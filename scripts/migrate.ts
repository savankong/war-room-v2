/**
 * Migration runner — engineering spec §2.
 *
 * "Numbered .sql files in migrations/, run by a committed runner script
 *  against the direct connection string." Every schema change goes through a
 * file in this repo — never a query run by hand against a console.
 *
 * Connection: always the DIRECT string, never the pooled one. DO's managed
 * Postgres puts PgBouncer in transaction mode on the pooled port, which breaks
 * prepared statements and session-scoped SQL — including the advisory lock this
 * runner takes and the multi-statement DDL in the migration files.
 *
 * Usage:
 *   npm run migrate                 apply everything pending
 *   npm run migrate -- --status     list applied/pending, change nothing
 *   npm run migrate -- --dry-run    print what would run, change nothing
 *   npm run migrate -- --baseline 040
 *                                   mark 001-040 applied WITHOUT running them
 *
 * The baseline flag exists for exactly one job: the production database that
 * predates this runner already had 001-040 applied by hand, and re-running them
 * is not safe (019 and 020 are data migrations, not just IF NOT EXISTS DDL).
 * Run the baseline once against the restored database, then migrate normally
 * forever after. A database built from zero skips it.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import postgres from 'postgres';
import { config } from 'dotenv';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const ROOT = resolve(__dirname, '..');

/** Migrations 041+ live here, one flat .sql file per version. */
const MIGRATIONS_DIR = join(ROOT, 'migrations');

/**
 * Migrations 001-040, kept so a from-zero build still reproduces the whole
 * schema. They use a directory-per-migration layout because that is how the
 * tool that created them wrote them; 041+ are flat files. Both are loaded, and
 * version numbers are what order them, so the two layouts coexist without
 * anything needing to be rewritten.
 */
const LEGACY_DIR = join(MIGRATIONS_DIR, 'legacy');

/**
 * Three digits, plus an optional lowercase letter for a migration inserted
 * into an already-applied sequence (028a runs after 028, before 029). String
 * sort orders these correctly because the suffix only ever extends a prefix.
 */
const VERSION_DIR = /^(\d{3}[a-z]?)_(.+)$/;
const VERSION_FILE = /^(\d{3}[a-z]?)_(.+)\.sql$/;

interface Migration {
  version: string;
  name: string;
  path: string;
  sql: string;
}

function loadMigrations(): Migration[] {
  const found: Migration[] = [];

  if (existsSync(LEGACY_DIR)) {
    for (const entry of readdirSync(LEGACY_DIR, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const match = VERSION_DIR.exec(entry.name);
      if (!match) continue;
      const file = join(LEGACY_DIR, entry.name, 'migration.sql');
      if (!existsSync(file)) continue;
      found.push({
        version: match[1],
        name: match[2],
        path: file,
        sql: readFileSync(file, 'utf8'),
      });
    }
  }

  if (existsSync(MIGRATIONS_DIR)) {
    for (const entry of readdirSync(MIGRATIONS_DIR)) {
      const match = VERSION_FILE.exec(entry);
      if (!match) continue;
      found.push({
        version: match[1],
        name: match[2],
        path: join(MIGRATIONS_DIR, entry),
        sql: readFileSync(join(MIGRATIONS_DIR, entry), 'utf8'),
      });
    }
  }

  found.sort((a, b) => a.version.localeCompare(b.version));

  const seen = new Map<string, string>();
  for (const m of found) {
    const prior = seen.get(m.version);
    if (prior) {
      throw new Error(
        `Duplicate migration version ${m.version}: "${prior}" and "${m.name}". ` +
          `Renumber one of them before running.`,
      );
    }
    seen.set(m.version, m.name);
  }

  return found;
}

function connectionString(): string {
  const direct = process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;
  if (!direct) {
    throw new Error(
      'DATABASE_URL_DIRECT (preferred) or DATABASE_URL must be set. ' +
        'Use the DIRECT connection string — migrations fail against the pooled port.',
    );
  }
  if (!process.env.DATABASE_URL_DIRECT) {
    console.warn(
      '! DATABASE_URL_DIRECT not set, falling back to DATABASE_URL.\n' +
        '  If that is the pooled (PgBouncer) string, DDL here will fail or hang.',
    );
  }
  return direct;
}

async function main() {
  const args = process.argv.slice(2);
  const statusOnly = args.includes('--status');
  const dryRun = args.includes('--dry-run');
  const baselineIdx = args.indexOf('--baseline');
  const baseline = baselineIdx >= 0 ? args[baselineIdx + 1] : null;

  if (baselineIdx >= 0 && !/^\d{3}$/.test(baseline ?? '')) {
    throw new Error('--baseline needs a three-digit version, e.g. --baseline 040');
  }

  const url = connectionString();
  const isLocal = url.includes('localhost') || url.includes('127.0.0.1');
  const sql = postgres(url, {
    ssl: isLocal ? false : 'require',
    max: 1,
    idle_timeout: 20,
    connect_timeout: 30,
    // Migrations are DDL against the direct port; prepared statements add
    // nothing here and complicate multi-statement files.
    prepare: false,
    // IF NOT EXISTS DDL emits a NOTICE per skipped object, which the default
    // handler dumps as a multi-line object and buries the actual progress.
    onnotice: (notice) => {
      if (process.env.MIGRATE_VERBOSE) console.log(`    notice: ${notice.message}`);
    },
  });

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version     TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        applied_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        checksum    TEXT
      )
    `;

    const migrations = loadMigrations();
    const appliedRows = await sql<{ version: string }[]>`SELECT version FROM schema_migrations`;
    const applied = new Set(appliedRows.map((r) => r.version));

    if (statusOnly) {
      console.log(`\n  ${migrations.length} migrations, ${applied.size} applied\n`);
      for (const m of migrations) {
        console.log(`  ${applied.has(m.version) ? '✓' : ' '} ${m.version} ${m.name}`);
      }
      console.log();
      return;
    }

    if (baseline) {
      const toMark = migrations.filter((m) => m.version <= baseline && !applied.has(m.version));
      if (!toMark.length) {
        console.log(`Nothing to baseline at or below ${baseline}.`);
        return;
      }
      console.log(`Marking ${toMark.length} migrations applied WITHOUT running them:`);
      for (const m of toMark) console.log(`  ${m.version} ${m.name}`);
      if (dryRun) {
        console.log('\n--dry-run: nothing written.');
        return;
      }
      await sql`
        INSERT INTO schema_migrations ${sql(
          toMark.map((m) => ({ version: m.version, name: m.name, checksum: 'baselined' })),
          'version',
          'name',
          'checksum',
        )}
        ON CONFLICT (version) DO NOTHING
      `;
      console.log('\nBaseline recorded. Run `npm run migrate` to apply the rest.');
      return;
    }

    const pending = migrations.filter((m) => !applied.has(m.version));
    if (!pending.length) {
      console.log('Up to date, nothing to apply.');
      return;
    }

    if (dryRun) {
      console.log(`--dry-run: ${pending.length} migrations would run:`);
      for (const m of pending) console.log(`  ${m.version} ${m.name}`);
      return;
    }

    // Two deploys rolling at once must not run the same DDL twice.
    const [{ locked }] = await sql<{ locked: boolean }[]>`
      SELECT pg_try_advisory_lock(hashtext('war_room_migrations')) AS locked
    `;
    if (!locked) {
      throw new Error('Another migration run holds the advisory lock. Try again shortly.');
    }

    try {
      for (const m of pending) {
        process.stdout.write(`  ${m.version} ${m.name} ... `);
        const started = Date.now();
        // Each migration is one transaction: it applies whole or not at all.
        await sql.begin(async (tx) => {
          await tx.unsafe(m.sql);
          await tx`
            INSERT INTO schema_migrations (version, name)
            VALUES (${m.version}, ${m.name})
          `;
        });
        console.log(`ok (${Date.now() - started}ms)`);
      }
      console.log(`\nApplied ${pending.length} migrations.`);
    } finally {
      await sql`SELECT pg_advisory_unlock(hashtext('war_room_migrations'))`;
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error(`\nMigration failed: ${(err as Error).message}`);
  process.exit(1);
});

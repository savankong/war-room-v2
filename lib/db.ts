/**
 * Database client — engineering spec §2.
 *
 * Built on the `postgres` (porsager) package. Its tagged-template call style is
 * why the spec picked this client over an ORM: the `db\`...\`` sites throughout
 * app/api are written directly against it.
 *
 * Two connections, deliberately:
 *
 *   getDb()       pooled  — every request path and worker job
 *   getDirectDb() direct  — migrations and anything session-scoped
 *
 * DO's pooled port runs PgBouncer in transaction mode. That breaks prepared
 * statements (hence `prepare: false`), advisory locks, LISTEN/NOTIFY, and
 * session-scoped SET. Anything needing those must take the direct connection
 * and must not hold it: the direct port has a far smaller connection ceiling.
 */
import postgres from 'postgres';

type Sql = ReturnType<typeof postgres>;

let _pooled: Sql | null = null;
let _direct: Sql | null = null;

function baseOptions(url: string) {
  const isLocal = url.includes('localhost') || url.includes('127.0.0.1');
  return {
    ssl: isLocal ? false : ('require' as const),
    idle_timeout: 20,
    connect_timeout: 10,
    // Required on the pooled port; harmless on the direct one. Kept on both so
    // a call site cannot break by moving between them.
    prepare: false,
  };
}

/**
 * Pooled connection. Use this everywhere except migrations.
 *
 * max: 1 because serverless-style request handlers each get their own module
 * instance; a larger per-instance pool multiplies out against PgBouncer's
 * client limit rather than helping throughput.
 */
export function getDb(): Sql {
  if (!_pooled) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL not set');
    _pooled = postgres(url, { ...baseOptions(url), max: 1 });
  }
  return _pooled;
}

/**
 * Direct (non-PgBouncer) connection. Migrations, advisory locks, and any
 * session-scoped SQL. Falls back to DATABASE_URL with a warning so local dev
 * against a plain Postgres keeps working with one variable set.
 */
export function getDirectDb(): Sql {
  if (!_direct) {
    const url = process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL_DIRECT or DATABASE_URL must be set');
    if (!process.env.DATABASE_URL_DIRECT) {
      console.warn('DATABASE_URL_DIRECT not set; using DATABASE_URL for a direct-connection call site.');
    }
    _direct = postgres(url, { ...baseOptions(url), max: 2 });
  }
  return _direct;
}

/**
 * @deprecated Legacy name from a schema that issued separate reader and writer
 * credentials. Reads and writes now use the same pooled connection, so this is
 * just getDb(). Kept so the existing app/api call sites compile; prefer getDb()
 * in new code.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLegacyDb(): any {
  return getDb();
}

/**
 * @deprecated See getLegacyDb. Same connection, older name.
 *
 * Returns `any` rather than Sql on purpose. The v2 routes were written against
 * a client typed `any` and assert row shapes directly — `await db`...`` as
 * Contact[]`. Typing this as Sql turns every one of those into a TS2352, which
 * is noise, not a bug found: the assertions were always unchecked. New code
 * takes getDb() and gets real types.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getWriteDb(): any {
  return getDb();
}

/** Close pools. Worker shutdown and CLI scripts; never a request handler. */
export async function closeDb(): Promise<void> {
  await Promise.all([
    _pooled?.end({ timeout: 5 }),
    _direct?.end({ timeout: 5 }),
  ]);
  _pooled = null;
  _direct = null;
}

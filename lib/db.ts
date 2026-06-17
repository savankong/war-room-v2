import postgres from 'postgres';

let _sql: ReturnType<typeof postgres> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDb(): any {
  if (!_sql) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');
    _sql = postgres(process.env.DATABASE_URL, {
      ssl: 'require',
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });
  }
  return _sql;
}

// Write-capable DB using Netlify owner credentials (@netlify/database)
// Falls back to getDb() in non-Netlify environments (local dev)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getWriteDb(): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getDatabase } = require('@netlify/database');
    const ndb = getDatabase();
    // Wrap ndb.sql so callers can use db`...` instead of db.sql`...`
    const fn = ndb.sql.bind(ndb) as any;
    fn.unsafe = (s: string) => ({ __unsafe: s });
    // .bind() doesn't copy own-property methods; proxy them manually
    if (ndb.sql.array)  fn.array  = ndb.sql.array.bind(ndb.sql);
    if (ndb.sql.json)   fn.json   = ndb.sql.json.bind(ndb.sql);
    if (ndb.sql.file)   fn.file   = ndb.sql.file.bind(ndb.sql);
    return fn;
  } catch {
    return getDb();
  }
}

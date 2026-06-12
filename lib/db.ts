import postgres from 'postgres';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  max: 1,            // one connection per serverless instance — avoids exhausting Neon limits
  idle_timeout: 20,  // release idle connections quickly between invocations
  connect_timeout: 10,
  prepare: false,    // required for PgBouncer / Neon pooler compatibility
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDb(): any {
  return sql;
}

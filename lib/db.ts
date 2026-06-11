import postgres from 'postgres';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDb(): any {
  return sql;
}

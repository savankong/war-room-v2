import { neon } from '@netlify/database';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const db = neon(process.env.DATABASE_URL);

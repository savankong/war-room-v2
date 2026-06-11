import sql from './db';

const cache = new Map<string, string | null>();

export async function resolveOrgId(agencyName: string | null): Promise<string | null> {
  if (!agencyName) return null;

  const key = agencyName.toLowerCase().trim();
  if (cache.has(key)) return cache.get(key)!;

  // 1. Exact match
  let rows = await sql<{ id: string }[]>`
    SELECT id FROM organizations WHERE lower(name) = ${key} LIMIT 1
  `;

  // 2. Name contains the agency string or agency string contains the name
  if (!rows.length) {
    rows = await sql<{ id: string }[]>`
      SELECT id FROM organizations
      WHERE lower(name) ILIKE ${'%' + key + '%'}
         OR ${key} ILIKE '%' || lower(name) || '%'
      ORDER BY length(name) DESC
      LIMIT 1
    `;
  }

  const id = rows[0]?.id ?? null;
  cache.set(key, id);
  return id;
}

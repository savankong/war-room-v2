import sql from './db';

const cache = new Map<string, string | null>();

export async function resolveOrgId(agencyName: string | null): Promise<string | null> {
  if (!agencyName) return null;
  const key = agencyName.toLowerCase().trim();
  if (cache.has(key)) return cache.get(key)!;

  let rows = await sql<{ id: string }[]>`
    SELECT id FROM orgs WHERE lower(name) = ${key} LIMIT 1
  `;
  if (!rows.length) {
    rows = await sql<{ id: string }[]>`
      SELECT id FROM orgs
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

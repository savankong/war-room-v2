import sql from './db';

const cache = new Map<string, string | null>();

export async function resolveOrgId(agencyName: string | null): Promise<string | null> {
  if (!agencyName) return null;
  const key = agencyName.toLowerCase().trim();
  if (cache.has(key)) return cache.get(key)!;

  let rows = await sql<{ id: string }[]>`
    SELECT id FROM orgs WHERE lower(full_name) = ${key} LIMIT 1
  `;
  if (!rows.length) {
    rows = await sql<{ id: string }[]>`
      SELECT id FROM orgs
      WHERE lower(full_name) ILIKE ${'%' + key + '%'}
         OR ${key} ILIKE '%' || lower(full_name) || '%'
      ORDER BY length(full_name) DESC
      LIMIT 1
    `;
  }

  const id = rows[0]?.id ?? null;
  cache.set(key, id);
  return id;
}

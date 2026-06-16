import sql from './db';

const cache = new Map<string, string | null>();

export async function resolveOrgId(
  officeCode: string | null,
  agencyName: string | null
): Promise<string | null> {
  const cacheKey = (officeCode ?? '') + '|' + (agencyName ?? '');
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  let id: string | null = null;

  // 1. Exact match on org id (office code like "fa4600")
  if (officeCode) {
    const rows = await sql<{ id: string }[]>`
      SELECT id FROM orgs WHERE lower(id) = ${officeCode.toLowerCase()} LIMIT 1
    `;
    id = rows[0]?.id ?? null;
  }

  // 2. Abbreviation match
  if (!id && officeCode) {
    const rows = await sql<{ id: string }[]>`
      SELECT id FROM orgs WHERE lower(abbreviation) = ${officeCode.toLowerCase()} LIMIT 1
    `;
    id = rows[0]?.id ?? null;
  }

  // 3. Fuzzy full_name match on department
  if (!id && agencyName) {
    const key = agencyName.toLowerCase().trim();
    const rows = await sql<{ id: string }[]>`
      SELECT id FROM orgs
      WHERE lower(full_name) ILIKE ${'%' + key + '%'}
         OR ${key} ILIKE '%' || lower(full_name) || '%'
      ORDER BY length(full_name) DESC
      LIMIT 1
    `;
    id = rows[0]?.id ?? null;
  }

  cache.set(cacheKey, id);
  return id;
}

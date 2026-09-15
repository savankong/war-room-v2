import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, ownsCompany, unauthorized, forbidden } from '@/lib/auth';

/**
 * GET /api/companies/:id/profile
 * PUT /api/companies/:id/profile
 *
 * Onboarding steps 2 and 3 (§7.1), and the profile editor in settings (§7.4).
 *
 * Next 16: the dynamic segment arrives as a Promise and must be awaited.
 */
export const dynamic = 'force-dynamic';

function asArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((v) => String(v).trim()).filter(Boolean))];
}

function asMoney(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export async function GET(req: Request, ctx: RouteContext<'/api/companies/[id]/profile'>) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  const { id } = await ctx.params;
  if (!(await ownsCompany(userId, id))) return forbidden();

  const sql = getDb();
  const [profile] = await sql`
    SELECT naics_codes, psc_codes, set_asides, vehicles, target_org_ids,
           capabilities, keywords, excluded_keywords, min_value, max_value,
           prime_pref, geo_constraints, source, version, updated_at
    FROM company_profiles WHERE user_company_id = ${id}
  `;

  const pastPerformance = await sql`
    SELECT id, title, description, canonical_org_id, naics_code, psc_code,
           value, vehicle, start_date, end_date
    FROM company_past_performance
    WHERE user_company_id = ${id}
    ORDER BY end_date DESC NULLS LAST
  `;

  return NextResponse.json({ profile: profile ?? null, pastPerformance });
}

export async function PUT(req: Request, ctx: RouteContext<'/api/companies/[id]/profile'>) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  const { id } = await ctx.params;
  if (!(await ownsCompany(userId, id))) return forbidden();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const minValue = asMoney(body.min_value);
  const maxValue = asMoney(body.max_value);
  if (minValue !== null && maxValue !== null && minValue > maxValue) {
    return NextResponse.json({ error: 'Minimum value cannot exceed maximum value' }, { status: 400 });
  }

  const primePref = ['prime', 'sub', 'either'].includes(String(body.prime_pref))
    ? String(body.prime_pref)
    : 'either';

  const sql = getDb();

  // §7.1: "Selecting a parent org auto-includes its children as targets"
  // (acceptance criterion 1). Expanded on write rather than at scoring time so
  // the customer can see and remove individual children afterwards.
  const requestedOrgs = asArray(body.target_org_ids);
  let targetOrgIds = requestedOrgs;
  if (requestedOrgs.length) {
    const expanded = await sql<{ id: string }[]>`
      WITH RECURSIVE tree AS (
        SELECT id, 0 AS depth FROM orgs WHERE id = ANY(${requestedOrgs})
        UNION ALL
        SELECT o.id, t.depth + 1 FROM orgs o JOIN tree t ON o.parent_id = t.id
        WHERE t.depth < 5
      )
      SELECT DISTINCT id FROM tree
    `;
    targetOrgIds = expanded.map((r) => r.id);
  }

  const [saved] = await sql`
    INSERT INTO company_profiles (
      user_company_id, naics_codes, psc_codes, set_asides, vehicles,
      target_org_ids, capabilities, keywords, excluded_keywords,
      min_value, max_value, prime_pref, geo_constraints, source, version
    ) VALUES (
      ${id}, ${asArray(body.naics_codes)}, ${asArray(body.psc_codes)},
      ${asArray(body.set_asides)}, ${asArray(body.vehicles)},
      ${targetOrgIds}, ${asArray(body.capabilities)}, ${asArray(body.keywords)},
      ${asArray(body.excluded_keywords)}, ${minValue}, ${maxValue},
      ${primePref}, ${asArray(body.geo_constraints)}, 'manual', 1
    )
    ON CONFLICT (user_company_id) DO UPDATE SET
      naics_codes       = EXCLUDED.naics_codes,
      psc_codes         = EXCLUDED.psc_codes,
      set_asides        = EXCLUDED.set_asides,
      vehicles          = EXCLUDED.vehicles,
      target_org_ids    = EXCLUDED.target_org_ids,
      capabilities      = EXCLUDED.capabilities,
      keywords          = EXCLUDED.keywords,
      excluded_keywords = EXCLUDED.excluded_keywords,
      min_value         = EXCLUDED.min_value,
      max_value         = EXCLUDED.max_value,
      prime_pref        = EXCLUDED.prime_pref,
      geo_constraints   = EXCLUDED.geo_constraints,
      -- Bumped on every edit. matches.profile_version records which version
      -- produced a score, so a stale match is identifiable without rescoring.
      version           = company_profiles.version + 1,
      updated_at        = now()
    RETURNING *
  `;

  if (body.complete_onboarding) {
    await sql`
      UPDATE user_companies
      SET onboarding_completed_at = COALESCE(onboarding_completed_at, now()),
          onboarding_step = 3,
          updated_at = now()
      WHERE id = ${id}
    `;
  }

  return NextResponse.json({ profile: saved });
}

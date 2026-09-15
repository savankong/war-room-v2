import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, getOwnedCompany, unauthorized } from '@/lib/auth';
import { TRIAL_DAYS } from '@/lib/billing/stripe';

/**
 * POST /api/companies — onboarding step 1 (§7.1, "Company basics").
 * GET  /api/companies — the caller's company, for deciding whether to route
 *                       them to onboarding or to Today.
 */
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  const company = await getOwnedCompany(userId);
  if (!company) return NextResponse.json({ company: null });

  const sql = getDb();
  const [profile] = await sql<{ user_company_id: string }[]>`
    SELECT user_company_id FROM company_profiles WHERE user_company_id = ${company.id}
  `;

  return NextResponse.json({
    company: {
      ...company,
      hasProfile: Boolean(profile),
      onboardingComplete: Boolean(company.onboardingCompletedAt),
    },
  });
}

export async function POST(req: Request) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  let body: { name?: string; website?: string; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: 'Company name is required' }, { status: 400 });

  const sql = getDb();

  // One company per owner for now (§14 puts the team workspace out of scope),
  // so a second POST edits the first rather than creating a duplicate.
  const existing = await getOwnedCompany(userId);
  if (existing) {
    const [updated] = await sql<{ id: string }[]>`
      UPDATE user_companies SET
        name        = ${name},
        website     = ${body.website?.trim() || null},
        description = ${body.description?.trim() || null},
        updated_at  = now()
      WHERE id = ${existing.id}
      RETURNING id
    `;
    return NextResponse.json({ id: updated.id, created: false });
  }

  const [created] = await sql<{ id: string }[]>`
    INSERT INTO user_companies (name, website, description, owner_user_id, plan, trial_ends_at, onboarding_step)
    VALUES (
      ${name}, ${body.website?.trim() || null}, ${body.description?.trim() || null},
      ${Number(userId)}, 'trial',
      now() + (${TRIAL_DAYS}::int || ' days')::interval,
      2
    )
    RETURNING id
  `;

  return NextResponse.json({ id: created.id, created: true }, { status: 201 });
}

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, ownsCompany, unauthorized, forbidden } from '@/lib/auth';
import { createCheckoutSession, createPortalSession } from '@/lib/billing/stripe';

/**
 * POST /api/stripe/checkout — start a subscription (§7.4).
 * PUT  /api/stripe/checkout — open the Stripe billing portal.
 *
 * Product spec §9: one tier, $149/month, 14 day trial. The price itself lives
 * in Stripe (STRIPE_PRICE_ID_CAPTURE) rather than in code, so changing it does
 * not need a deploy.
 */
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  let body: { companyId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const companyId = body.companyId;
  if (!companyId) return NextResponse.json({ error: 'companyId is required' }, { status: 400 });
  if (!(await ownsCompany(userId, companyId))) return forbidden();

  const sql = getDb();
  const [user] = await sql<{ email: string }[]>`SELECT email FROM users WHERE id = ${Number(userId)}`;
  if (!user) return unauthorized();

  try {
    const { url } = await createCheckoutSession(sql, { userCompanyId: companyId, email: user.email });
    return NextResponse.json({ url });
  } catch (err) {
    console.error(`Stripe checkout failed: ${(err as Error).message}`);
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  let body: { companyId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const companyId = body.companyId;
  if (!companyId) return NextResponse.json({ error: 'companyId is required' }, { status: 400 });
  if (!(await ownsCompany(userId, companyId))) return forbidden();

  try {
    const { url } = await createPortalSession(getDb(), companyId);
    return NextResponse.json({ url });
  } catch (err) {
    console.error(`Stripe portal failed: ${(err as Error).message}`);
    return NextResponse.json({ error: 'Could not open the billing portal' }, { status: 500 });
  }
}

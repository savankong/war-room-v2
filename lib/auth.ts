/**
 * Request authentication helpers.
 *
 * The v2 scheme is a JWT in localStorage sent as `Authorization: Bearer`, set
 * by /login and /register. Every v3 route keeps that scheme rather than
 * introducing a second one — a half-migrated auth model is worse than either
 * whole one, and moving to cookies is its own change.
 *
 * This file exists because the same twelve lines of jwt.verify were being
 * copied into every route, and one of those copies will eventually forget the
 * try/catch.
 */
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { getDb } from './db';

export interface AuthedUser {
  userId: string;
}

/** Bearer token -> user id, or null when absent, malformed, or expired. */
export function getUserId(req: Request): string | null {
  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
  if (!token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET not set; rejecting every authenticated request');
    return null;
  }

  try {
    const payload = jwt.verify(token, secret) as { userId?: string | number };
    return payload.userId != null ? String(payload.userId) : null;
  } catch {
    return null;
  }
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function forbidden(): NextResponse {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

/**
 * The company this user owns. Every v3 surface is scoped to one company, so
 * this is the second half of almost every authorization check.
 */
export async function getOwnedCompany(
  userId: string,
): Promise<{ id: string; name: string; plan: string; status: string; onboardingCompletedAt: Date | null } | null> {
  const sql = getDb();
  const [row] = await sql<
    { id: string; name: string; plan: string; status: string; onboarding_completed_at: Date | null }[]
  >`
    SELECT id, name, plan, status, onboarding_completed_at
    FROM user_companies
    WHERE owner_user_id = ${Number(userId)} AND status <> 'deleted'
    ORDER BY created_at ASC
    LIMIT 1
  `;
  return row
    ? {
        id: row.id,
        name: row.name,
        plan: row.plan,
        status: row.status,
        onboardingCompletedAt: row.onboarding_completed_at,
      }
    : null;
}

/**
 * Assert this user owns this company.
 *
 * Checked on every company-scoped route. Company ids are in URLs the customer
 * can see and edit, so without this any logged-in account could read another
 * company's matches and briefs by changing one path segment.
 */
export async function ownsCompany(userId: string, companyId: string): Promise<boolean> {
  const sql = getDb();
  const [row] = await sql<{ id: string }[]>`
    SELECT id FROM user_companies
    WHERE id = ${companyId} AND owner_user_id = ${Number(userId)} AND status <> 'deleted'
  `;
  return Boolean(row);
}

/**
 * Internal-only routes (§7.5 admin). Guarded by a shared bearer token rather
 * than a user role, because `users` has no role column and inventing one for
 * an internal screen is more surface than the screen is worth.
 */
export function isInternalRequest(req: Request): boolean {
  const expected = process.env.SAM_SYNC_TOKEN;
  if (!expected) return false;

  const header = req.headers.get('authorization') ?? '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
  const query = new URL(req.url).searchParams.get('token');

  return bearer === expected || query === expected;
}

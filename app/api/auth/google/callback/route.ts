import { NextResponse, NextRequest } from 'next/server';
import { getWriteDb as getDb } from '@/lib/db';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

/**
 * Google OAuth callback.
 *
 * Every failure path here redirects to /login with a distinct `?error=` code
 * and logs the cause server-side. It never throws out of the handler.
 *
 * That is not defensiveness for its own sake: this route previously had no
 * try/catch at all, so a missing JWT_SECRET or an unreachable database
 * surfaced to the customer as a bare HTTP 500 on a URL full of OAuth
 * parameters, with nothing in the response to say which step failed. The codes
 * below are stable and safe to read from the address bar; the detail stays in
 * the logs, because an error string can carry a connection URL.
 */
export async function GET(req: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.warroomusa.com';

  function fail(code: string, detail?: unknown) {
    const message =
      detail instanceof Error ? detail.message : detail === undefined ? '' : String(detail);
    console.error(`[auth/google/callback] ${code}${message ? `: ${message}` : ''}`);
    return NextResponse.redirect(`${siteUrl}/login?error=${code}`);
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const jwtSecret = process.env.JWT_SECRET;

    // Checked before any network call so a misconfigured deploy fails on the
    // first request with a named cause rather than part-way through the
    // exchange.
    if (!clientId || !clientSecret) return fail('google_not_configured');
    if (!jwtSecret) return fail('jwt_not_configured');

    const redirectUri = `${siteUrl}/api/auth/google/callback`;
    const code = req.nextUrl.searchParams.get('code');
    const oauthError = req.nextUrl.searchParams.get('error');

    if (oauthError || !code) return fail('google_cancelled', oauthError);

    /* Exchange code for tokens */
    let tokenRes: Response;
    try {
      tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });
    } catch (err) {
      return fail('google_token_unreachable', err);
    }

    if (!tokenRes.ok) {
      return fail('google_token', `${tokenRes.status} ${await tokenRes.text().catch(() => '')}`);
    }

    let access_token: string | undefined;
    try {
      ({ access_token } = await tokenRes.json());
    } catch (err) {
      return fail('google_token_malformed', err);
    }
    if (!access_token) return fail('google_token_missing');

    /* Get user profile from Google */
    let profileRes: Response;
    try {
      profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
    } catch (err) {
      return fail('google_profile_unreachable', err);
    }

    if (!profileRes.ok) return fail('google_profile', profileRes.status);

    let profile: { id: string; email: string; name: string };
    try {
      profile = await profileRes.json();
    } catch (err) {
      return fail('google_profile_malformed', err);
    }

    if (!profile.email) return fail('google_no_email');

    /* Upsert user — find by email, create if new */
    let user: { id: string; email: string; full_name: string };
    try {
      const db = getDb();
      const email = profile.email.toLowerCase();
      const existing = await db`SELECT id, email, full_name FROM users WHERE email = ${email} LIMIT 1`;

      if (existing.length) {
        user = existing[0] as typeof user;
        await db`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`;
      } else {
        const rows = await db`
          INSERT INTO users (email, password_hash, full_name)
          VALUES (${email}, '', ${profile.name})
          RETURNING id, email, full_name
        `;
        user = rows[0] as typeof user;
      }
    } catch (err) {
      // Covers both an unset DATABASE_URL, which getDb() throws on, and any
      // connection or query failure once it is set.
      return fail('database_unavailable', err);
    }

    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });

    /* Redirect to /auth/callback with token in URL fragment — client picks it up */
    return NextResponse.redirect(`${siteUrl}/auth/callback#token=${token}`);
  } catch (err) {
    return fail('google_unexpected', err);
  }
}

import { NextResponse, NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const siteUrl      = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.warroomusa.com';
  const clientId     = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const jwtSecret    = process.env.JWT_SECRET!;
  const redirectUri  = `${siteUrl}/api/auth/google/callback`;

  const code  = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(`${siteUrl}/login?error=google_cancelled`);
  }

  /* Exchange code for tokens */
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     clientId,
      client_secret: clientSecret,
      redirect_uri:  redirectUri,
      grant_type:    'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${siteUrl}/login?error=google_token`);
  }

  const { access_token } = await tokenRes.json();

  /* Get user profile from Google */
  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!profileRes.ok) {
    return NextResponse.redirect(`${siteUrl}/login?error=google_profile`);
  }

  const profile: { id: string; email: string; name: string } = await profileRes.json();

  if (!profile.email) {
    return NextResponse.redirect(`${siteUrl}/login?error=google_no_email`);
  }

  /* Upsert user — find by email, create if new */
  const db = getDb();
  const existing = await db`SELECT id, email, full_name FROM users WHERE email = ${profile.email.toLowerCase()} LIMIT 1`;

  let user: { id: string; email: string; full_name: string };

  if (existing.length) {
    user = existing[0] as typeof user;
    await db`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`;
  } else {
    const rows = await db`
      INSERT INTO users (email, password_hash, full_name)
      VALUES (${profile.email.toLowerCase()}, '', ${profile.name})
      RETURNING id, email, full_name
    `;
    user = rows[0] as typeof user;
  }

  const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });

  /* Redirect to /discover with token in URL fragment — client picks it up */
  return NextResponse.redirect(`${siteUrl}/auth/callback#token=${token}`);
}

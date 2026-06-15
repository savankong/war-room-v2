import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.warroomusa.com';

  if (!clientId) return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 });

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  `${siteUrl}/api/auth/google/callback`,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'online',
    prompt:        'select_account',
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}

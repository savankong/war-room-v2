import { NextResponse } from 'next/server';
import { getWriteDb as getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  const db = getDb();

  if (action === 'confirm') {
    const { token, new_password } = await req.json();
    if (!token || !new_password || new_password.length < 8)
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    const rows = await db`SELECT id, reset_token_expires FROM users WHERE reset_token = ${token} LIMIT 1`;
    const row = rows[0];
    if (!row) return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
    if (new Date(row.reset_token_expires) < new Date())
      return NextResponse.json({ error: 'Reset link has expired' }, { status: 400 });

    const hash = await bcrypt.hash(new_password, 10);
    await db`UPDATE users SET password_hash = ${hash}, reset_token = NULL, reset_token_expires = NULL WHERE id = ${row.id}`;
    return NextResponse.json({ ok: true, message: 'Password reset successfully. You can now sign in.' });
  }

  /* Generate token */
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

  const rows = await db`SELECT id, full_name FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1`;
  if (!rows.length) return NextResponse.json({ ok: true, message: 'If that email exists, a reset link was sent.' });

  const user = rows[0];
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await db`UPDATE users SET reset_token = ${token}, reset_token_expires = ${expires} WHERE id = ${user.id}`;

  /* Send email via Resend if configured, else return token directly */
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://warroom-v2.netlify.app'}/forgot-password?token=${token}`;
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'War Room <noreply@warroomusa.com>',
        to: email,
        subject: 'Reset your War Room password',
        html: `<p>Hi ${user.full_name},</p><p>Click below to reset your password (link expires in 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
      }),
    });
    return NextResponse.json({ ok: true, message: 'If that email exists, a reset link was sent.' });
  }

  return NextResponse.json({ ok: true, token, message: 'Reset token generated.' });
}

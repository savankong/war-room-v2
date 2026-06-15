import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { name, email, organization, subject, message } = await req.json();
  if (!name || !email || !message) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'War Room Contact <noreply@warroomusa.com>',
      to: 'savankong@gmail.com',
      reply_to: email,
      subject: `[WarRoom] ${subject || 'New message'} — ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
          <h2 style="font-size:18px;margin:0 0 24px;border-bottom:1px solid #eee;padding-bottom:12px">New contact form submission</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr><td style="padding:8px 0;color:#888;width:120px">Name</td><td style="padding:8px 0;font-weight:600">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#888">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#c8502d">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#888">Org</td><td style="padding:8px 0">${organization || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#888">Subject</td><td style="padding:8px 0">${subject || '—'}</td></tr>
          </table>
          <div style="background:#f9f9f9;border-radius:6px;padding:16px;font-size:14px;line-height:1.6;white-space:pre-wrap">${message}</div>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: 'Failed to send: ' + err }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

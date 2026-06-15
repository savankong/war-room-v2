import { NextResponse, NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let userId: string;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    userId = payload.userId;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { current_password, new_password } = await req.json();
  if (!current_password || !new_password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  if (new_password.length < 8) return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });

  const db = getDb();
  const rows = await db`SELECT password_hash FROM users WHERE id = ${userId} LIMIT 1`;
  if (!rows.length) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const valid = await bcrypt.compare(current_password, rows[0].password_hash);
  if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });

  const hash = await bcrypt.hash(new_password, 12);
  await db`UPDATE users SET password_hash = ${hash} WHERE id = ${userId}`;
  return NextResponse.json({ ok: true });
}

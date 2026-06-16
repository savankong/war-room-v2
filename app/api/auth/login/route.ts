import { NextResponse } from 'next/server';
import { getWriteDb as getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const db = getDb();
  const rows = await db`SELECT * FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1`;
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  await db`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`;

  const secret = process.env.JWT_SECRET;
  if (!secret) return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });

  const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '7d' });
  return NextResponse.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name } });
}

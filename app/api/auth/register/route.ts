import { NextResponse } from 'next/server';
import { getWriteDb as getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { email, password, full_name, company } = await req.json();
  if (!email || !password || !full_name) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });

  const db = getDb();
  const existing = await db`SELECT id FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1`;
  if (existing.length) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

  const hash = await bcrypt.hash(password, 12);
  const rows = await db`
    INSERT INTO users (email, password_hash, full_name, company)
    VALUES (${email.toLowerCase().trim()}, ${hash}, ${full_name.trim()}, ${company ?? null})
    RETURNING id, email, full_name, company
  `;
  const user = rows[0];

  const secret = process.env.JWT_SECRET;
  if (!secret) return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });

  const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '7d' });
  return NextResponse.json({ token, user });
}

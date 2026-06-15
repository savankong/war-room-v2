import { NextResponse, NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

function getUserId(req: NextRequest): string | null {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return payload.userId;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const rows = await db`SELECT id, email, full_name, company, created_at, last_login FROM users WHERE id = ${userId} LIMIT 1`;
  if (!rows.length) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PATCH(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { full_name, company, email } = await req.json();
  if (!full_name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const db = getDb();

  if (email) {
    const conflict = await db`SELECT id FROM users WHERE email = ${email.toLowerCase().trim()} AND id != ${userId} LIMIT 1`;
    if (conflict.length) return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
  }

  const newEmail = email ? email.toLowerCase().trim() : null;
  const rows = newEmail
    ? await db`UPDATE users SET full_name = ${full_name.trim()}, company = ${company?.trim() ?? null}, email = ${newEmail} WHERE id = ${userId} RETURNING id, email, full_name, company`
    : await db`UPDATE users SET full_name = ${full_name.trim()}, company = ${company?.trim() ?? null} WHERE id = ${userId} RETURNING id, email, full_name, company`;
  return NextResponse.json(rows[0]);
}

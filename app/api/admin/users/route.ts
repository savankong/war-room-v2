import { NextResponse, NextRequest } from 'next/server';
import { getDb, getWriteDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function ensureIsAdminColumn() {
  const db = getWriteDb();
  await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false`;
}

export async function GET() {
  await ensureIsAdminColumn();
  const db = getDb();
  try {
    const rows = await db`
      SELECT id, email, full_name, company, is_admin, created_at, last_login
      FROM users
      ORDER BY created_at DESC
    `;
    return NextResponse.json(rows);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { id, is_admin } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const db = getWriteDb();
  await db`UPDATE users SET is_admin = ${!!is_admin} WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const db = getWriteDb();
  await db`DELETE FROM users WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

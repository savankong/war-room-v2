import { NextResponse, NextRequest } from 'next/server';
import { getWriteDb as getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

const VALID_ROLES = ['admin', 'member', 'viewer'] as const;
type Role = typeof VALID_ROLES[number];

export async function GET() {
  const db = getDb();
  const rows = await db`
    SELECT id, email, full_name, company, role, created_at, last_login, auth_provider
    FROM users
    ORDER BY created_at DESC
  `;
  return NextResponse.json(rows);
}

export async function PATCH(req: NextRequest) {
  const { id, role } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  if (!VALID_ROLES.includes(role as Role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });

  const db = getDb();
  const isAdmin = role === 'admin';
  const rows = await db`
    UPDATE users SET role = ${role}, is_admin = ${isAdmin} WHERE id = ${id}
    RETURNING id, role
  `;
  return NextResponse.json(rows[0]);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const db = getDb();
  await db`DELETE FROM users WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

import { NextResponse, NextRequest } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  try {
    const rows = await db`
      SELECT id, email, full_name, company, created_at, last_login
      FROM users
      ORDER BY created_at DESC
    `;
    return NextResponse.json(rows);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const db = getDb();
  await db`DELETE FROM users WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

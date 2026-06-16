import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const b = await req.json();
  await db`
    UPDATE sub_companies SET
      name         = ${b.name ?? null},
      legal_name   = ${b.legal_name?.trim().toUpperCase() ?? null},
      logo_url     = ${b.logo_url ?? null},
      website      = ${b.website ?? null},
      headquarters = ${b.headquarters ?? null},
      description  = ${b.description ?? null}
    WHERE id = ${id}
  `;
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  await db`DELETE FROM sub_companies WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const b = await req.json();

  await db`
    UPDATE industry_companies SET
      name         = COALESCE(${b.name         ?? null}, name),
      legal_name   = ${b.legal_name   ?? null},
      website      = ${b.website      ?? null},
      description  = ${b.description  ?? null},
      logo_url     = ${b.logo_url     ?? null},
      headquarters = ${b.headquarters ?? null},
      founded      = ${b.founded      ?? null},
      ticker       = ${b.ticker       ?? null},
      employees    = ${b.employees    ?? null},
      updated_at   = NOW()
    WHERE id = ${id}
  `;
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  await db`DELETE FROM industry_companies WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

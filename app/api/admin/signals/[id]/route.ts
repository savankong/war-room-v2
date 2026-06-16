import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const b = await req.json();
  await db`
    UPDATE contracts SET
      title       = COALESCE(${b.title       ?? null}, title),
      signal_type = COALESCE(${b.signal_type ?? null}, signal_type),
      source      = COALESCE(${b.source      ?? null}, source),
      value       = ${b.value      ?? null},
      award_amt   = ${b.award_amt  != null ? Number(b.award_amt) : null},
      award_date  = ${b.award_date ? new Date(b.award_date) : null},
      deadline    = ${b.deadline   ?? null},
      recipient   = ${b.recipient  ?? null},
      org_id      = ${b.org_id     ?? null},
      set_aside   = ${b.set_aside  ?? null},
      poc         = ${b.poc        ?? null},
      poc_email   = ${b.poc_email  ?? null},
      naics       = ${b.naics      ?? null},
      description = ${b.description ?? null}
    WHERE id = ${id}
  `;
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  await db`DELETE FROM contracts WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

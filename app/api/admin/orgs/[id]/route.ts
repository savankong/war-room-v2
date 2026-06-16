import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const b = await req.json();
  await db`
    UPDATE orgs SET
      full_name          = COALESCE(${b.full_name          ?? null}, full_name),
      abbreviation       = ${b.abbreviation       ?? null},
      branch             = ${b.branch             ?? null},
      organization_type  = ${b.organization_type  ?? null},
      description        = ${b.description        ?? null},
      website            = ${b.website            ?? null},
      parent_id          = ${b.parent_id          ?? null},
      is_active          = COALESCE(${b.is_active ?? null}::boolean, is_active),
      loc                = ${b.loc                ?? null},
      abs_hierarchy_level = COALESCE(${b.abs_hierarchy_level ?? null}::integer, abs_hierarchy_level)
    WHERE id = ${id}
  `;
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  await db`DELETE FROM orgs WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

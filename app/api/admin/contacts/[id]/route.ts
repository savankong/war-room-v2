import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const b = await req.json();

  let orgFull: string | null = b.org_full ?? null;
  if (b.org_id) {
    const org = await db`SELECT full_name FROM orgs WHERE id = ${b.org_id} LIMIT 1`;
    orgFull = org[0]?.full_name ?? b.org_id;
  }

  const tags = b.tags
    ? b.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    : null;

  await db`
    UPDATE contacts SET
      name            = COALESCE(${b.name            ?? null}, name),
      title           = ${b.title           ?? null},
      org_id          = ${b.org_id          ?? null},
      org_full        = ${orgFull},
      email           = ${b.email           ?? null},
      phone           = ${b.phone           ?? null},
      linkedin        = ${b.linkedin        ?? null},
      photo_url       = ${b.photo_url       ?? null},
      hierarchy_order = ${b.hierarchy_order != null ? Number(b.hierarchy_order) : null},
      is_inbox        = COALESCE(${b.is_inbox ?? null}::boolean, is_inbox),
      tags            = ${tags ? db.array(tags) : null}
    WHERE id = ${id}
  `;
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  await db`DELETE FROM contacts WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

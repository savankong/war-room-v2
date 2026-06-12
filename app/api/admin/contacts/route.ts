import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const db = getDb();
  const b = await req.json();
  const base = (b.name ?? 'contact').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  const id = `${base}-${Date.now().toString(36)}`;

  let orgFull: string | null = b.org_full ?? null;
  if (b.org_id) {
    const org = await db`SELECT full_name FROM orgs WHERE id = ${b.org_id} LIMIT 1`;
    orgFull = org[0]?.full_name ?? b.org_id;
  }

  await db`
    INSERT INTO contacts (
      id, name, title, org_id, org_full, email, phone, linkedin,
      photo_url, hierarchy_order, is_inbox, tags
    ) VALUES (
      ${id}, ${b.name}, ${b.title ?? null}, ${b.org_id ?? null},
      ${orgFull}, ${b.email ?? null}, ${b.phone ?? null}, ${b.linkedin ?? null},
      ${b.photo_url ?? null}, ${b.hierarchy_order ?? null}, ${b.is_inbox ?? false},
      ${b.tags ? b.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : null}
    )
  `;
  return NextResponse.json({ ok: true, id });
}

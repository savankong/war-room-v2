import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const db = getDb();
  const b = await req.json();
  const id = b.id || b.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

  await db`
    INSERT INTO orgs (
      id, full_name, abbreviation, branch, organization_type, description,
      website, parent_id, is_active, loc, abs_hierarchy_level
    ) VALUES (
      ${id}, ${b.full_name}, ${b.abbreviation ?? null}, ${b.branch ?? null},
      ${b.organization_type ?? null}, ${b.description ?? null},
      ${b.website ?? null}, ${b.parent_id ?? null},
      ${b.is_active ?? true}, ${b.loc ?? null},
      ${b.abs_hierarchy_level ?? null}
    )
  `;
  return NextResponse.json({ ok: true, id });
}

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Idempotently resolves or creates an org by name.
// Returns the org's id (used as slug for /org/[slug]).
export async function POST(req: NextRequest) {
  const db = getDb();
  const { name, type } = await req.json(); // type: 'agency' | 'company'
  if (!name?.trim()) return NextResponse.json({ ok: false }, { status: 400 });

  // 1. Try exact match
  const exact = await db`
    SELECT id FROM orgs WHERE lower(full_name) = lower(${name.trim()}) LIMIT 1
  `;
  if (exact.length > 0) return NextResponse.json({ ok: true, id: exact[0].id, created: false });

  // 2. Try fuzzy match (contains)
  const fuzzy = await db`
    SELECT id FROM orgs
    WHERE full_name ILIKE ${'%' + name.trim() + '%'}
      AND is_active = true
    ORDER BY abs_hierarchy_level NULLS LAST
    LIMIT 1
  `;
  if (fuzzy.length > 0) return NextResponse.json({ ok: true, id: fuzzy[0].id, created: false });

  // 3. Create new org
  const id = name.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
    + '-' + Date.now().toString(36);

  const orgType = type === 'company' ? 'Defense Contractor' : 'Government Agency';

  await db`
    INSERT INTO orgs (id, full_name, organization_type, is_active, hierarchy_level)
    VALUES (${id}, ${name.trim()}, ${orgType}, true, 99)
    ON CONFLICT (id) DO NOTHING
  `;

  // For recipient/company orgs: link any existing contracts where recipient matches
  if (type === 'company') {
    await db`
      UPDATE contracts
      SET org_id = ${id}
      WHERE org_id IS NULL
        AND recipient ILIKE ${name.trim()}
    `;
  }

  return NextResponse.json({ ok: true, id, created: true });
}

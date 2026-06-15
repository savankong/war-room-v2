import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Called from SignalDetailPanel when a signal has POC data.
// Idempotently creates a contact record so the person shows up in the People directory.
export async function POST(req: NextRequest) {
  const db = getDb();
  const { name, email, phone, agency, sub_agency, org_id } = await req.json();

  if (!name) return NextResponse.json({ ok: false, error: 'name required' }, { status: 400 });

  // Check if contact already exists (by email, or by name)
  const existing = email
    ? await db`SELECT id FROM contacts WHERE email = ${email} LIMIT 1`
    : await db`SELECT id FROM contacts WHERE lower(name) = lower(${name}) LIMIT 1`;

  if (existing.length > 0) {
    return NextResponse.json({ ok: true, id: existing[0].id, created: false });
  }

  // Resolve org: prefer explicit org_id, otherwise match by agency name
  let resolvedOrgId: string | null = org_id ?? null;
  let resolvedOrgFull: string | null = null;

  if (!resolvedOrgId && (sub_agency || agency)) {
    const agencyName = sub_agency ?? agency;
    const match = await db`
      SELECT id, full_name FROM orgs
      WHERE full_name ILIKE ${`%${agencyName}%`}
        AND is_active = true
      ORDER BY abs_hierarchy_level NULLS LAST
      LIMIT 1
    `;
    if (match.length > 0) {
      resolvedOrgId = match[0].id;
      resolvedOrgFull = match[0].full_name;
    }
  } else if (resolvedOrgId) {
    const org = await db`SELECT full_name FROM orgs WHERE id = ${resolvedOrgId} LIMIT 1`;
    resolvedOrgFull = org[0]?.full_name ?? null;
  }

  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  const id = `${base}-${Date.now().toString(36)}`;

  await db`
    INSERT INTO contacts (id, name, email, phone, org_id, org_full, is_inbox, hierarchy_order)
    VALUES (
      ${id}, ${name}, ${email ?? null}, ${phone ?? null},
      ${resolvedOrgId}, ${resolvedOrgFull},
      false, 99
    )
  `;

  return NextResponse.json({ ok: true, id, created: true });
}

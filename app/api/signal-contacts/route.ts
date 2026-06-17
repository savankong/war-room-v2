import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const revalidate = 300;

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get('org_id');
  if (!orgId) return NextResponse.json([], { status: 400 });

  const db = getDb();
  const rows = await db`
    SELECT
      id, name, initials, title, email, phone, color,
      photo_url, linkedin, hierarchy_order, tags
    FROM contacts
    WHERE org_id = ${orgId}
    ORDER BY hierarchy_order ASC NULLS LAST, name ASC
    LIMIT 50
  `;

  return NextResponse.json(rows);
}

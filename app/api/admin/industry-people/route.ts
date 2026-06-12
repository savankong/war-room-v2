import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const rows = await db`
    SELECT id, name, title, org_full, email, phone, linkedin,
           photo_url, tags, hierarchy_order, is_inbox, color
    FROM contacts
    WHERE tags @> ARRAY['INDUSTRY']
    ORDER BY org_full, hierarchy_order NULLS LAST, name
  `;
  return NextResponse.json(rows);
}

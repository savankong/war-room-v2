import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const rows = await db`
    SELECT c.id, c.name, c.title, c.org_full, c.email, c.phone, c.linkedin,
           c.photo_url, c.tags, c.hierarchy_order, c.is_inbox, c.color
    FROM contacts c
    LEFT JOIN orgs o ON o.id = c.org_id
    WHERE c.tags @> ARRAY['INDUSTRY']
       OR o.organization_type = 'sbir_company'
    ORDER BY c.org_full, c.hierarchy_order NULLS LAST, c.name
  `;
  return NextResponse.json(rows);
}

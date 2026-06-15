import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const revalidate = 3600;

export async function GET(req: NextRequest) {
  const company = req.nextUrl.searchParams.get('company');
  if (!company) return NextResponse.json([], { status: 400 });

  const db = getDb();
  const rows = await db`
    SELECT c.id, c.name, c.title, c.color, c.photo_url, c.email, c.phone, c.linkedin,
           c.org_full, c.tags, c.hierarchy_order
    FROM contacts c
    LEFT JOIN orgs o ON o.id = c.org_id
    WHERE (c.org_full = ${company} OR o.full_name = ${company})
      AND (c.tags @> ARRAY['INDUSTRY'] OR o.organization_type = 'sbir_company')
    ORDER BY c.hierarchy_order NULLS LAST, c.name
  `;
  return NextResponse.json(rows);
}

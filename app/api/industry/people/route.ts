import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const revalidate = 3600;

export async function GET(req: NextRequest) {
  const company = req.nextUrl.searchParams.get('company');
  if (!company) return NextResponse.json([], { status: 400 });

  const db = getDb();
  const rows = await db`
    SELECT id, name, title, color, photo_url, email, linkedin,
           org_full, tags, hierarchy_order
    FROM contacts
    WHERE org_full = ${company}
      AND tags @> ARRAY['INDUSTRY']
    ORDER BY hierarchy_order NULLS LAST, name
  `;
  return NextResponse.json(rows);
}

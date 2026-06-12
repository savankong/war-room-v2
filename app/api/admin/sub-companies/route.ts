import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const rows = await db`
    SELECT sc.*, COUNT(DISTINCT sa.prime_legal_name)::int AS prime_count
    FROM sub_companies sc
    LEFT JOIN sub_awards sa ON sa.sub_name = sc.legal_name
    GROUP BY sc.id
    ORDER BY sc.name
  `;
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const db = getDb();
  const b = await request.json();
  if (!b.name?.trim() || !b.legal_name?.trim()) {
    return NextResponse.json({ error: 'name and legal_name required' }, { status: 400 });
  }
  const id = b.legal_name.trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
  await db`
    INSERT INTO sub_companies (id, legal_name, name, logo_url, website, headquarters, description)
    VALUES (
      ${id},
      ${b.legal_name.trim().toUpperCase()},
      ${b.name.trim()},
      ${b.logo_url ?? null},
      ${b.website ?? null},
      ${b.headquarters ?? null},
      ${b.description ?? null}
    )
  `;
  return NextResponse.json({ id });
}

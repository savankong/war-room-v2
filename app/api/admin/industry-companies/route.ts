import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const rows = await db`
    SELECT ic.*,
           COUNT(DISTINCT c.id)::int AS exec_count
    FROM industry_companies ic
    LEFT JOIN contacts c
      ON c.org_full = ic.legal_name
     AND c.tags @> ARRAY['INDUSTRY']
    GROUP BY ic.id
    ORDER BY ic.name
  `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const b = await req.json();
  const id = (b.name ?? 'company').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
    + '-' + Date.now().toString(36);

  await db`
    INSERT INTO industry_companies
      (id, name, legal_name, website, description, logo_url, headquarters, founded, ticker, employees)
    VALUES (
      ${id}, ${b.name}, ${b.legal_name ?? null}, ${b.website ?? null},
      ${b.description ?? null}, ${b.logo_url ?? null}, ${b.headquarters ?? null},
      ${b.founded ?? null}, ${b.ticker ?? null}, ${b.employees ?? null}
    )
  `;
  return NextResponse.json({ ok: true, id });
}

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const keys = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [keys.join(','), ...rows.map(r => keys.map(k => escape(r[k])).join(','))].join('\n');
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') ?? 'orgs';
  const db = getDb();
  let rows: Record<string, unknown>[];
  let filename: string;

  if (type === 'orgs') {
    rows = await db`
      SELECT o.id, o.full_name, o.branch, o.organization_type, o.parent_id,
             o.hierarchy_level, o.loc, o.description, o.is_active,
             COUNT(DISTINCT c.id)::int AS contact_count,
             COUNT(DISTINCT ct.id)::int AS contract_count
      FROM orgs o
      LEFT JOIN contacts c ON c.org_id = o.id
      LEFT JOIN contracts ct ON ct.org_id = o.id
      GROUP BY o.id ORDER BY o.full_name
    `;
    filename = 'orgs.csv';
  } else if (type === 'contacts') {
    rows = await db`
      SELECT c.id, c.name, c.title, c.org_id, c.org_full, c.email, c.phone,
             c.linkedin, c.hierarchy_order, c.opps, c.awards, c.last_signal,
             c.tags
      FROM contacts c ORDER BY c.org_id, c.hierarchy_order, c.name
    `;
    filename = 'contacts.csv';
  } else if (type === 'contracts') {
    rows = await db`
      SELECT id, title, value, signal_type, set_aside, org_id, source,
             award_date, created_at
      FROM contracts ORDER BY award_date DESC NULLS LAST, created_at DESC
    `;
    filename = 'contracts.csv';
  } else {
    return NextResponse.json({ error: 'unknown type' }, { status: 400 });
  }

  const csv = toCSV(rows as Record<string, unknown>[]);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

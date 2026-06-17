import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const escape = (v: unknown): string => {
    if (v == null) return '';
    const s = Array.isArray(v) ? v.join(';') : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.join(',');
  const body = rows.map(r => columns.map(c => escape(r[c])).join(','));
  return [header, ...body].join('\n');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const type = searchParams.get('type') || 'contacts';
  const format = searchParams.get('format') || 'csv';

  if (token !== process.env.SAM_SYNC_TOKEN)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getDatabase } = require('@netlify/database');
  const db = getDatabase();

  if (type === 'contacts') {
    const rows = await db.sql`
      SELECT
        c.id, c.name, c.title, c.email, c.phone,
        c.org_id, c.org_full, c.tags, c.hierarchy_order,
        c.linkedin, c.is_inbox
      FROM contacts c
      ORDER BY c.hierarchy_order NULLS LAST, c.name
    `;
    if (format === 'json') return NextResponse.json(rows);
    const columns = ['id','name','title','email','phone','org_id','org_full','tags','hierarchy_order','linkedin','is_inbox'];
    return new NextResponse(toCsv(rows as Record<string, unknown>[], columns), {
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="warroom-contacts.csv"' },
    });

  } else if (type === 'orgs') {
    const rows = await db.sql`
      SELECT
        o.id, o.full_name, o.abbreviation, o.org_type_id,
        o.parent_id, o.hierarchy_level, o.branch, o.loc,
        o.website, o.description, o.is_active, o.is_alias,
        o.is_contracting_office, o.contract_vehicles
      FROM orgs o
      ORDER BY o.hierarchy_level NULLS LAST, o.full_name
    `;
    if (format === 'json') return NextResponse.json(rows);
    const columns = ['id','full_name','abbreviation','org_type_id','parent_id','hierarchy_level','branch','loc','website','description','is_active','is_alias','is_contracting_office','contract_vehicles'];
    return new NextResponse(toCsv(rows as Record<string, unknown>[], columns), {
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="warroom-orgs.csv"' },
    });

  } else if (type === 'contracts') {
    const rows = await db.sql`
      SELECT
        id::text, external_id, title, signal_type, value::text, status,
        award_date, source, naics_code, awardee,
        service_branch, agency_or_lab, description,
        canonical_org_id, raw_payload
      FROM contracts
      WHERE signal_type IS NOT NULL OR canonical_org_id IS NOT NULL
      ORDER BY award_date DESC NULLS LAST
      LIMIT 10000
    `;
    if (format === 'json') return NextResponse.json(rows);
    return NextResponse.json({ error: 'Use format=json for contracts' }, { status: 400 });

  } else if (type === 'org_types') {
    const rows = await db.sql`SELECT id, name, category, sort_order, description FROM org_types ORDER BY sort_order`;
    if (format === 'json') return NextResponse.json(rows);
    return NextResponse.json({ error: 'Use format=json for org_types' }, { status: 400 });

  } else {
    return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
  }
}

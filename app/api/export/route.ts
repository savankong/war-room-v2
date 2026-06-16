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

  if (token !== process.env.SAM_SYNC_TOKEN)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getDatabase } = require('@netlify/database');
  const db = getDatabase();

  let csv = '';
  let filename = '';

  if (type === 'contacts') {
    const rows = await db.sql`
      SELECT
        c.id,
        c.name,
        c.title,
        c.email,
        c.phone,
        c.org_id,
        o.full_name   AS org_name,
        c.org_full,
        c.tags,
        c.hierarchy_order,
        c.linkedin,
        c.is_inbox
      FROM contacts c
      LEFT JOIN orgs o ON o.id = c.org_id
      ORDER BY o.full_name NULLS LAST, c.hierarchy_order NULLS LAST, c.name
    `;
    const columns = ['id','name','title','email','phone','org_id','org_name','org_full','tags','hierarchy_order','linkedin','is_inbox'];
    csv = toCsv(rows as Record<string, unknown>[], columns);
    filename = 'warroom-contacts.csv';

  } else if (type === 'orgs') {
    const rows = await db.sql`
      SELECT
        o.id,
        o.full_name,
        o.abbreviation,
        o.org_type_id,
        o.parent_id,
        p.full_name   AS parent_name,
        o.hierarchy_level,
        o.hierarchy_path,
        o.branch,
        o.loc,
        o.website,
        o.description,
        o.is_active,
        o.is_alias,
        o.is_contracting_office,
        o.contract_vehicles,
        (SELECT COUNT(*) FROM contacts c WHERE c.org_id = o.id) AS contact_count
      FROM orgs o
      LEFT JOIN orgs p ON p.id = o.parent_id
      ORDER BY o.hierarchy_level NULLS LAST, o.full_name
    `;
    const columns = ['id','full_name','abbreviation','org_type_id','parent_id','parent_name','hierarchy_level','hierarchy_path','branch','loc','website','description','is_active','is_alias','is_contracting_office','contract_vehicles','contact_count'];
    csv = toCsv(rows as Record<string, unknown>[], columns);
    filename = 'warroom-orgs.csv';

  } else {
    return NextResponse.json({ error: `Unknown type: ${type}. Use contacts or orgs.` }, { status: 400 });
  }

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

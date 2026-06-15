import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('token') !== process.env.SAM_SYNC_TOKEN)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = getDb();
    const rows = await db`
      SELECT o.id, o.full_name AS name, o.org_type_id AS organization_type,
        o.loc AS hq_address, o.branch, o.hierarchy_level AS abs_hierarchy_level,
        o.hierarchy_level, o.parent_id,
        COUNT(DISTINCT c.id)::int AS contact_count,
        COUNT(DISTINCT ct.id)::int AS contract_count,
        (SELECT c2.name FROM contacts c2 WHERE c2.org_id = o.id AND c2.hierarchy_order = 1 ORDER BY c2.name LIMIT 1) AS top_leader_name,
        (SELECT c2.title FROM contacts c2 WHERE c2.org_id = o.id AND c2.hierarchy_order = 1 ORDER BY c2.name LIMIT 1) AS top_leader_title
      FROM orgs o
      LEFT JOIN contacts c ON c.org_id = o.id
      LEFT JOIN contracts ct ON ct.org_id::text = o.id
      WHERE o.is_active = true
      GROUP BY o.id
      ORDER BY o.hierarchy_level NULLS LAST, o.full_name
      LIMIT 3
    `;
    return NextResponse.json({ count: rows.length, sample: rows[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

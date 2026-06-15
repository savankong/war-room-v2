import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('token') !== process.env.SAM_SYNC_TOKEN)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = getDb();
    const cols = (t: string) => db`SELECT column_name FROM information_schema.columns WHERE table_name = ${t} ORDER BY ordinal_position`;
    const [cc, oc, ctc] = await Promise.all([cols('contacts'), cols('orgs'), cols('contracts')]);
    // Test fixed discover query (UUID cast)
    let discoverErr = null;
    try {
      await db`SELECT o.id FROM orgs o LEFT JOIN contacts c ON c.org_id = o.id::text LEFT JOIN contracts ct ON ct.org_id = o.id::text WHERE o.is_active = true GROUP BY o.id LIMIT 1`;
    } catch(e: any) { discoverErr = e.message; }
    // Test people join
    let peopleErr = null;
    try {
      await db`SELECT c.id, c.hierarchy_order, c.awards, o.hierarchy_level, o.org_type_id FROM contacts c LEFT JOIN orgs o ON o.id::text = c.org_id LIMIT 1`;
    } catch(e: any) { peopleErr = e.message; }
    // Test signals query
    let signalsErr = null;
    try {
      await db`SELECT c.id, c.signal_type, c.awardee, c.naics_code, c.status FROM contracts c WHERE c.signal_type IS NOT NULL LIMIT 1`;
    } catch(e: any) { signalsErr = e.message; }
    return NextResponse.json({
      contacts_cols: cc.map((r: any) => r.column_name),
      org_cols: oc.map((r: any) => r.column_name),
      contract_cols: ctc.map((r: any) => r.column_name),
      discover_err: discoverErr,
      people_err: peopleErr,
      signals_err: signalsErr,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('token') !== process.env.SAM_SYNC_TOKEN)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = getDb();
    const cols = (t: string) => db`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = ${t} ORDER BY ordinal_position`;
    const [cc, oc, ctc] = await Promise.all([cols('contacts'), cols('orgs'), cols('contracts')]);
    // Test exact discover query
    let discoverErr = null;
    try {
      await db`SELECT o.id, o.org_type_id, o.loc, o.branch, o.hierarchy_level, o.parent_id, COUNT(DISTINCT c.id)::int, COUNT(DISTINCT ct.id)::int FROM orgs o LEFT JOIN contacts c ON c.org_id = o.id LEFT JOIN contracts ct ON ct.org_id::text = o.id WHERE o.is_active = true GROUP BY o.id LIMIT 1`;
    } catch(e: any) { discoverErr = e.message; }
    // Test signals stats query
    let signalsErr = null;
    try {
      await db`SELECT COUNT(*)::int, COALESCE(SUM(CASE WHEN value ~ '^[0-9.]+$' THEN value::numeric ELSE 0 END), 0)::bigint FROM contracts WHERE signal_type IS NOT NULL`;
    } catch(e: any) { signalsErr = e.message; }
    // Test signals industry query
    let sigIndErr = null;
    try {
      await db`SELECT c.id, c.awardee, c.naics_code, c.status, c.source, c.org_id, o.full_name FROM contracts c LEFT JOIN orgs o ON o.id = c.org_id::text WHERE c.signal_type = 'Award' AND c.awardee IS NOT NULL LIMIT 1`;
    } catch(e: any) { sigIndErr = e.message; }
    let peopleErr = null;
    return NextResponse.json({
      contacts_cols: cc.map((r: any) => `${r.column_name}:${r.data_type}`),
      org_cols: oc.map((r: any) => `${r.column_name}:${r.data_type}`),
      contract_cols: ctc.map((r: any) => `${r.column_name}:${r.data_type}`),
      discover_err: discoverErr,
      people_err: peopleErr,
      signals_err: signalsErr,
      sig_ind_err: sigIndErr,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

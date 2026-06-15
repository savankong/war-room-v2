import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('token') !== process.env.SAM_SYNC_TOKEN)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = getDb();
    const cols = await db`SELECT column_name FROM information_schema.columns WHERE table_name = 'contracts' ORDER BY ordinal_position`;
    // Also try the discover query in isolation
    const orgs = await db`SELECT COUNT(*) FROM orgs`;
    const contacts = await db`SELECT COUNT(*) FROM contacts`;
    return NextResponse.json({ 
      contract_columns: cols.map((r: any) => r.column_name),
      org_count: orgs[0].count,
      contact_count: contacts[0].count
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

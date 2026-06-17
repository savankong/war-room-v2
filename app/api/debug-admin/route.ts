import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getDatabase } from '@netlify/database';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('token') !== process.env.SAM_SYNC_TOKEN)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  const results: Record<string, any> = {};

  try {
    await db`SELECT o.id, o.full_name AS name, o.abbreviation, o.branch, o.org_type_id AS type, o.org_type_id AS organization_type, o.description, o.website, o.parent_id, o.is_active, o.loc, o.hierarchy_level AS abs_hierarchy_level, COUNT(DISTINCT c.id)::int AS contacts, COUNT(DISTINCT ct.id)::int AS contracts FROM orgs o LEFT JOIN contacts c ON c.org_id = o.id LEFT JOIN contracts ct ON ct.org_id::text = o.id GROUP BY o.id ORDER BY o.full_name LIMIT 1`;
    results.orgs = 'ok';
  } catch(e: any) { results.orgs = e.message; }

  try {
    await db`SELECT c.id, c.name, c.title, c.org_id, c.org_full, c.email, c.phone, c.linkedin, c.hierarchy_order, c.is_inbox, c.tags, c.opps, c.last_signal, o.org_type_id AS org_type FROM contacts c LEFT JOIN orgs o ON o.id = c.org_id ORDER BY c.name LIMIT 1`;
    results.contacts = 'ok';
  } catch(e: any) { results.contacts = e.message; }

  try {
    await db`SELECT id, title, signal_type, value, NULL::numeric AS award_amt, COALESCE(award_date, created_at::date) AS award_date, status AS set_aside, org_id::text AS org_id, source, awardee AS recipient, NULL::text AS poc, NULL::text AS poc_email, naics_code AS naics, NULL::text AS description, NULL::text AS deadline FROM contracts LIMIT 1`;
    results.contracts = 'ok';
  } catch(e: any) { results.contracts = e.message; }

  try {
    await db`SELECT (SELECT COUNT(*) FROM orgs)::int AS org_count, (SELECT COUNT(*) FROM contacts)::int AS contact_count, (SELECT COUNT(*) FROM contracts)::int AS contract_count, (SELECT COUNT(*) FROM orgs WHERE is_active = true)::int AS active_orgs`;
    results.stats = 'ok';
  } catch(e: any) { results.stats = e.message; }

  // check contacts columns
  try {
    const cols = await db`SELECT column_name FROM information_schema.columns WHERE table_name = 'contacts' ORDER BY ordinal_position`;
    results.contact_cols = cols.map((r: any) => r.column_name);
  } catch(e: any) { results.contact_cols_err = e.message; }

  // test minimal write to contracts via @netlify/database
  try {
    const wdb = (getDatabase() as any).sql;
    const testId = crypto.randomUUID();
    await wdb`INSERT INTO contracts (id, title, raw_payload) VALUES (${testId}::uuid, 'DEBUG_TEST', '{}')`;
    await wdb`DELETE FROM contracts WHERE title = 'DEBUG_TEST'`;
    results.contracts_write = 'ok';
  } catch(e: any) {
    results.contracts_write_err = e?.message?.slice(0, 200);
  }

  // test inserting with source='carahsoft'
  try {
    const wdb = (getDatabase() as any).sql;
    const testId2 = crypto.randomUUID();
    await wdb`INSERT INTO contracts (id, title, source, raw_payload) VALUES (${testId2}::uuid, 'DEBUG_SOURCE', 'carahsoft', '{}')`;
    await wdb`DELETE FROM contracts WHERE title = 'DEBUG_SOURCE'`;
    results.source_carahsoft_write = 'ok';
  } catch(e: any) {
    results.source_carahsoft_err = e?.message?.slice(0, 400);
  }

  return NextResponse.json(results);
}

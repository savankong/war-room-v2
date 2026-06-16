import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') ?? 'socom_atl';
  const db = getDb();
  const results: Record<string, unknown> = {};

  const run = async (key: string, fn: () => Promise<unknown>) => {
    try { results[key] = { ok: true, data: await fn() }; }
    catch (e: unknown) { results[key] = { ok: false, error: e instanceof Error ? e.message : String(e) }; }
  };

  await run('contracts_columns', () => db`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'contracts'
    ORDER BY ordinal_position
  `);

  await run('profile', () => db`
    SELECT o.id, COALESCE(o.full_name, o.sub, o.id) AS name,
           o.organization_type, o.abs_hierarchy_level,
           o.branch, o.parent_id, o.loc, o.description
    FROM orgs o WHERE o.id = ${slug}
  `);

  await run('contacts', () => db`
    SELECT id, name, title, color AS avatar_color, photo_url,
           email, phone, linkedin, org_id, org_full,
           tags, opps, awards, last_signal, hierarchy_order
    FROM contacts WHERE org_id = ${slug} LIMIT 5
  `);

  await run('contracts', () => db`
    SELECT id, title, value,
           set_aside AS status, signal_type, award_date,
           COALESCE(source, 'sam') AS source
    FROM contracts WHERE org_id::text = ${slug} AND signal_type IS NOT NULL
    ORDER BY award_date DESC NULLS LAST, created_at DESC LIMIT 5
  `);

  await run('nav_orgs_count', () => db`
    SELECT COUNT(*)::int AS org_count FROM orgs WHERE is_active = true
  `);

  await run('nav_orgs_query', () => db`
    SELECT o.id, COALESCE(o.full_name, o.sub, o.id) AS name, o.parent_id,
      COALESCE(o.hierarchy_level, 2)::int AS hierarchy_level,
      o.hierarchy_level AS abs_hierarchy_level,
      o.branch,
      COUNT(DISTINCT ct.id)::int AS contract_count
    FROM orgs o
    LEFT JOIN contracts ct ON ct.org_id::text = o.id
    WHERE o.is_active = true
    GROUP BY o.id
    ORDER BY o.branch, o.hierarchy_level NULLS LAST, o.full_name
    LIMIT 5
  `);

  await run('nav_sample', () => db`
    SELECT o.id, COALESCE(o.full_name, o.sub, o.id) AS name,
           o.parent_id, o.hierarchy_level, o.abs_hierarchy_level, o.branch
    FROM orgs o WHERE o.is_active = true LIMIT 5
  `);

  await run('child_orgs', () => db`
    SELECT o.id, COALESCE(o.full_name, o.sub, o.id) AS name,
           o.branch, o.organization_type
    FROM orgs o WHERE o.parent_id = ${slug} AND o.is_active = true LIMIT 5
  `);

  return NextResponse.json({ slug, results });
}

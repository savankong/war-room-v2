import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function getErr(e: any): string {
  let c = e; let last = '';
  for (let i = 0; i < 6 && c; i++) { last = c?.message || String(c); c = c?.cause; }
  return last.slice(0, 500);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.token !== process.env.SAM_SYNC_TOKEN)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { type, records } = body;
  if (!records?.length && !type?.startsWith('delete_')) return NextResponse.json({ inserted: 0 });

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getDatabase } = require('@netlify/database');
  const db = getDatabase();

  let inserted = 0;
  const errors: string[] = [];


  const VALID_ORG_TYPES = new Set(['asd_office','osd_office','joint_staff','department','military_department','usd_office','service_hq','major_command','field_command','component_command','unified_command','sub_unified_command','fleet_command','special_ops_command','defense_agency','defense_field_activity','intelligence_office','systems_command','portfolio_acq_exec','capability_prog_exec']);

  if (type === 'orgs') {
    for (const o of records) {
      try {
        const id = o.id;
        const full_name = o.canonical_name || o.full_name || o.id;
        const abbreviation = o.short_name || o.abbreviation || null;
        const raw_type = o.organization_type || o.org_type_id || null;
        const org_type_id = raw_type && VALID_ORG_TYPES.has(raw_type) ? raw_type : null;
        const parent_id = o.parent_org_id || o.parent_id || null;
        const hierarchy_level = o.hierarchy_level != null ? Number(o.hierarchy_level) : null;
        const loc = o.location || o.loc || null;
        const website = o.website || null;
        const branch = o.branch || null;
        await db.sql`
          INSERT INTO orgs (id, full_name, abbreviation, org_type_id, parent_id, hierarchy_level, loc, website, is_active, branch, contract_vehicles)
          VALUES (${id}, ${full_name}, ${abbreviation}, ${org_type_id}, ${parent_id}, ${hierarchy_level}, ${loc}, ${website}, true, ${branch}, ARRAY[]::text[])
          ON CONFLICT (id) DO UPDATE SET
            full_name       = COALESCE(EXCLUDED.full_name, orgs.full_name),
            abbreviation    = COALESCE(EXCLUDED.abbreviation, orgs.abbreviation),
            org_type_id     = COALESCE(EXCLUDED.org_type_id, orgs.org_type_id),
            parent_id       = COALESCE(EXCLUDED.parent_id, orgs.parent_id),
            hierarchy_level = COALESCE(EXCLUDED.hierarchy_level, orgs.hierarchy_level),
            loc             = COALESCE(EXCLUDED.loc, orgs.loc),
            website         = COALESCE(EXCLUDED.website, orgs.website)
        `;
        inserted++;
      } catch (e: any) { errors.push(`org ${o.id}: ${getErr(e)}`); }
    }
  } else if (type === 'contacts') {
    for (const c of records) {
      try {
        const id = c.id;
        const name = c.name || null;
        const title = c.title || null;
        const org_id = c.org_id || null;
        const org_full = c.org_full || null;
        const email = c.email || null;
        const phone = c.phone || null;
        const linkedin = c.linkedin || null;
        const hierarchy_order = c.hierarchy_order ? Number(c.hierarchy_order) : null;
        const opps = c.opps ? Number(c.opps) : 0;
        const last_signal = c.last_signal || null;
        // tags can arrive as array, comma-string, or null
        const rawTags = c.tags;
        const tags: string[] | null = Array.isArray(rawTags)
          ? rawTags
          : typeof rawTags === 'string' && rawTags.trim()
            ? rawTags.split(',').map((t: string) => t.trim()).filter(Boolean)
            : null;
        await db.sql`
          INSERT INTO contacts (id, name, title, org_id, org_full, email, phone, linkedin, hierarchy_order, opps, last_signal, tags)
          VALUES (${id}, ${name}, ${title}, ${org_id}, ${org_full}, ${email}, ${phone}, ${linkedin}, ${hierarchy_order}, ${opps}, ${last_signal}, ${tags})
          ON CONFLICT (id) DO UPDATE SET
            name            = COALESCE(EXCLUDED.name, contacts.name),
            title           = COALESCE(EXCLUDED.title, contacts.title),
            org_id          = COALESCE(EXCLUDED.org_id, contacts.org_id),
            org_full        = COALESCE(EXCLUDED.org_full, contacts.org_full),
            email           = COALESCE(EXCLUDED.email, contacts.email),
            hierarchy_order = COALESCE(EXCLUDED.hierarchy_order, contacts.hierarchy_order)
        `;
        inserted++;
      } catch (e: any) { errors.push(`contact ${c.id}: ${getErr(e)}`); }
    }
  } else if (type === 'contracts') {
    for (const c of records) {
      try {
        const ext_id = c.id || null;
        const title = (c.title || '').slice(0, 500) || null;
        const rawSigType = c.type === 'award' ? 'Award' : c.type === 'opp' ? 'Opportunity' : c.signal_type || '';
        const VALID_SIG = new Set(['Opportunity', 'Award', 'Budget']);
        const signal_type = VALID_SIG.has(rawSigType) ? rawSigType : null;
        const raw = c.value || c.award_amt || null;
        const value = raw && raw !== 'TBD' ? (parseFloat(String(raw).replace(/[^0-9.]/g, '')) || null) : null;
        const rawStatus = c.set_aside || c.status || '';
        const VALID_STATUS: Record<string, string> = {'competed':'Competed','sole source':'Sole Source','sole-source':'Sole Source','opportunity':'Opportunity'};
        const status = VALID_STATUS[rawStatus.toLowerCase()] ?? null;
        const award_date = c.posted_date || c.award_date || null;
        const rawSrc = (c.sam_url || c.source || '').toLowerCase();
        const source = rawSrc.includes('usaspending') ? 'usaspending' : rawSrc.includes('sam') ? 'sam_gov' : 'manual';
        const naics_code = (c.naics || c.naics_code || '').slice(0, 10) || null;
        const awardee = (c.recipient || c.awardee || '').slice(0, 500) || null;
        const service_branch = c.agency || c.service_branch || null;
        const agency_or_lab = c.sub_agency || c.agency_or_lab || null;
        const description = c.description ? c.description.slice(0, 2000) : null;
        const exists = await db.sql`SELECT 1 FROM contracts WHERE external_id = ${ext_id} LIMIT 1`;
        if (exists.length === 0) {
          await db.sql`
            INSERT INTO contracts (id, org_id, external_id, title, signal_type, value, status, award_date, source, naics_code, awardee, service_branch, agency_or_lab, description, raw_payload)
            VALUES (gen_random_uuid(), NULL::uuid, ${ext_id}, ${title}, ${signal_type}, ${value}, ${status}, ${award_date}, ${source}, ${naics_code}, ${awardee}, ${service_branch}, ${agency_or_lab}, ${description}, '{}'::jsonb)
          `;
        }
        inserted++;
      } catch (e: any) { errors.push(`contract ${c.id}: ${getErr(e)}`); }
    }
  } else if (type === 'delete_contacts_by_id_prefix') {
    const prefix = body.prefix;
    if (!prefix) return NextResponse.json({ error: 'prefix required' }, { status: 400 });
    const before = await db.sql`SELECT COUNT(*)::int AS n FROM contacts WHERE id LIKE ${prefix + '%'}`;
    const byTag = await db.sql`SELECT COUNT(*)::int AS n FROM contacts WHERE tags @> ARRAY['SUBAWARD']`;
    const sample = await db.sql`SELECT id, name, tags FROM contacts WHERE tags @> ARRAY['INDUSTRY'] LIMIT 5`;
    const totalInd = await db.sql`SELECT COUNT(*)::int AS n FROM contacts WHERE tags @> ARRAY['INDUSTRY']`;
    await db.sql`DELETE FROM contacts WHERE id LIKE ${prefix + '%'}`;
    const after = await db.sql`SELECT COUNT(*)::int AS n FROM contacts WHERE id LIKE ${prefix + '%'}`;
    return NextResponse.json({ prefix_before: before[0]?.n, prefix_after: after[0]?.n, subaward_tag_count: byTag[0]?.n, total_industry: totalInd[0]?.n, sample });
  } else {
    return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
  }

  return NextResponse.json({ inserted, total: records.length, errors: errors.slice(0, 20) });
}

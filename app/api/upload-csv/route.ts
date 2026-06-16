import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h.trim()] = values[idx]?.trim() ?? ''; });
    rows.push(row);
  }
  return rows;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function getErr(e: unknown): string {
  let c: unknown = e; let last = '';
  for (let i = 0; i < 6 && c; i++) {
    last = (c as { message?: string })?.message || String(c);
    c = (c as { cause?: unknown })?.cause;
  }
  return last.slice(0, 500);
}

const VALID_ORG_TYPES = new Set(['asd_office','osd_office','joint_staff','department','military_department','usd_office','service_hq','major_command','field_command','component_command','unified_command','sub_unified_command','fleet_command','special_ops_command','defense_agency','defense_field_activity','intelligence_office','systems_command','portfolio_acq_exec','capability_prog_exec']);

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-warroom-token') || new URL(req.url).searchParams.get('token');
  if (token !== process.env.SAM_SYNC_TOKEN)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const contentType = req.headers.get('content-type') || '';
  let csvText = '';
  let type = '';

  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    type = (form.get('type') as string) || '';
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file uploaded. Send field name "file".' }, { status: 400 });
    csvText = await file.text();
  } else {
    // raw CSV body with type in query param
    type = new URL(req.url).searchParams.get('type') || '';
    csvText = await req.text();
  }

  if (!type) return NextResponse.json({ error: 'type param required: contacts or orgs' }, { status: 400 });

  const rows = parseCsv(csvText);
  if (!rows.length) return NextResponse.json({ error: 'CSV is empty or has no data rows' }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getDatabase } = require('@netlify/database');
  const db = getDatabase();

  let inserted = 0;
  const errors: string[] = [];
  const skipped: string[] = [];

  if (type === 'contacts') {
    for (const row of rows) {
      const id = row['id']?.trim();
      if (!id) { skipped.push('row missing id'); continue; }

      const name  = row['name']  || null;
      const title = row['title'] || null;
      const email = row['email'] || null;
      const phone = row['phone'] || null;
      const org_id = row['org_id'] || null;
      const org_full = row['org_full'] || null;
      const linkedin = row['linkedin'] || null;
      const hierarchy_order = row['hierarchy_order'] ? Number(row['hierarchy_order']) : null;
      const is_inbox = row['is_inbox'] === 'true' ? true : row['is_inbox'] === 'false' ? false : null;
      const rawTags = row['tags'];
      const tags: string[] | null = rawTags
        ? rawTags.split(';').map(t => t.trim()).filter(Boolean)
        : null;

      try {
        await db.sql`
          INSERT INTO contacts (id, name, title, email, phone, org_id, org_full, linkedin, hierarchy_order, is_inbox, tags)
          VALUES (${id}, ${name}, ${title}, ${email}, ${phone}, ${org_id}, ${org_full}, ${linkedin}, ${hierarchy_order}, ${is_inbox}, ${tags})
          ON CONFLICT (id) DO UPDATE SET
            name            = COALESCE(EXCLUDED.name,            contacts.name),
            title           = COALESCE(EXCLUDED.title,           contacts.title),
            email           = COALESCE(EXCLUDED.email,           contacts.email),
            phone           = COALESCE(EXCLUDED.phone,           contacts.phone),
            org_id          = COALESCE(EXCLUDED.org_id,          contacts.org_id),
            org_full        = COALESCE(EXCLUDED.org_full,        contacts.org_full),
            linkedin        = COALESCE(EXCLUDED.linkedin,        contacts.linkedin),
            hierarchy_order = COALESCE(EXCLUDED.hierarchy_order, contacts.hierarchy_order),
            is_inbox        = COALESCE(EXCLUDED.is_inbox,        contacts.is_inbox),
            tags            = COALESCE(EXCLUDED.tags,            contacts.tags)
        `;
        inserted++;
      } catch (e) { errors.push(`contact ${id}: ${getErr(e)}`); }
    }

  } else if (type === 'orgs') {
    for (const row of rows) {
      const id = row['id']?.trim();
      if (!id) { skipped.push('row missing id'); continue; }

      const full_name   = row['full_name']   || null;
      const abbreviation = row['abbreviation'] || null;
      const raw_type    = row['org_type_id'] || null;
      const org_type_id = raw_type && VALID_ORG_TYPES.has(raw_type) ? raw_type : null;
      const parent_id   = row['parent_id']   || null;
      const hierarchy_level = row['hierarchy_level'] ? Number(row['hierarchy_level']) : null;
      const branch      = row['branch']      || null;
      const loc         = row['loc']         || null;
      const website     = row['website']     || null;
      const description = row['description'] || null;
      const is_active   = row['is_active'] === 'false' ? false : true;
      const is_contracting_office = row['is_contracting_office'] === 'true';
      const rawVehicles = row['contract_vehicles'];
      const contract_vehicles: string[] = rawVehicles
        ? rawVehicles.split(';').map(v => v.trim()).filter(Boolean)
        : [];

      try {
        await db.sql`
          INSERT INTO orgs (id, full_name, abbreviation, org_type_id, parent_id, hierarchy_level, branch, loc, website, description, is_active, is_contracting_office, contract_vehicles)
          VALUES (${id}, ${full_name}, ${abbreviation}, ${org_type_id}, ${parent_id}, ${hierarchy_level}, ${branch}, ${loc}, ${website}, ${description}, ${is_active}, ${is_contracting_office}, ${contract_vehicles})
          ON CONFLICT (id) DO UPDATE SET
            full_name              = COALESCE(EXCLUDED.full_name,              orgs.full_name),
            abbreviation           = COALESCE(EXCLUDED.abbreviation,           orgs.abbreviation),
            org_type_id            = COALESCE(EXCLUDED.org_type_id,            orgs.org_type_id),
            parent_id              = COALESCE(EXCLUDED.parent_id,              orgs.parent_id),
            hierarchy_level        = COALESCE(EXCLUDED.hierarchy_level,        orgs.hierarchy_level),
            branch                 = COALESCE(EXCLUDED.branch,                 orgs.branch),
            loc                    = COALESCE(EXCLUDED.loc,                    orgs.loc),
            website                = COALESCE(EXCLUDED.website,                orgs.website),
            description            = COALESCE(EXCLUDED.description,            orgs.description),
            is_active              = EXCLUDED.is_active,
            is_contracting_office  = EXCLUDED.is_contracting_office,
            contract_vehicles      = COALESCE(EXCLUDED.contract_vehicles,      orgs.contract_vehicles)
        `;
        inserted++;
      } catch (e) { errors.push(`org ${id}: ${getErr(e)}`); }
    }

  } else {
    return NextResponse.json({ error: `Unknown type: ${type}. Use contacts or orgs.` }, { status: 400 });
  }

  return NextResponse.json({
    type, total: rows.length, inserted, skipped: skipped.length, errors: errors.slice(0, 20)
  });
}

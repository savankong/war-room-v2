/**
 * POST /api/seed-industry
 *
 * Full pipeline to populate industry orgs, contacts, and link contracts.
 *
 * Steps (controlled by ?steps= query param, comma-separated):
 *   org_types  — insert industry org_type rows if missing
 *   orgs       — create org records from unique contract awardees
 *   link       — update contracts.canonical_org_id → orgs
 *   sbir       — pull SBIR API for poc_name/poc_email → create contacts
 *   sam        — pull SAM.gov entity pointsOfContact (needs quota available)
 *
 * All steps run by default. Auth via X-WarRoom-Token header.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic  = 'force-dynamic';
export const maxDuration = 300;

const SBIR_BASE = 'https://api.www.sbir.gov/public/api/awards';

// ── helpers ────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[,.]?\s*(inc\.?|llc\.?|corp\.?|co\.?|ltd\.?|incorporated|corporation|company|limited|associates|group|technologies?|solutions?|systems?)\s*$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function titleCase(s: string): string {
  return s.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits[0] === '1') return `(${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
  return raw.trim();
}

// ── main handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-warroom-token') || new URL(req.url).searchParams.get('token');
  if (token !== process.env.SAM_SYNC_TOKEN)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const stepsParam = new URL(req.url).searchParams.get('steps') || 'org_types,orgs,link,sbir';
  const steps = new Set(stepsParam.split(',').map(s => s.trim()));
  const minAwards = parseInt(new URL(req.url).searchParams.get('minAwards') || '2', 10);
  const limit     = parseInt(new URL(req.url).searchParams.get('limit') || '2000', 10);

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getDatabase } = require('@netlify/database');
  const db = getDatabase();

  const stats: Record<string, unknown> = { steps: stepsParam };
  const errors: string[] = [];

  // ── STEP 1: industry org_types ──────────────────────────────────────────
  if (steps.has('org_types')) {
    const industryTypes = [
      { id: 'prime_contractor',   name: 'Prime Contractor',     category: 'industry', sort_order: 1, description: 'Large prime defense contractors (Lockheed, RTX, BAE, etc.)' },
      { id: 'subcontractor',      name: 'Subcontractor',        category: 'industry', sort_order: 2, description: 'Companies primarily working as subs on defense programs' },
      { id: 'sbir_company',       name: 'SBIR Company',         category: 'industry', sort_order: 3, description: 'Small businesses winning SBIR/STTR awards' },
      { id: 'defense_tech',       name: 'Defense Tech',         category: 'industry', sort_order: 2, description: 'VC-backed or dual-use tech companies focused on defense' },
      { id: 'research_institute', name: 'Research Institute',   category: 'industry', sort_order: 4, description: 'FFRDCs, UARCs, and independent research orgs' },
    ];
    let inserted = 0;
    for (const t of industryTypes) {
      try {
        await db.sql`
          INSERT INTO org_types (id, name, category, sort_order, description)
          VALUES (${t.id}, ${t.name}, ${t.category}, ${t.sort_order}, ${t.description})
          ON CONFLICT (id) DO NOTHING
        `;
        inserted++;
      } catch (e: unknown) { errors.push(`org_type ${t.id}: ${String(e)}`); }
    }
    stats.org_types = { inserted };
  }

  // ── STEP 2: create org records from contract awardees ───────────────────
  const orgsBySlug: Map<string, string> = new Map(); // slug → full_name

  if (steps.has('orgs')) {
    const rows = await db.sql`
      SELECT
        awardee,
        COUNT(*)::int          AS award_count,
        SUM(value)             AS total_value,
        array_agg(DISTINCT service_branch) FILTER (WHERE service_branch IS NOT NULL) AS branches,
        array_agg(DISTINCT agency_or_lab)  FILTER (WHERE agency_or_lab  IS NOT NULL) AS agencies
      FROM contracts
      WHERE awardee IS NOT NULL AND awardee <> ''
      GROUP BY awardee
      HAVING COUNT(*) >= ${minAwards}
      ORDER BY SUM(value) DESC NULLS LAST
      LIMIT ${limit}
    `;

    let created = 0, skipped = 0;
    for (const row of rows as Array<{ awardee: string; award_count: number; total_value: string | null; branches: string[] | null; agencies: string[] | null }>) {
      const name  = row.awardee.trim();
      const slug  = slugify(name);
      if (!slug) { skipped++; continue; }

      orgsBySlug.set(slug, name);

      // Determine best org_type_id based on award count and known patterns
      let org_type_id = 'sbir_company';
      const nameLower = name.toLowerCase();
      if (/\b(lockheed|raytheon|boeing|northrop|general dynamics|l3harris|bae|leidos|saic|booz|accenture|deloitte|kbr|peraton|caci|mps|bah|booze allen|amentum|vectrus)\b/i.test(name)) {
        org_type_id = 'prime_contractor';
      } else if (/university|institute|laboratory|labs?\b|college|foundation|research center/i.test(nameLower)) {
        org_type_id = 'research_institute';
      } else if (row.award_count >= 50) {
        org_type_id = 'subcontractor';
      }

      const description = `DoD contract awardee. ${row.award_count} contract${row.award_count !== 1 ? 's' : ''}` +
        (row.total_value ? `, ~$${(Number(row.total_value) / 1_000_000).toFixed(1)}M total` : '') + '.';

      try {
        await db.sql`
          INSERT INTO orgs (id, full_name, org_type_id, branch, description, is_active, contract_vehicles)
          VALUES (
            ${slug}, ${name}, ${org_type_id}, ${'Industry'},
            ${description}, ${true}, ${[]}
          )
          ON CONFLICT (id) DO UPDATE SET
            full_name    = COALESCE(EXCLUDED.full_name, orgs.full_name),
            org_type_id  = COALESCE(EXCLUDED.org_type_id, orgs.org_type_id),
            description  = COALESCE(EXCLUDED.description, orgs.description)
        `;
        created++;
      } catch (e: unknown) { errors.push(`org ${slug}: ${String(e)}`); }
    }
    stats.orgs = { created, skipped, total: rows.length };
  } else {
    // Still need the slug map for later steps even if we skip org creation
    const rows = await db.sql`SELECT id, full_name FROM orgs WHERE branch = 'Industry'`;
    for (const r of rows as Array<{ id: string; full_name: string }>) orgsBySlug.set(r.id, r.full_name);
  }

  // ── STEP 3: link contracts → orgs (canonical_org_id) ───────────────────
  if (steps.has('link') && orgsBySlug.size > 0) {
    let linked = 0;
    // Build a reverse map: normalized_full_name → slug
    const nameToSlug: Map<string, string> = new Map();
    for (const [slug, name] of orgsBySlug) nameToSlug.set(name.trim().toLowerCase(), slug);

    // Pull contracts that don't have canonical_org_id set yet and have an awardee
    const contracts = await db.sql`
      SELECT id, awardee FROM contracts
      WHERE awardee IS NOT NULL AND awardee <> '' AND canonical_org_id IS NULL
      LIMIT 100000
    `;

    const updates: Array<{ id: string; slug: string }> = [];
    for (const c of contracts as Array<{ id: string; awardee: string }>) {
      const slug = nameToSlug.get(c.awardee.trim().toLowerCase());
      if (slug) updates.push({ id: c.id, slug });
    }

    // Batch update in chunks of 500
    for (let i = 0; i < updates.length; i += 500) {
      const batch = updates.slice(i, i + 500);
      try {
        for (const u of batch) {
          await db.sql`UPDATE contracts SET canonical_org_id = ${u.slug} WHERE id = ${u.id}`;
        }
        linked += batch.length;
      } catch (e: unknown) { errors.push(`link batch ${i}: ${String(e)}`); }
    }
    stats.link = { linked, total: updates.length };
  }

  // ── STEP 4: SBIR POC contacts ───────────────────────────────────────────
  if (steps.has('sbir')) {
    const BATCH = 100;
    let start = 0, contactsCreated = 0, orgsMatched = 0, sbirErrors = 0;
    const emailsSeen = new Set<string>();

    // Existing contacts' emails to avoid dupes
    const existing = await db.sql`SELECT email FROM contacts WHERE email IS NOT NULL AND email NOT ILIKE '%.mil' AND email NOT ILIKE '%.gov'`;
    for (const r of existing as Array<{ email: string }>) emailsSeen.add(r.email.toLowerCase());

    while (true) {
      let awards: Array<Record<string, unknown>>;
      try {
        const url = `${SBIR_BASE}?agency=DOD&rows=${BATCH}&start=${start}`;
        const res = await fetch(url, {
          headers: { 'Accept': 'application/json', 'User-Agent': 'WarRoomUSA/1.0' },
        });
        if (!res.ok) {
          errors.push(`SBIR API HTTP ${res.status} at start=${start}`);
          break;
        }
        const json = await res.json();
        if (!Array.isArray(json) || json.length === 0) break;
        awards = json;
      } catch (e: unknown) {
        errors.push(`SBIR fetch error at start=${start}: ${String(e)}`);
        break;
      }

      for (const a of awards) {
        const pocEmail = (a.poc_email as string || '').trim().toLowerCase();
        const pocName  = (a.poc_name  as string || '').trim();
        const pocPhone = (a.poc_phone as string || '').trim();
        const firm     = (a.firm      as string || '').trim();

        if (!pocEmail || !pocEmail.includes('@')) continue;
        // Skip .mil and .gov emails — those are gov contacts
        if (pocEmail.endsWith('.mil') || pocEmail.endsWith('.gov')) continue;
        if (emailsSeen.has(pocEmail)) continue;
        emailsSeen.add(pocEmail);

        // Find matching org
        const firmSlug = slugify(firm);
        let orgId: string | null = orgsBySlug.has(firmSlug) ? firmSlug : null;

        // Fuzzy fallback: check if firm slug is close to any org
        if (!orgId && firm) {
          try {
            const rows = await db.sql`SELECT id FROM orgs WHERE full_name ILIKE ${firm} AND branch = 'Industry' LIMIT 1`;
            if ((rows as unknown[]).length > 0) orgId = (rows as Array<{ id: string }>)[0].id;
          } catch { /* ignore */ }
        }

        if (orgId) orgsMatched++;

        const cleanName = pocName ? titleCase(pocName) : null;
        const domain = pocEmail.split('@')[1];
        const contactId = `sbir-${pocEmail.replace(/[^a-z0-9]/g, '-').slice(0, 60)}`;

        try {
          await db.sql`
            INSERT INTO contacts (id, name, email, phone, org_id, tags)
            VALUES (
              ${contactId}, ${cleanName}, ${pocEmail},
              ${pocPhone ? formatPhone(pocPhone) : null},
              ${orgId}, ${'{"INDUSTRY","SBIR"}'}
            )
            ON CONFLICT (id) DO UPDATE SET
              name  = COALESCE(EXCLUDED.name,  contacts.name),
              email = COALESCE(EXCLUDED.email, contacts.email),
              phone = COALESCE(EXCLUDED.phone, contacts.phone),
              org_id = COALESCE(EXCLUDED.org_id, contacts.org_id)
          `;
          contactsCreated++;
        } catch (e: unknown) { sbirErrors++; errors.push(`sbir contact ${contactId}: ${String(e)}`); }
      }

      if (awards.length < BATCH) break;
      start += BATCH;
      if (start > 50000) break; // safety cap
    }

    stats.sbir = { contactsCreated, orgsMatched, errors: sbirErrors, pages: Math.ceil(start / BATCH) };
  }

  // ── STEP 5: SAM.gov entity POC enrichment ──────────────────────────────
  if (steps.has('sam')) {
    const SAM_KEY = process.env.SAM_GOV_API_KEY;
    if (!SAM_KEY) {
      stats.sam = { skipped: true, reason: 'SAM_GOV_API_KEY not set' };
    } else {
      let enriched = 0, samErrors = 0;

      // Get industry orgs that don't have a website or loc yet
      const orgsToEnrich = await db.sql`
        SELECT id, full_name FROM orgs
        WHERE branch = 'Industry' AND (website IS NULL OR loc IS NULL)
        LIMIT 200
      `;

      for (const org of orgsToEnrich as Array<{ id: string; full_name: string }>) {
        try {
          const encoded = encodeURIComponent(org.full_name);
          const res = await fetch(
            `https://api.sam.gov/entity-information/v3/entities?api_key=${SAM_KEY}&legalBusinessName=${encoded}&includeSections=entityRegistration,coreData,pointsOfContact&registrationStatus=A`,
            { headers: { Accept: 'application/json' } }
          );
          if (!res.ok) { samErrors++; continue; }
          const data = await res.json();
          const entities = data.entityData as Array<Record<string, unknown>> | null;
          if (!entities || entities.length === 0) continue;

          const entity = entities[0];
          const reg    = entity.entityRegistration as Record<string, unknown> | null;
          const core   = entity.coreData as Record<string, unknown> | null;
          const poc    = entity.pointsOfContact as Record<string, unknown[]> | null;

          const uei     = reg?.ueiSAM as string | null;
          const addrObj = (core?.physicalAddress ?? core?.mailingAddress) as Record<string, string> | null;
          const loc     = addrObj ? [addrObj.city, addrObj.stateOrProvinceCode].filter(Boolean).join(', ') : null;
          const website = reg?.entityURL as string | null;

          if (uei || loc || website) {
            await db.sql`
              UPDATE orgs SET
                loc     = COALESCE(${loc},     orgs.loc),
                website = COALESCE(${website},  orgs.website)
              WHERE id = ${org.id}
            `;
          }

          // Create contacts from SAM POC fields
          const pocTypes = ['governmentBusinessPOC', 'electronicBusinessPOC', 'pastPerformancePOC'];
          for (const pType of pocTypes) {
            const contacts = poc?.[pType];
            if (!Array.isArray(contacts)) continue;
            for (const c of contacts as Array<Record<string, string>>) {
              const email = (c.email || '').trim().toLowerCase();
              if (!email || !email.includes('@') || email.endsWith('.mil') || email.endsWith('.gov')) continue;
              const name  = [c.firstName, c.lastName].filter(Boolean).join(' ');
              const phone = c.phoneNumber || null;
              const title = c.title || null;
              const cid   = `sam-${email.replace(/[^a-z0-9]/g, '-').slice(0, 60)}`;
              try {
                await db.sql`
                  INSERT INTO contacts (id, name, title, email, phone, org_id, tags)
                  VALUES (${cid}, ${name || null}, ${title}, ${email}, ${phone ? formatPhone(phone) : null}, ${org.id}, ${'{"INDUSTRY","SAM"}'}
                  )
                  ON CONFLICT (id) DO UPDATE SET
                    name  = COALESCE(EXCLUDED.name,  contacts.name),
                    title = COALESCE(EXCLUDED.title, contacts.title),
                    phone = COALESCE(EXCLUDED.phone, contacts.phone),
                    org_id = COALESCE(EXCLUDED.org_id, contacts.org_id)
                `;
                enriched++;
              } catch { /* ignore dup */ }
            }
          }
        } catch { samErrors++; }
      }

      stats.sam = { enriched, errors: samErrors, orgsAttempted: (orgsToEnrich as unknown[]).length };
    }
  }

  return NextResponse.json({
    ok: true,
    stats,
    errors: errors.slice(0, 30),
  });
}

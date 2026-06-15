import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5-minute timeout for large syncs

const SYNC_TOKEN = 'warroomSync2026';
const SBIR_BASE  = 'https://api.www.sbir.gov/public/api/awards';
const BATCH      = 100;

/* ── Capability extraction ─────────────────────────────────────────── */
const CAP_MAP: Array<{ canonical: string; patterns: RegExp }> = [
  { canonical: 'UX',        patterns: /\bux\b|user experience/i },
  { canonical: 'HCD',       patterns: /\bhcd\b|human.?centered/i },
  { canonical: 'AI/ML',     patterns: /\bai\b|machine learning|\bml\b|artificial intelligence/i },
  { canonical: 'Cyber',     patterns: /cybersecurity|\bcyber\b/i },
  { canonical: 'C2',        patterns: /\bc2\b|command and control/i },
  { canonical: 'ISR',       patterns: /\bisr\b|intelligence.{1,5}surveillance/i },
  { canonical: 'Logistics', patterns: /logistics/i },
  { canonical: 'Autonomy',  patterns: /autonom/i },
  { canonical: 'Space',     patterns: /\bspace\b|satellite/i },
  { canonical: 'Biotech',   patterns: /biotech|medical device|life science/i },
];

function extractCapabilities(text: string): string[] {
  const caps: string[] = [];
  for (const { canonical, patterns } of CAP_MAP) {
    if (patterns.test(text)) caps.push(canonical);
  }
  return caps;
}

/* ── Phase ranking ─────────────────────────────────────────────────── */
const PHASE_RANK: Record<string, number> = { 'III': 3, 'II': 2, 'I': 1 };
function higherPhase(a: string | null, b: string): string {
  if (!a) return b;
  return (PHASE_RANK[a] ?? 0) >= (PHASE_RANK[b] ?? 0) ? a : b;
}

/* ── Firm name normalization for fuzzy match ───────────────────────── */
function normalizeFirm(name: string): string {
  return name
    .replace(/[,.]?\s*(inc\.?|llc\.?|corp\.?|co\.?|ltd\.?|incorporated|corporation|company)\.?\s*$/i, '')
    .trim()
    .toLowerCase();
}

/* ── Main handler ──────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  const token = req.headers.get('x-sync-token');
  if (token !== SYNC_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();

  /* Ensure schema exists */
  await db`ALTER TABLE orgs ADD COLUMN IF NOT EXISTS uei TEXT`;
  await db`ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sbir_phase TEXT`;
  await db`ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sbir_capabilities TEXT[]`;
  await db`ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sbir_designations TEXT[]`;
  await db`ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sbir_award_count INT DEFAULT 0`;
  await db`
    CREATE TABLE IF NOT EXISTS sbir_awards (
      id                              SERIAL PRIMARY KEY,
      uei                             TEXT,
      firm                            TEXT,
      award_title                     TEXT,
      agency                          TEXT,
      branch                          TEXT,
      phase                           TEXT,
      program                         TEXT,
      award_year                      INT,
      award_amount                    BIGINT,
      research_area_keywords          TEXT,
      abstract                        TEXT,
      hubzone_owned                   BOOLEAN,
      women_owned                     BOOLEAN,
      socially_economically_disadvantaged BOOLEAN,
      poc_name                        TEXT,
      poc_email                       TEXT,
      org_id                          TEXT REFERENCES orgs(id),
      synced_at                       TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  let start = 0;
  let processed = 0, matched = 0, created = 0, errors = 0;

  while (true) {
    const url = `${SBIR_BASE}?agency=DOD&rows=${BATCH}&start=${start}`;
    let awards: any[];
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) break;
      awards = await res.json();
      if (!Array.isArray(awards) || awards.length === 0) break;
    } catch {
      break;
    }

    for (const a of awards) {
      try {
        const firm  = (a.firm ?? '').trim();
        const uei   = (a.uei ?? '').trim() || null;
        const phase = (a.phase ?? '').toUpperCase().replace(/^PHASE\s*/i, '').trim(); // normalize "Phase II" → "II"
        const text  = `${a.research_keywords ?? a.research_area_keywords ?? ''} ${a.abstract ?? ''}`;

        const capabilities  = extractCapabilities(text);
        const designations: string[] = [];
        if (a.hubzone_owned)                     designations.push('HUBZone');
        if (a.women_owned)                       designations.push('WOSB');
        if (a.socially_economically_disadvantaged) designations.push('SDB');

        /* Match existing org */
        let orgId: number | null = null;
        let existing: any = null;

        if (uei) {
          const rows = await db`SELECT id, sbir_phase, sbir_capabilities, sbir_designations, sbir_award_count FROM orgs WHERE uei = ${uei} LIMIT 1`;
          if (rows.length) existing = rows[0];
        }
        if (!existing && firm) {
          const norm = normalizeFirm(firm);
          const rows = await db`
            SELECT id, sbir_phase, sbir_capabilities, sbir_designations, sbir_award_count
            FROM orgs
            WHERE LOWER(REGEXP_REPLACE(COALESCE(full_name, id), '[,.]?\\s*(inc\\.?|llc\\.?|corp\\.?|co\\.?|ltd\\.?)\\s*$', '', 'i')) = ${norm}
            LIMIT 1
          `;
          if (rows.length) existing = rows[0];
        }

        if (existing) {
          orgId = existing.id;
          matched++;
          const mergedCaps  = [...new Set([...(existing.sbir_capabilities ?? []), ...capabilities])];
          const mergedDesig = [...new Set([...(existing.sbir_designations ?? []), ...designations])];
          const newPhase    = higherPhase(existing.sbir_phase, phase);
          await db`
            UPDATE orgs SET
              uei                = COALESCE(${uei}, uei),
              sbir_phase         = ${newPhase || null},
              sbir_capabilities  = ${mergedCaps},
              sbir_designations  = ${mergedDesig},
              sbir_award_count   = COALESCE(sbir_award_count, 0) + 1
            WHERE id = ${orgId}
          `;
        } else if (firm) {
          created++;
          const abbr = firm.split(/\s+/).filter(Boolean).map((w: string) => w[0]).slice(0, 4).join('').toUpperCase();
          const slugBase = normalizeFirm(firm).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
          const slug = `${slugBase}-${Date.now().toString(36)}`;
          const rows = await db`
            INSERT INTO orgs (id, full_name, abbreviation, organization_type, uei, sbir_phase, sbir_capabilities, sbir_designations, sbir_award_count, is_active)
            VALUES (
              ${slug}, ${firm}, ${abbr || null}, ${'sbir_company'},
              ${uei}, ${phase || null}, ${capabilities}, ${designations}, ${1}, ${true}
            )
            RETURNING id
          `;
          orgId = rows[0]?.id ?? null;
        }

        /* Store raw award */
        await db`
          INSERT INTO sbir_awards
            (uei, firm, award_title, agency, branch, phase, program, award_year, award_amount,
             research_area_keywords, abstract, hubzone_owned, women_owned,
             socially_economically_disadvantaged, poc_name, poc_email, org_id)
          VALUES (
            ${uei}, ${firm || null}, ${a.award_title ?? null},
            ${a.agency ?? null}, ${a.branch ?? null},
            ${phase || null}, ${a.program ?? null},
            ${a.award_year ? parseInt(a.award_year) : null},
            ${a.award_amount ? parseInt(a.award_amount) : null},
            ${a.research_keywords ?? a.research_area_keywords ?? null},
            ${a.abstract ?? null},
            ${!!a.hubzone_owned}, ${!!a.women_owned},
            ${!!a.socially_economically_disadvantaged},
            ${a.poc_name ?? null}, ${a.poc_email ?? null},
            ${orgId}
          )
        `;

        processed++;
      } catch (e) {
        errors++;
        console.error('SBIR record error:', e);
      }
    }

    if (awards.length < BATCH) break;
    start += BATCH;
  }

  return NextResponse.json({ processed, matched, created, errors });
}

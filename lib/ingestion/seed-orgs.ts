import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { readFileSync } from 'fs';
import { getDb } from '../db';

// ── helpers ────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function sectorFromBranch(branch: string): string {
  const b = branch.trim();
  if (['Army', 'DoN', 'Air Force', 'Air Force/Space Force', 'Space Force', 'Coast Guard', 'DoW', 'DoD'].includes(b)) return 'Defense';
  if (b === 'Federal') return 'Civilian';
  if (b === 'All') return 'Defense';
  return 'Defense';
}

function badgeFromBranch(branch: string): { text: string; color: string } | null {
  const map: Record<string, { text: string; color: string }> = {
    'Army':                { text: 'ARMY',        color: '#4a7c29' },
    'DoN':                 { text: 'NAVY/MC',      color: '#1a3a6b' },
    'Air Force':           { text: 'AIR FORCE',    color: '#1e5fa5' },
    'Air Force/Space Force':{ text: 'AF/SF',       color: '#1e5fa5' },
    'Space Force':         { text: 'SPACE FORCE',  color: '#1c2951' },
    'Coast Guard':         { text: 'COAST GUARD',  color: '#d4382b' },
    'DoW':                 { text: 'DoW',           color: '#283a6b' },
    'DoD':                 { text: 'DoD',           color: '#283a6b' },
    'All':                 { text: 'JOINT',         color: '#283a6b' },
    'Federal':             { text: 'FEDERAL',       color: '#6b5228' },
  };
  return map[branch.trim()] ?? null;
}

function avatarColorFromBranch(branch: string): string {
  const map: Record<string, string> = {
    'Army':                '#4a7c29',
    'DoN':                 '#1a3a6b',
    'Air Force':           '#1e5fa5',
    'Air Force/Space Force':'#1e5fa5',
    'Space Force':         '#1c2951',
    'Coast Guard':         '#d4382b',
    'DoW':                 '#283a6b',
    'DoD':                 '#283a6b',
    'All':                 '#283a6b',
    'Federal':             '#6b5228',
  };
  return map[branch.trim()] ?? '#283a6b';
}

// ── parse CSV ──────────────────────────────────────────────────────────────

interface Row {
  level: number;
  org: string;
  parent: string;
  leaderName: string;
  leaderTitle: string;
  branch: string;
  location: string;
  description: string;
}

function parseCSV(path: string): Row[] {
  const lines = readFileSync(path, 'utf-8').split('\n').slice(1); // skip header
  const rows: Row[] = [];
  for (const raw of lines) {
    if (!raw.trim()) continue;
    // CSV fields: Level,Organization,Parent_Organization,Leader_Name,Leader_Title,Service_Branch,Location,Description,
    const parts = raw.split(',');
    if (parts.length < 8) continue;
    const level = parseInt(parts[0].trim(), 10);
    if (isNaN(level)) continue;
    rows.push({
      level,
      org:         parts[1].trim(),
      parent:      parts[2].trim(),
      leaderName:  parts[3].trim(),
      leaderTitle: parts[4].trim(),
      branch:      parts[5].trim(),
      location:    parts[6].trim(),
      description: parts[7].trim(),
    });
  }
  return rows;
}

// ── main ───────────────────────────────────────────────────────────────────

async function seed() {
  const CSV_PATH = '/root/.claude/uploads/04d0b9bc-b9e4-53c7-9716-57ae2eb0c989/cdacc9f1-warroom_org_data.csv';
  const rows = parseCSV(CSV_PATH);
  const db = getDb();

  console.log(`Parsed ${rows.length} rows from CSV`);

  // ── Wipe existing data (order matters for FK constraints) ──────────────
  console.log('Clearing existing data…');
  await db`DELETE FROM office_members`;
  await db`DELETE FROM team_members`;
  await db`DELETE FROM offices`;
  await db`DELETE FROM teams`;
  await db`DELETE FROM followers`;
  await db`DELETE FROM contracts`;
  await db`DELETE FROM people`;
  await db`DELETE FROM related_organizations`;
  await db`DELETE FROM organization_settings`;
  await db`DELETE FROM organizations`;
  console.log('Tables cleared.');

  // ── Deduplicate orgs: first occurrence wins ────────────────────────────
  const seen = new Map<string, Row>(); // org name → first row
  for (const row of rows) {
    if (!seen.has(row.org)) seen.set(row.org, row);
  }

  // Ensure slug uniqueness
  const slugCount = new Map<string, number>();
  const orgSlugMap = new Map<string, string>(); // org name → slug

  for (const [name] of seen) {
    let slug = slugify(name);
    const n = (slugCount.get(slug) ?? 0) + 1;
    slugCount.set(slug, n);
    if (n > 1) slug = `${slug}-${n}`;
    orgSlugMap.set(name, slug);
  }

  // ── Insert organizations ───────────────────────────────────────────────
  console.log(`Inserting ${seen.size} unique organizations…`);

  // Build list preserving insertion order
  const orgList = Array.from(seen.values());

  // Insert in batches of 50
  const BATCH = 50;
  const orgIdMap = new Map<string, string>(); // slug → db uuid

  for (let i = 0; i < orgList.length; i += BATCH) {
    const batch = orgList.slice(i, i + BATCH);
    for (const row of batch) {
      const slug = orgSlugMap.get(row.org)!;
      const badge = badgeFromBranch(row.branch);
      const [inserted] = await db`
        INSERT INTO organizations (name, slug, badge_text, badge_color, description, sector, hq_address)
        VALUES (
          ${row.org},
          ${slug},
          ${badge?.text ?? null},
          ${badge?.color ?? null},
          ${row.description || null},
          ${sectorFromBranch(row.branch)},
          ${row.location || null}
        )
        RETURNING id
      `;
      orgIdMap.set(slug, inserted.id);
    }
    process.stdout.write(`  orgs ${Math.min(i + BATCH, orgList.length)}/${orgList.length}\r`);
  }
  console.log(`\nOrganizations inserted: ${orgIdMap.size}`);

  // ── Insert parent-child relationships ─────────────────────────────────
  console.log('Inserting parent-child relationships…');
  let relCount = 0;
  for (const row of orgList) {
    if (!row.parent || row.parent === 'Executive Branch' || row.parent === 'White House' || row.parent === 'Congress') continue;
    const childSlug  = orgSlugMap.get(row.org);
    const parentSlug = orgSlugMap.get(row.parent);
    if (!childSlug || !parentSlug) continue;
    const childId  = orgIdMap.get(childSlug);
    const parentId = orgIdMap.get(parentSlug);
    if (!childId || !parentId || childId === parentId) continue;
    // related_organizations requires org_id_1 < org_id_2 (UUID lexical order)
    const [a, b] = [childId, parentId].sort();
    try {
      await db`
        INSERT INTO related_organizations (org_id_1, org_id_2)
        VALUES (${a}, ${b})
        ON CONFLICT DO NOTHING
      `;
      relCount++;
    } catch { /* ignore duplicates */ }
  }
  console.log(`Relationships inserted: ${relCount}`);

  // ── Insert people (leaders) ────────────────────────────────────────────
  // All rows contribute a person, deduped by (name, org) pair
  console.log('Inserting people…');
  const personKeys = new Set<string>(); // "name|orgSlug"
  let personCount = 0;

  for (const row of rows) {
    if (!row.leaderName || row.leaderName === 'Various' || row.leaderName === 'Varies' || row.leaderName === 'Vacant') continue;
    const orgSlug = orgSlugMap.get(row.org);
    if (!orgSlug) continue;
    const orgId = orgIdMap.get(orgSlug);
    if (!orgId) continue;

    const key = `${row.leaderName}|${orgSlug}`;
    if (personKeys.has(key)) continue;
    personKeys.add(key);

    const color = avatarColorFromBranch(row.branch);
    await db`
      INSERT INTO people (org_id, full_name, role_title, avatar_color, location)
      VALUES (${orgId}, ${row.leaderName}, ${row.leaderTitle || null}, ${color}, ${row.location || null})
      ON CONFLICT DO NOTHING
    `;
    personCount++;
    if (personCount % 50 === 0) process.stdout.write(`  people ${personCount}\r`);
  }
  console.log(`\nPeople inserted: ${personCount}`);

  console.log('\n✓ Seed complete.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

// Run with: npx ts-node --project tsconfig.scripts.json scripts/import-csv-leaders.ts
import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

function slugify(str: string): string {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter(l => l.trim());
  const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts: string[] = [];
    let cur = '', inQuote = false;
    for (const ch of lines[i]) {
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === ',' && !inQuote) { parts.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    parts.push(cur.trim());
    if (parts.length < 3) continue;
    const row: Record<string, string> = {};
    header.forEach((h, idx) => { row[h] = (parts[idx] ?? '').trim(); });
    rows.push(row);
  }
  return rows;
}

// Tier mapping: CSV Level → contacts.hierarchy_order
// CSV Level is the ORG's depth, but person tier depends on their title
function titleToTier(title: string, csvLevel: number): number {
  const t = title.toLowerCase();
  if (t.includes('secretary') && !t.includes('under') && !t.includes('assistant') && !t.includes('deputy')) return 1;
  if (t.includes('chief of space operations') || t.includes('chief of staff of the') || t.includes('commandant of the marine') || t.includes('chief of naval operations')) return 1;
  if (t.includes('commanding general') && csvLevel <= 2) return 1;
  if (t.includes('deputy secretary') || t.includes('vice chief') || t.includes('assistant commandant') || t.includes('vice commandant')) return 2;
  if (t.includes('chairman')) return 2;
  if (t.includes('under secretary') && !t.includes('deputy')) return 3;
  if (t.includes('inspector general') && !t.includes('deputy') && !t.includes('acting')) return 3;
  if (t.includes('assistant secretary') && !t.includes('deputy')) return 4;
  if (t.includes('vice chairman')) return 4;
  if (t.includes('acting') && t.includes('inspector')) return 4;
  if (t.includes('deputy assistant')) return 5;
  if (t.includes('deputy under')) return 5;
  if (t.includes('general counsel')) return 5;
  // Military stars
  if (/\b(gen|adm)\b/.test(t) && csvLevel <= 3) return 4;
  if (/(ltg|vadm|lieutenant general|vice admiral)/.test(t)) return 6;
  if (/(mg|radm|major general|rear admiral)/.test(t)) return 7;
  if (/(bg|commodore|brigadier)/.test(t)) return 8;
  if (/\b(col|colonel|capt|captain)\b/.test(t)) return 8;
  if (/(ltc|lt col|lieutenant colonel)/.test(t)) return 9;
  if (t.includes('director') && !t.includes('deputy') && !t.includes('assistant') && csvLevel <= 3) return 6;
  if (t.includes('director') && !t.includes('deputy')) return 7;
  if (t.includes('deputy director') || t.includes('vice director')) return 8;
  if (t.includes('commander') && csvLevel <= 3) return 4;
  if (t.includes('commander')) return 6;
  if (t.includes('program executive')) return 9;
  if (t.includes('executive director')) return 6;
  if (t.includes('chief of staff')) return 6;
  // fallback: scale by CSV level
  return Math.min(2 + csvLevel, 9);
}

async function main() {
  const csvPath = '/Users/savankong/Desktop/War_Room_v2/Data/warroom_org_data.csv';
  const raw = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(raw);
  console.log(`Parsed ${rows.length} CSV rows`);

  // Load all orgs for matching
  const orgs = await sql<{id: string; full_name: string}[]>`SELECT id, full_name FROM orgs`;
  console.log(`Loaded ${orgs.length} orgs from DB`);

  // Build a normalized name → id map
  const normalize = (s: string) => s.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const orgMap = new Map<string, string>();
  for (const o of orgs) {
    orgMap.set(normalize(o.full_name), o.id);
  }

  // Manual overrides for CSV org names → DB org IDs
  const OVERRIDES: Record<string, string> = {
    'department of war':                            'dept-of-war',
    'office of the secretary of war':               'osw',
    'office of inspector general':                  'dod-oig',
    'office of legislative affairs':                'osw',
    'washington headquarters services':             'osw',
    'joint chiefs of staff':                        'jcs',
    'under secretary for acquisition and sustainment': 'ousd_as',
    'under secretary for research and engineering': 'ousd_re',
    'under secretary for policy':                   'ousd_p',
    'under secretary for intelligence and security':'osw-is',
    'under secretary for personnel and readiness':  'ousd_pr',
    'under secretary comptroller cfo':              'usd-c',
    'cost assessment and program evaluation cape':  'cape',
    'dow chief information officer':                'dow-cio',
    'joint staff j1 manpower':                      'jcs',
    'joint staff j2 intelligence':                  'jcs',
    'joint staff j3 operations':                    'jcs',
    'joint staff j4 logistics':                     'jcs',
    'joint staff j5 strategy plans policy':         'jcs',
    'joint staff j6 c4 cyber':                      'jcs',
    'joint staff j7 joint force development':       'jcs',
    'joint staff j8 force structure':               'jcs',
    'jiatf-401 counter-uas':                        'jiatf401',
    'golden dome missile defense':                  'golden-dome',
    'submarine drpm':                               'pae_sub',
    'critical major weapon systems drpm':           'crit-mws-drpm',
    'special access programs central office sapco': 'sapco',
    'economic defense unit':                        'economic-defense-unit',
    'office of strategic capital':                  'office-of-strategic-capital',
    'defense innovation unit diu':                  'diu',
    'darpa':                                        'darpa',
    'strategic capabilities office sco':            'sco',
    'missile defense agency mda':                   'mda',
    'department of the army':                       'dept-of-the-army',
    'department of the navy':                       'dept-of-the-navy',
    'department of the air force':                  'dept-of-the-air-force',
    'united states space force':                    'space-force',
    'united states coast guard':                    'uscg',
    'combatant commands':                           'dept-of-war',
    'us central command centcom':                   'centcom',
    'u s central command centcom':                  'centcom',
    'us africa command africom':                    'africom',
    'u s africa command africom':                   'africom',
    'us european command eucom':                    'eucom',
    'u s european command eucom':                   'eucom',
    'us indo pacific command indopacom':            'indopacom',
    'u s indo pacific command indopacom':           'indopacom',
    'us northern command northcom':                 'northcom',
    'u s northern command northcom':                'northcom',
    'us southern command southcom':                 'southcom',
    'u s southern command southcom':                'southcom',
    'us space command spacecom':                    'spacecom',
    'u s space command spacecom':                   'spacecom',
    'us special operations command socom':          'socom',
    'u s special operations command socom':         'socom',
    'us transportation command transcom':           'transcom',
    'u s transportation command transcom':          'transcom',
    'us strategic command stratcom':                'stratcom',
    'u s strategic command stratcom':               'stratcom',
    'us cyber command cybercom':                    'cybercom',
    'u s cyber command cybercom':                   'cybercom',
    'army chief of staff':                          'dept-of-the-army',
    'office of the secretary of the army':          'dept-of-the-army',
    'office of the secretary of the navy':          'dept-of-the-navy',
    'chief of naval operations cno':                'dept-of-the-navy',
    'marine corps headquarters':                    'dept-of-the-navy',
    'office of the secretary of the air force':     'dept-of-the-air-force',
    'air force chief of staff':                     'dept-of-the-air-force',
    'defense logistics agency dla':                 'dla',
    'defense information systems agency disa':      'disa',
    'defense intelligence agency dia':              'dia',
    'defense counterintelligence and security agency dcsa': 'dcsa',
    'defense threat reduction agency dtra':         'dtra',
    'defense health agency dha':                    'dha',
    'defense contract management agency dcma':      'dcma',
    'defense finance and accounting service dfas':  'dfas',
    'defense contract audit agency dcaa':           'dcaa',
    'office of personnel management opm':           'opm',
    'office of science and technology policy ostp': 'ostp',
    'office of the national cyber director ncd':    'oncd',
    'government accountability office gao':         'gao',
    'white house office of management and budget omb': 'omb',
    'naval air systems command navair':             'navair',
    'naval sea systems command navsea':             'navsea',
    'army materiel command amc':                    'amc',
    'army transformation and training command t2com': 'army-t2com',
    'army contracting command acc':                 'army-acc',
  };

  function findOrgId(csvOrgName: string): string | null {
    const norm = normalize(csvOrgName);
    if (OVERRIDES[norm]) return OVERRIDES[norm];
    // Try direct map
    if (orgMap.has(norm)) return orgMap.get(norm)!;
    // Try substring match
    for (const [k, v] of orgMap) {
      if (norm.includes(k.slice(0, 20)) || k.includes(norm.slice(0, 20))) return v;
    }
    return null;
  }

  let inserted = 0, updated = 0, skipped = 0, noOrg = 0;

  for (const row of rows) {
    const leaderName = row['Leader_Name']?.trim();
    const leaderTitle = row['Leader_Title']?.trim();
    const orgName = row['Organization']?.trim();
    const csvLevel = parseInt(row['Level'] ?? '5', 10);
    const location = row['Location']?.trim();
    const branch = row['Service_Branch']?.trim();

    // Skip rows without a real leader
    if (!leaderName || ['Vacant', 'Various', 'Varies', 'TBD', 'Various,'].includes(leaderName)) {
      skipped++;
      continue;
    }

    const orgId = findOrgId(orgName);
    if (!orgId) {
      console.log(`  ⚠ No org match for: "${orgName}" (leader: ${leaderName})`);
      noOrg++;
      continue;
    }

    // Check if org exists
    const orgExists = await sql`SELECT id FROM orgs WHERE id = ${orgId}`;
    if (orgExists.length === 0) {
      console.log(`  ⚠ Org "${orgId}" not in DB (for: ${orgName})`);
      noOrg++;
      continue;
    }

    const tier = titleToTier(leaderTitle ?? '', csvLevel);
    const contactId = `${slugify(leaderName)}-${orgId}`.slice(0, 80);
    const orgFull = (await sql`SELECT full_name FROM orgs WHERE id = ${orgId}`)[0]?.full_name ?? orgName;

    // Check if contact already exists
    const existing = await sql`SELECT id FROM contacts WHERE id = ${contactId}`;

    if (existing.length > 0) {
      await sql`
        UPDATE contacts SET
          name = ${leaderName},
          title = ${leaderTitle},
          org_id = ${orgId},
          org_full = ${orgFull},
          hierarchy_order = ${tier}
        WHERE id = ${contactId}
      `;
      updated++;
    } else {
      await sql`
        INSERT INTO contacts (id, name, title, org_id, org_full, hierarchy_order, color)
        VALUES (
          ${contactId}, ${leaderName}, ${leaderTitle}, ${orgId}, ${orgFull},
          ${tier},
          ${['#283a6b','#c8502d','#2f8676','#e0a32e','#7c4dbc'][Math.abs(leaderName.charCodeAt(0)) % 5]}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name, title = EXCLUDED.title,
          org_id = EXCLUDED.org_id, org_full = EXCLUDED.org_full,
          hierarchy_order = EXCLUDED.hierarchy_order
      `;
      inserted++;
    }
  }

  console.log(`\nDone: ${inserted} inserted, ${updated} updated, ${skipped} skipped (vacant), ${noOrg} no org match`);
  await sql.end();
}

main().catch(console.error);

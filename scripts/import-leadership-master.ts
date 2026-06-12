// Run with: npx ts-node --project tsconfig.scripts.json scripts/import-leadership-master.ts
import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../.env.local') });
const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60);
}

const COLORS = ['#283a6b','#c8502d','#2f8676','#e0a32e','#7c4dbc'];
function colorFor(name: string) { return COLORS[Math.abs(name.charCodeAt(0)) % COLORS.length]; }

// CSV org name → DB org ID
const ORG_MAP: Record<string, string | null> = {
  'department of war':                              'dept-of-war',
  'office of the secretary of war':                 'osw',
  'office of inspector general':                    'dod-oig',
  'office of legislative affairs':                  'osw',       // maps into OSW
  'washington headquarters services':               'osw',       // maps into OSW
  'ousd acquisition and sustainment':               'ousd_as',
  'ousd research and engineering':                  'ousd_re',
  'ousd policy':                                    'ousd_p',
  'ousd intelligence and security':                 'osw-is',
  'ousd personnel and readiness':                   'ousd_pr',
  'ousd comptroller cfo':                           'usd-c',
  'cost assessment and program evaluation (cape)':  'cape',
  'department of war cio':                          'dow-cio',
  'joint chiefs of staff':                          'jcs',
  'joint staff j1':                                 'jcs',
  'joint staff j2':                                 'jcs',
  'joint staff j3':                                 'jcs',
  'joint staff j4':                                 'jcs',
  'joint staff j5':                                 'jcs',
  'joint staff j6':                                 'jcs',
  'joint staff j7':                                 'jcs',
  'joint staff j8':                                 'jcs',
  'eucom':                                          'eucom',
  'centcom':                                        'centcom',
  'indopacom':                                      'indopacom',
  'northcom':                                       'northcom',
  'southcom':                                       'southcom',
  'spacecom':                                       'spacecom',
  'socom':                                          'socom',
  'transcom':                                       'transcom',
  'stratcom':                                       'stratcom',
  'cybercom':                                       'cybercom',
  'department of the army':                         'dept-of-the-army',
  'department of the navy':                         'dept-of-the-navy',
  'department of the air force':                    'dept-of-the-air-force',
  'united states coast guard':                      'dept-of-the-navy', // closest parent
  'darpa':                                          'darpa',
  'defense innovation unit (diu)':                  'diu',
  'missile defense agency (mda)':                   'mda',
  'strategic capabilities office (sco)':            'sco',
  'economic defense unit':                          null, // not in DB yet
  'office of strategic capital':                    null, // not in DB yet
  'defense intelligence agency (dia)':              'dia',
  'national security agency (nsa)':                 null, // not in DB
  'national reconnaissance office (nro)':           null,
  'national geospatial-intelligence agency (nga)':  null,
  'defense counterintelligence and security agency (dcsa)': 'dcsa',
  'defense logistics agency (dla)':                 'dla',
  'defense contract management agency (dcma)':      null, // not in DB
  'defense contract audit agency (dcaa)':           'dcaa',
  'army chief of staff':                            'dept-of-the-army',
  'army vice chief of staff':                       'dept-of-the-army',
  'asa acquisition (alt)':                          'dept-of-the-army',
  'asa financial management':                       'dept-of-the-army',
  'army materiel command (amc)':                    'amc',
  'army cyber command (arcyber)':                   'dept-of-the-army',
  'army transformation (t2com)':                    'army-t2com',
  'army special operations command (arsoc)':        'dept-of-the-army',
  'chief of naval operations':                      'dept-of-the-navy',
  'navy vice chief of naval operations':            'dept-of-the-navy',
  'asn research development and acquisition':       'dept-of-the-navy',
  'naval air systems command (navair)':             'navair',
  'naval sea systems command (navsea)':             'navsea',
  'marine corps hq':                                'dept-of-the-navy',
  'assistant commandant of the marine corps':       'dept-of-the-navy',
  'marine corps systems command':                   'dept-of-the-navy',
  'air force chief of staff':                       'dept-of-the-air-force',
  'air force vice chief of staff':                  'dept-of-the-air-force',
  'saf acquisition technology and logistics':       'dept-of-the-air-force',
  'air force materiel command (afmc)':              'dept-of-the-air-force',
  'air combat command (acc)':                       'af_acc',
  'chief of space operations':                      'space-force',
  'space systems command (ssc)':                    'space-force',
  'combat forces command (spoc)':                   'space-force',
  'defense finance and accounting service (dfas)':  'dfas',
  'defense health agency (dha)':                    'dha',
  'pentagon force protection agency':               'osw',
  'defense media activity':                         'osw',
};

// Tier by functional group + title context
function inferTier(title: string, group: string): number {
  const t = title.toLowerCase();
  // Tier 1: apex leaders of their org
  if (group === 'Operational') return 1; // all COCOM commanders
  if (t.includes('secretary of war') || t.startsWith('secretary of') || t.startsWith('acting secretary')) return 1;
  if (t.includes('commandant of the marine') || t.includes('chief of space operations')) return 1;
  if (t.includes('chief of naval operations') || t.includes(' cno') || t.startsWith('cno')) return 1;
  if (t.includes('chairman') || t.includes('commandant,')) return 1;
  // Tier 2: under secretaries, CFO, CIO, IG, vice chiefs
  if (t.includes('under secretary') || t.includes('cfo') || t.includes('dow cio') || t.includes('inspector general')) return 2;
  if (t.includes('vice chief') || t.includes('assistant commandant') || t.includes('vice cno') || t.includes('vice chief of naval')) return 2;
  // Tier 3: directors of sub-agencies, assistant secretaries, service chiefs of staff, commanding generals of sub-commands
  if (t.includes('chief of staff') && (group.startsWith('Service'))) return 2;
  if (t.includes('director') || t.includes('assistant secretary') || t.includes('performing duties')) return 3;
  if (t.includes('commanding general') || t.includes('commander,')) return 3;
  return 4;
}

async function main() {
  const csvPath = path.join(__dirname, '../data/leadership_master.csv');
  const lines = fs.readFileSync(csvPath, 'utf8').split('\n').filter(l => l.trim());
  const header = lines[0].split(',').map(h => h.trim());

  const orgNames = new Map((await sql<{id:string;full_name:string}[]>`SELECT id, full_name FROM orgs`).map(o => [o.id, o.full_name]));

  let inserted = 0, updated = 0, skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    // Simple CSV parse (no quoted commas in this dataset)
    const parts = lines[i].split(',').map(p => p.trim());
    const row: Record<string, string> = {};
    header.forEach((h, idx) => { row[h] = parts[idx] ?? ''; });

    const leader = row['Leader'];
    const title = row['Title'];
    const orgCsv = row['Organization'];
    const group = row['Functional_Group'];

    // Skip vacant/various
    if (!leader || ['Vacant', 'Various'].includes(leader)) { skipped++; continue; }

    const orgKey = orgCsv.toLowerCase().replace(/[^a-z0-9\s()&]/g, '').replace(/\s+/g, ' ').trim();
    const orgId = ORG_MAP[orgKey];
    if (orgId === undefined) {
      console.log(`  ? No mapping for: "${orgCsv}"`);
      skipped++;
      continue;
    }
    if (orgId === null) {
      console.log(`  – Org not in DB yet, skipping: "${orgCsv}" (${leader})`);
      skipped++;
      continue;
    }

    const orgFull = orgNames.get(orgId) ?? orgCsv;
    const tier = inferTier(title, group);
    // Use org-scoped ID so same person can lead multiple orgs
    const contactId = `${slugify(leader)}-${orgId}`.slice(0, 80);

    await sql`
      INSERT INTO contacts (id, name, title, org_id, org_full, hierarchy_order, color)
      VALUES (${contactId}, ${leader}, ${title}, ${orgId}, ${orgFull}, ${tier}, ${colorFor(leader)})
      ON CONFLICT (id) DO UPDATE SET
        name            = EXCLUDED.name,
        title           = EXCLUDED.title,
        org_id          = EXCLUDED.org_id,
        org_full        = EXCLUDED.org_full,
        hierarchy_order = EXCLUDED.hierarchy_order
    `;

    console.log(`  ✓ [T${tier}] ${leader} → ${orgId}`);
    inserted++;
  }

  console.log(`\nDone: ${inserted} upserted, ${skipped} skipped`);
  await sql.end();
}

main().catch(console.error);

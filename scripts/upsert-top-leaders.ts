// Run with: npx ts-node --project tsconfig.scripts.json scripts/upsert-top-leaders.ts
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

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

const COLORS = ['#283a6b','#c8502d','#2f8676','#e0a32e','#7c4dbc'];
function colorFor(name: string) { return COLORS[Math.abs(name.charCodeAt(0)) % COLORS.length]; }

// Leaders provided by user — these are always tier 1 (top) of their org
const LEADERS: { org_id: string; name: string; title: string; org_full?: string }[] = [
  { org_id: 'dept-of-war',  name: 'Pete Hegseth',          title: 'Secretary of War' },
  { org_id: 'osw',          name: 'Pete Hegseth',          title: 'Secretary of War' },
  { org_id: 'dod-oig',      name: 'Platte Moring',         title: 'Inspector General' },
  { org_id: 'osw',          name: 'Macon Dane Hughes',     title: 'Assistant Secretary for Legislative Affairs' },
  // Washington HQ Services — check if org exists, else map to osw
  { org_id: 'osw',          name: 'Regina F. Meiners',     title: 'Director, Washington Headquarters Services' },
  { org_id: 'ousd_as',      name: 'Michael Duffey',        title: 'Under Secretary of Defense for Acquisition and Sustainment' },
  { org_id: 'ousd_re',      name: 'Emil Michael',          title: 'Under Secretary of Defense for Research and Engineering / CTO' },
  { org_id: 'ousd_p',       name: 'Elbridge Colby',        title: 'Under Secretary of Defense for Policy' },
  { org_id: 'osw-is',       name: 'Bradley Hansell',       title: 'Under Secretary of Defense for Intelligence and Security' },
  { org_id: 'ousd_pr',      name: 'Anthony Tata',          title: 'Under Secretary of Defense for Personnel and Readiness' },
  { org_id: 'usd-c',        name: 'Jules W. Hurst III',    title: 'Under Secretary of Defense (Comptroller) / CFO' },
  { org_id: 'cape',         name: 'Michael Payne',         title: 'Acting Director, Cost Assessment and Program Evaluation' },
  { org_id: 'dow-cio',      name: 'Kirsten Davies',        title: 'Department of War Chief Information Officer' },
  { org_id: 'jcs',          name: 'GEN Dan Caine',         title: 'Chairman, Joint Chiefs of Staff' },
  // Joint Staff directorates — map to jcs
  { org_id: 'jcs',          name: 'MG Paige M. Jennings',        title: 'Director, Joint Staff J1 (Manpower & Personnel)' },
  { org_id: 'jcs',          name: 'VADM Thomas M. Henderschedt', title: 'Director, Joint Staff J2 (Intelligence)' },
  { org_id: 'jcs',          name: 'LTG David L. Odom',           title: 'Director, Joint Staff J3 (Operations)' },
  { org_id: 'jcs',          name: 'LTG Keith D. Reventlow',      title: 'Director, Joint Staff J4 (Logistics)' },
  { org_id: 'jcs',          name: 'LTG Brett G. Sylvia',         title: 'Director, Joint Staff J5 (Strategy, Plans & Policy)' },
  { org_id: 'jcs',          name: 'LTG David T. Isaacson',       title: 'Director, Joint Staff J6 / CIO (C4 & Cyber)' },
  { org_id: 'jcs',          name: 'LTG Stephen E. Liszewski',    title: 'Director, Joint Staff J7 (Joint Force Development)' },
  { org_id: 'jcs',          name: 'LTG Steven Whitney',          title: 'Director, Joint Staff J8 (Force Structure, Resources & Assessment)' },
  // COCOMs
  { org_id: 'eucom',        name: 'Alexus G. Grynkewich',  title: 'Commander, US European Command' },
  { org_id: 'centcom',      name: 'Brad Cooper',           title: 'Commander, US Central Command' },
  { org_id: 'indopacom',    name: 'Samuel Paparo',         title: 'Commander, US Indo-Pacific Command' },
  { org_id: 'northcom',     name: 'Gregory M. Guillot',    title: 'Commander, US Northern Command / NORAD' },
  { org_id: 'southcom',     name: 'Evan L. Pettus',        title: 'Commander, US Southern Command' },
  { org_id: 'spacecom',     name: 'Stephen N. Whiting',    title: 'Commander, US Space Command' },
  { org_id: 'socom',        name: 'Bryan P. Fenton',       title: 'Commander, US Special Operations Command' },
  { org_id: 'transcom',     name: 'Randall Reed',          title: 'Commander, US Transportation Command' },
  { org_id: 'stratcom',     name: 'Anthony J. Cotton',     title: 'Commander, US Strategic Command' },
  { org_id: 'cybercom',     name: 'Timothy D. Haugh',      title: 'Commander, US Cyber Command' },
];

async function main() {
  // Load org full names
  const orgRows = await sql<{id: string; full_name: string}[]>`SELECT id, full_name FROM orgs`;
  const orgNames = new Map(orgRows.map(o => [o.id, o.full_name]));

  let upserted = 0;
  for (const leader of LEADERS) {
    const orgFull = orgNames.get(leader.org_id) ?? leader.org_full ?? leader.org_id;
    const contactId = `${slugify(leader.name)}-${leader.org_id}`.slice(0, 80);

    await sql`
      INSERT INTO contacts (id, name, title, org_id, org_full, hierarchy_order, color)
      VALUES (
        ${contactId}, ${leader.name}, ${leader.title}, ${leader.org_id}, ${orgFull},
        1,
        ${colorFor(leader.name)}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        org_id = EXCLUDED.org_id,
        org_full = EXCLUDED.org_full,
        hierarchy_order = 1
    `;
    console.log(`  ✓ ${leader.name} → ${leader.org_id} (tier 1)`);
    upserted++;
  }

  // Also ensure Pete Hegseth is tier 1 everywhere he's assigned
  await sql`UPDATE contacts SET hierarchy_order = 1 WHERE name = 'Pete Hegseth'`;

  console.log(`\nDone: ${upserted} leaders upserted at tier 1`);
  await sql.end();
}

main().catch(console.error);

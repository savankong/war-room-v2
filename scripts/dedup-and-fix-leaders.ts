// Run with: npx ts-node --project tsconfig.scripts.json scripts/dedup-and-fix-leaders.ts
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });
const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

// Pairs: [keep_id, merge_from_id]
// Contacts + contracts from merge_from get moved to keep, then merge_from marked inactive
const MERGES: [string, string][] = [
  ['socom',               'hqussocom'],
  ['transcom',            'ustranscom'],
  ['navsea',              'naval-sea-systems-command'],
  ['army-t2com',          't2com'],
  ['army-hrc',            'army_hrc'],
  ['dla',                 'defense-logistics-agency'],
  ['afrl',                'air-force-research-laboratory'],
  ['space-force',         'ussf'],
  ['osw-is',              'ousd-is-root'],
  ['army-usasmdc',        'usasmdc'],
  ['aflcmc',              'fa8052'],
  ['pae_maneuver_ground', 'pae_mng'],
];

// Designated leader per org: only this person stays at tier 1, everyone else bumped to min tier 2
// org_id → contact name (partial match is fine)
const DESIGNATED_LEADERS: Record<string, string> = {
  'dept-of-war':          'Pete Hegseth',
  'osw':                  'Pete Hegseth',
  'dod-oig':              'Platte Moring',
  'ousd_as':              'Michael Duffey',
  'ousd_re':              'Emil Michael',
  'ousd_p':               'Elbridge Colby',
  'osw-is':               'Bradley Hansell',
  'ousd_pr':              'Anthony Tata',
  'usd-c':                'Jules W. Hurst III',
  'cape':                 'Michael Payne',
  'dow-cio':              'Kirsten Davies',
  'jcs':                  'GEN Dan Caine',
  'eucom':                'Alexus G. Grynkewich',
  'centcom':              'Brad Cooper',
  'indopacom':            'Samuel Paparo',
  'northcom':             'Gregory M. Guillot',
  'southcom':             'Frank Donovan',
  'spacecom':             'Stephen N. Whiting',
  'socom':                'Frank Mitch M. Bradley',
  'transcom':             'Randall Reed',
  'stratcom':             'Richard Correll',
  'cybercom':             'Joshua M. Rudd',
  'dept-of-the-army':     'Daniel P. Driscoll',
  'dept-of-the-navy':     'Hung Cao',
  'dept-of-the-air-force':'Dr. Troy E. Meink',
  'darpa':                'Stephen Winchell',
  'diu':                  'Owen West',
  'mda':                  'LTG Heath Collins',
  'sco':                  'Jay Dryer',
  'dia':                  'LTG James H. Adams',
  'dcsa':                 'Joseph Tonon',
  'dla':                  'LTG Mark Simerly',
  'dcaa':                 'Ms. Jennifer L. Desautel',
  'amc':                  'LTG Chris Mohan',
  'navair':               'VADM John Dougherty IV',
  'navsea':               'VADM James P. Downey',
  'space-force':          'GEN B. Chance Saltzman',
  'dfas':                 'Mr. Jonathan Witter',
  'dha':                  'VADM Darin K. Via',
  'af_acc':               'GEN Adrian L. Spain',
  'army-t2com':           'LTG Edmond Miles Brown',
};

async function main() {
  // ── Step 1: Merge duplicate orgs ──────────────────────────────────────────
  console.log('\n=== MERGING DUPLICATE ORGS ===');
  for (const [keep, drop] of MERGES) {
    const keepExists = await sql`SELECT id FROM orgs WHERE id = ${keep}`;
    const dropExists = await sql`SELECT id FROM orgs WHERE id = ${drop}`;
    if (keepExists.length === 0) { console.log(`  SKIP: keep "${keep}" not in DB`); continue; }
    if (dropExists.length === 0) { console.log(`  SKIP: drop "${drop}" not in DB`); continue; }

    // Move contacts
    const movedC = await sql`UPDATE contacts SET org_id = ${keep} WHERE org_id = ${drop}`;
    // Move contracts
    const movedCt = await sql`UPDATE contracts SET org_id = ${keep} WHERE org_id = ${drop}`;
    // Fix parent_id references
    await sql`UPDATE orgs SET parent_id = ${keep} WHERE parent_id = ${drop}`;
    // Mark drop as inactive (don't delete — keep for ref)
    await sql`UPDATE orgs SET is_active = false, merge_status = ${'merged'}, canonical_org_id = ${keep} WHERE id = ${drop}`;

    console.log(`  ✓ ${drop} → ${keep} | contacts: ${movedC.count} | contracts: ${movedCt.count}`);
  }

  // ── Step 2: Fix designated leader ordering ────────────────────────────────
  console.log('\n=== FIXING LEADER ORDERING ===');
  for (const [orgId, leaderName] of Object.entries(DESIGNATED_LEADERS)) {
    // Find the designated leader by name (exact or close match)
    const leader = await sql`
      SELECT id, name, hierarchy_order FROM contacts
      WHERE org_id = ${orgId} AND lower(name) = lower(${leaderName})
      LIMIT 1
    `;

    if (leader.length === 0) {
      console.log(`  ? No contact found for "${leaderName}" in ${orgId}`);
      continue;
    }

    const leaderId = leader[0].id;

    // Ensure this leader is tier 1
    await sql`UPDATE contacts SET hierarchy_order = 1 WHERE id = ${leaderId}`;

    // Bump all OTHER contacts in this org that are also tier 1 → tier 2
    const bumped = await sql`
      UPDATE contacts SET hierarchy_order = 2
      WHERE org_id = ${orgId} AND hierarchy_order = 1 AND id != ${leaderId}
    `;

    console.log(`  ✓ ${orgId}: "${leaderName}" pinned T1, bumped ${bumped.count} others → T2`);
  }

  // ── Step 3: Verify SOCOM ─────────────────────────────────────────────────
  console.log('\n=== SOCOM TOP 5 AFTER FIX ===');
  const socom = await sql`
    SELECT name, title, hierarchy_order FROM contacts
    WHERE org_id = 'socom' ORDER BY hierarchy_order NULLS LAST, name LIMIT 5
  `;
  for (const c of socom) console.log(`  [T${c.hierarchy_order}] ${c.name} — ${c.title}`);

  await sql.end();
}

main().catch(console.error);

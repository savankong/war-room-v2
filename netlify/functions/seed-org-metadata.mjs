import { getDatabase } from '@netlify/database';

/**
 * Seeds org_types, org_rel_types, then sets parent_id + org_type_id
 * on every org from Orgs_PDF_Final.csv.
 *
 * GET /api/seed-org-metadata?token=<SAM_SYNC_TOKEN>
 * GET /api/seed-org-metadata?token=<SAM_SYNC_TOKEN>&dry=1
 */

// ── Org types ──────────────────────────────────────────────────────────────
const ORG_TYPES = [
  // Civilian / Policy
  ['department',              'Department',                    'civilian',    1,  'Cabinet-level departments (DoD)'],
  ['military_department',     'Military Department',           'civilian',    2,  'Dept of Army / Navy / Air Force with own Secretary'],
  ['usd_office',              'Under Secretary Office',        'civilian',    3,  'USD-level policy offices (OUSD A&S, R&E, P, I&S, P&R)'],
  ['asd_office',              'Assistant Secretary Office',    'civilian',    4,  'ASD-level offices'],
  ['osd_office',              'OSD Staff Office',              'civilian',    5,  'OSD direct-report offices (CAPE, SCO, CIO, etc.)'],

  // Military
  ['joint_staff',             'Joint Staff',                   'military',    3,  'Joint Chiefs of Staff and J-directorates'],
  ['service_hq',              'Service Headquarters',          'military',    4,  'ARSTAF, OPNAV, HAF, USSF HQ, HQMC'],
  ['major_command',           'Major Command',                 'military',    5,  'TRADOC, AMC, AFMC, MARFORPAC, etc.'],
  ['field_command',           'Field Command',                 'military',    6,  'Corps, divisions, wings, numbered armies'],
  ['component_command',       'Service Component Command',     'military',    6,  'ARCENT, NAVCENT, USAFE, etc.'],

  // Operational
  ['unified_command',         'Unified Combatant Command',     'operational', 3,  'Geographic and functional CCMDs'],
  ['sub_unified_command',     'Sub-Unified Command',           'operational', 4,  'SOCEUR, JIATF, etc.'],
  ['fleet_command',           'Fleet / Force Command',         'operational', 5,  'PACFLT, USFF, numbered fleets'],
  ['special_ops_command',     'Special Operations Command',    'operational', 5,  'JSOC, ARSOC, AFSOC, NSW, MARSOC'],

  // Intelligence & Agencies
  ['defense_agency',          'Defense Agency',                'intelligence', 3, 'DIA, DISA, DCSA, MDA, DLA, DFAS'],
  ['defense_field_activity',  'Defense Field Activity',        'intelligence', 4, 'WHS, TMA, PFPA'],
  ['intelligence_office',     'Intelligence Office',           'intelligence', 4, 'OSI&A, OUSD(I&S) components'],

  // Acquisition
  ['systems_command',         'Systems Command',               'acquisition', 4,  'NAVSEA, NAVAIR, NAVWAR, MARCORSYSCOM, AMC'],
  ['portfolio_acq_exec',      'Portfolio Acquisition Executive','acquisition', 5,  'PAE — DoW portfolio-level acquisition authority'],
  ['capability_prog_exec',    'Capability Program Executive',  'acquisition', 6,  'CPE — programs within a PAE'],
  ['program_exec_office',     'Program Executive Office',      'acquisition', 5,  'Traditional PEO'],
  ['program_office',          'Program Office',                'acquisition', 6,  'PM-level offices and directorates within PEO/CPE'],
  ['contracting_command',     'Contracting Command',           'acquisition', 5,  'ACC, DCMA, contracting centers'],

  // Research & Innovation
  ['research_lab',            'Research Laboratory / Agency',  'research',    4,  'DARPA, ONR, AFRL, DEVCOM, NNSA'],
  ['innovation_unit',         'Innovation Unit',               'research',    5,  'DIU, AFWERX, AAL, Army Software Factory'],
  ['rapid_capabilities',      'Rapid Capabilities Office',     'research',    5,  'RCO / RCCTO offices'],

  // Support
  ['contracting_org',         'Contracting Organization',      'support',     5,  'Contracting offices and centers'],
  ['training_command',        'Training & Education Command',  'support',     5,  'TRADOC components, AETC, STARCOM'],
  ['office',                  'Office',                        'support',     9,  'Generic staff office'],
  ['directorate',             'Directorate',                   'support',     9,  'Staff directorate'],
];

// ── Relationship types ─────────────────────────────────────────────────────
const REL_TYPES = [
  // Command authority
  ['cocom',               'command',    'Combatant Command Authority (COCOM)',        true,  'has COCOM of',          'COCOM held by'],
  ['opcon',               'command',    'Operational Control (OPCON)',                true,  'has OPCON of',          'OPCON held by'],
  ['tacon',               'command',    'Tactical Control (TACON)',                   true,  'has TACON of',          'TACON held by'],
  ['adcon',               'command',    'Administrative Control (ADCON)',             true,  'has ADCON of',          'ADCON held by'],

  // Oversight
  ['policy_oversight',    'oversight',  'Policy / Programmatic Oversight',            true,  'has policy oversight of', 'is overseen by'],
  ['functional_authority','oversight',  'Functional Authority (CIO, CAO, etc.)',      true,  'has functional authority over', 'functional authority from'],
  ['budget_authority',    'oversight',  'Budget / Resource Sponsor Authority',        true,  'is resource sponsor for', 'resource sponsor is'],

  // Acquisition
  ['acq_authority',       'acquisition','Acquisition Authority',                      true,  'has acquisition authority over', 'acquisition authority from'],
  ['milestone_authority', 'acquisition','Milestone Decision Authority (MDA)',         true,  'is MDA for',            'MDA is'],

  // Reporting & admin
  ['reporting',           'reporting',  'Reporting Relationship',                     true,  'receives reports from', 'reports to'],
  ['supporting',          'support',    'Supporting / Supported Relationship',        false, 'supports',              'is supported by'],
  ['coordination',        'support',    'Coordination / Liaison Relationship',        false, 'coordinates with',      'coordinates with'],
];

// ── Parent ID + org type mapping for all 182 CSV orgs ─────────────────────
//   Format: [org_id, org_type_id, parent_id | null]
//
//   parent_id = the ADMINISTRATIVE parent only.
//   Oversight, OPCON, and acquisition chains belong in org_relationships.
const ORG_ASSIGNMENTS = [
  // ── DoW / OSD ────────────────────────────────────────────────────────────
  ['jcs',             'joint_staff',           'osw'],            // JCS reports to SecDef
  ['osw',             'department',             null],             // Top of DoW
  ['sapco',           'osd_office',             'osw'],
  ['cape',            'osd_office',             'osw'],
  ['dow_cio',         'osd_office',             'osw'],
  ['sco',             'osd_office',             'osw'],
  ['ousd_as',         'usd_office',             'osw'],
  ['asd_a',           'asd_office',             'ousd_as'],
  ['asd_s',           'asd_office',             'ousd_as'],
  ['asd_eie',         'asd_office',             'ousd_as'],
  ['asd_nd_cbd',      'asd_office',             'ousd_as'],
  ['asd_ibp',         'asd_office',             'ousd_as'],
  ['ousd_pr',         'usd_office',             'osw'],
  ['ousd_re',         'usd_office',             'osw'],
  ['cdao',            'osd_office',             'ousd_re'],
  ['darpa',           'research_lab',           'ousd_re'],
  ['mda',             'defense_agency',         'ousd_as'],       // MDA under A&S
  ['osc',             'osd_office',             'ousd_re'],
  ['edu',             'osd_office',             'ousd_as'],
  ['exim',            'osd_office',             'osw'],
  ['dfc',             'osd_office',             'osw'],
  ['diu',             'innovation_unit',        'ousd_re'],
  ['dot_e',           'osd_office',             'osw'],           // DOT&E direct to SecDef
  ['ousd_p',          'usd_office',             'osw'],
  ['osd_is',          'usd_office',             'osw'],
  ['disa',            'defense_agency',         'osd_is'],        // Admin: I&S; OPCON: SecDef
  ['dia',             'defense_agency',         'osd_is'],        // Policy oversight from OUSD(I&S)
  ['dcsa',            'defense_agency',         'ousd_as'],       // Under A&S
  ['dam',             'osd_office',             'osw'],
  ['whs',             'defense_field_activity', 'dam'],
  ['osc_vc',          'osd_office',             'ousd_re'],

  // ── Army ─────────────────────────────────────────────────────────────────
  ['army',            'military_department',    'osw'],
  ['army_hrc',        'office',                 'army'],
  ['army_rccto',      'rapid_capabilities',     'army'],
  ['usasmdc',         'major_command',          'army'],
  ['arcyber',         'major_command',          'army'],
  ['army_ng',         'office',                 'army'],

  // Army acquisition — PAE structure under ASA(ALT) which reports to Army SecArmy
  ['pae_maneuver_ground', 'portfolio_acq_exec', 'army'],
  ['cpe_maneuver_ground', 'capability_prog_exec','pae_maneuver_ground'],
  ['pae_maneuver_air',    'portfolio_acq_exec', 'army'],
  ['cpe_aviation',        'capability_prog_exec','pae_maneuver_air'],
  ['cpe_autonomy',        'capability_prog_exec','pae_maneuver_air'],
  ['pae_fires',           'portfolio_acq_exec', 'army'],
  ['cpe_offense',         'capability_prog_exec','pae_fires'],
  ['cpe_defensive',       'capability_prog_exec','pae_fires'],
  ['cpe_integrated_fires','capability_prog_exec','pae_fires'],
  ['pae_c2',              'portfolio_acq_exec', 'army'],
  ['cpe_c2in',            'capability_prog_exec','pae_c2'],
  ['cpe_st3',             'capability_prog_exec','pae_c2'],
  ['cpe_isw',             'capability_prog_exec','pae_c2'],
  ['pae_sustainment',     'portfolio_acq_exec', 'army'],
  ['cpe_combat_logistics','capability_prog_exec','pae_sustainment'],
  ['cpe_ammo',            'capability_prog_exec','pae_sustainment'],
  ['pae_cbrn',            'portfolio_acq_exec', 'army'],
  ['cpe_cbrnd',           'capability_prog_exec','pae_cbrn'],
  ['cpe_es2',             'capability_prog_exec','pae_cbrn'],

  // Army innovation & training
  ['aal',             'innovation_unit',        'army'],
  ['army_swf',        'innovation_unit',        'army'],
  ['t2com',           'training_command',       'army'],
  ['cac',             'major_command',          't2com'],
  ['devcom',          'research_lab',           't2com'],
  ['army_med_rd',     'research_lab',           't2com'],
  ['army_university', 'training_command',       'army'],

  // Army Materiel Command chain
  ['amc',             'major_command',          'army'],
  ['army_acc',        'contracting_command',    'amc'],
  ['amcom',           'major_command',          'amc'],
  ['cecom',           'major_command',          'amc'],
  ['jmc',             'major_command',          'amc'],
  ['asc',             'major_command',          'amc'],
  ['atec',            'major_command',          'amc'],
  ['tacom',           'major_command',          'amc'],
  ['usasac',          'major_command',          'amc'],

  // ── Navy ─────────────────────────────────────────────────────────────────
  ['secnav',          'military_department',    'osw'],
  ['navrco',          'rapid_capabilities',     'secnav'],
  ['opnav',           'service_hq',             'secnav'],
  ['usff',            'fleet_command',          'secnav'],
  ['uspacflt',        'fleet_command',          'secnav'],
  ['navifor',         'major_command',          'opnav'],
  ['cnaf',            'fleet_command',          'opnav'],
  ['onr',             'research_lab',           'secnav'],

  // Navy acquisition — PAE structure under ASN(RDA)
  ['pae_ras',         'portfolio_acq_exec',     'secnav'],
  ['pae_maritime',    'portfolio_acq_exec',     'secnav'],
  ['peo_carriers',    'program_exec_office',    'pae_maritime'],
  ['pae_munitions',   'portfolio_acq_exec',     'secnav'],
  ['peo_iws',         'program_exec_office',    'secnav'],
  ['pae_mission_sys', 'portfolio_acq_exec',     'secnav'],

  // Naval systems commands
  ['navsea',          'systems_command',        'secnav'],
  ['peo_ssn',         'program_exec_office',    'navsea'],
  ['peo_aukus',       'program_exec_office',    'navsea'],
  ['peo_usc',         'program_exec_office',    'navsea'],
  ['nnptc',           'training_command',       'navsea'],
  ['navair',          'systems_command',        'secnav'],
  ['nawcad',          'research_lab',           'navair'],
  ['nawcwd',          'research_lab',           'navair'],
  ['peo_a',           'program_exec_office',    'navair'],
  ['peo_t',           'program_exec_office',    'navair'],
  ['peo_uw',          'program_exec_office',    'navair'],
  ['peo_f35',         'program_exec_office',    'navair'],        // Joint program — admin under NAVAIR
  ['navwar',          'systems_command',        'secnav'],
  ['niwc_atlantic',   'research_lab',           'navwar'],
  ['niwc_pacific',    'research_lab',           'navwar'],
  ['peo_c4i',         'program_exec_office',    'navwar'],
  ['peo_digital',     'program_exec_office',    'navwar'],
  ['peo_mlb',         'program_exec_office',    'navwar'],
  ['navfac',          'systems_command',        'secnav'],
  ['navy_ssp',        'office',                 'secnav'],
  ['navy_nnpp',       'office',                 'secnav'],

  // ── Marine Corps ─────────────────────────────────────────────────────────
  ['usmc',            'military_department',    'secnav'],        // Admin under SecNav
  ['usmc_aviation',   'major_command',          'usmc'],
  ['usmc_training',   'training_command',       'usmc'],
  ['mccdc',           'major_command',          'usmc'],
  ['marcorsyscom',    'systems_command',        'usmc'],
  ['pae_usmc',        'portfolio_acq_exec',     'usmc'],
  ['marforres',       'major_command',          'usmc'],
  ['usmc_edcom',      'training_command',       'usmc'],
  ['usmc_recruiting', 'office',                 'usmc'],

  // ── Air Force ────────────────────────────────────────────────────────────
  ['af',              'military_department',    'osw'],
  ['af_academy',      'training_command',       'af'],
  ['aetc',            'major_command',          'af'],
  ['afmc',            'major_command',          'af'],
  ['afrco',           'rapid_capabilities',     'af'],
  ['sda',             'research_lab',           'ousd_re'],       // SDA reports to USD(R&E)
  ['af_acc',          'major_command',          'af'],
  ['af_sustainment',  'major_command',          'afmc'],
  ['aflcmc',          'systems_command',        'afmc'],
  ['aflcmc_c3bm',     'program_exec_office',    'aflcmc'],
  ['aflcmc_eb',       'program_exec_office',    'aflcmc'],
  ['aflcmc_bes',      'program_exec_office',    'aflcmc'],
  ['aflcmc_hb',       'program_exec_office',    'aflcmc'],
  ['aflcmc_hn',       'program_exec_office',    'aflcmc'],
  ['aflcmc_pb',       'program_exec_office',    'aflcmc'],
  ['aflcmc_wa',       'program_exec_office',    'aflcmc'],
  ['aflcmc_wb',       'program_exec_office',    'aflcmc'],
  ['aflcmc_wi',       'program_exec_office',    'aflcmc'],
  ['aflcmc_wl',       'program_exec_office',    'aflcmc'],
  ['aflcmc_wn',       'program_exec_office',    'aflcmc'],
  ['aflcmc_jsf',      'program_exec_office',    'aflcmc'],        // Joint — admin under AFLCMC
  ['aflcmc_afsac',    'office',                 'aflcmc'],
  ['afnwc',           'major_command',          'afmc'],
  ['afnwc_nad',       'program_exec_office',    'afnwc'],
  ['afnwc_icbm',      'program_exec_office',    'afnwc'],
  ['afnwc_nc3',       'program_exec_office',    'afnwc'],
  ['afnwc_nti',       'research_lab',           'afnwc'],
  ['afrl',            'research_lab',           'afmc'],

  // ── Space Force ──────────────────────────────────────────────────────────
  ['ussf',            'military_department',    'af'],            // Admin under SecAF
  ['spoc',            'major_command',          'ussf'],
  ['ssc',             'systems_command',        'ussf'],
  ['starcom',         'training_command',       'ussf'],
  ['pae_sensing',     'portfolio_acq_exec',     'ssc'],
  ['pae_aats',        'portfolio_acq_exec',     'ssc'],
  ['pae_cp',          'portfolio_acq_exec',     'ssc'],
  ['pae_bmc3i',       'portfolio_acq_exec',     'ssc'],
  ['peo_mcpnt',       'program_exec_office',    'ssc'],
  ['peo_otti',        'program_exec_office',    'ssc'],
  ['sf_rco',          'rapid_capabilities',     'ussf'],

  // ── SOCOM ─────────────────────────────────────────────────────────────────
  ['socom',           'unified_command',        'osw'],           // Directly under SecDef
  ['socom_jsu',       'training_command',       'socom'],
  ['socom_atl',       'office',                 'socom'],
  ['socom_dir_eis',   'office',                 'socom'],
  ['socom_peo_fw',    'program_exec_office',    'socom'],
  ['socom_peo_m',     'program_exec_office',    'socom'],
  ['socom_peo_rw',    'program_exec_office',    'socom'],
  ['socom_peo_sda',   'program_exec_office',    'socom'],
  ['socom_peo_sofsa', 'program_exec_office',    'socom'],
  ['socom_peo_sw',    'program_exec_office',    'socom'],
  ['socom_peo_tis',   'program_exec_office',    'socom'],
  ['jsoc',            'sub_unified_command',    'socom'],
  ['seals',           'special_ops_command',    'socom'],
  ['arsoc',           'special_ops_command',    'socom'],
  ['afsoc',           'special_ops_command',    'socom'],
  ['marsoc',          'special_ops_command',    'socom'],

  // ── Combatant Commands ────────────────────────────────────────────────────
  // COCOM authority from SecDef; admin (ADCON) from respective service
  ['indopacom',       'unified_command',        'osw'],
  ['centcom',         'unified_command',        'osw'],
  ['eucom',           'unified_command',        'osw'],
  ['southcom',        'unified_command',        'osw'],
  ['northcom',        'unified_command',        'osw'],
  ['africom',         'unified_command',        'osw'],
  ['stratcom',        'unified_command',        'osw'],
  ['spacecom',        'unified_command',        'osw'],
  ['transcom',        'unified_command',        'osw'],
  ['amc_transcom',    'major_command',          'transcom'],
  ['cybercom',        'unified_command',        'osw'],           // Dual-hatted with NSA

  // ── Other (OSC VC was already mapped above as osc_vc) ───────────────────
];

// ── Oversight relationships to seed ────────────────────────────────────────
//   These are NOT parent_id relationships — they're separate authority links.
//   Format: [from_org_id, to_org_id, rel_type_id, authority_level?, notes?]
const ORG_RELATIONSHIPS = [
  // OUSD(I&S) has policy oversight of defense intelligence agencies
  ['osd_is', 'dia',   'policy_oversight', null, 'OUSD(I&S) oversees DIA per DoD Directive 5143.01'],
  ['osd_is', 'disa',  'policy_oversight', null, 'OUSD(I&S) oversees DISA cybersecurity policy'],
  ['osd_is', 'dcsa',  'policy_oversight', null, 'OUSD(I&S) oversees DCSA counterintelligence'],

  // OUSD(A&S) acquisition authority
  ['ousd_as', 'pae_maneuver_ground', 'acq_authority', 'SAE', null],
  ['ousd_as', 'pae_maneuver_air',    'acq_authority', 'SAE', null],
  ['ousd_as', 'pae_fires',           'acq_authority', 'SAE', null],
  ['ousd_as', 'pae_c2',              'acq_authority', 'SAE', null],
  ['ousd_as', 'pae_sustainment',     'acq_authority', 'SAE', null],
  ['ousd_as', 'pae_cbrn',            'acq_authority', 'SAE', null],
  ['ousd_as', 'pae_ras',             'acq_authority', 'SAE', null],
  ['ousd_as', 'pae_maritime',        'acq_authority', 'SAE', null],
  ['ousd_as', 'pae_mission_sys',     'acq_authority', 'SAE', null],
  ['ousd_as', 'socom_peo_fw',        'acq_authority', 'SAE', null],

  // CDAO functional authority over AI/data across DoD
  ['cdao', 'dia',  'functional_authority', null, 'CDAO data standards authority'],
  ['cdao', 'disa', 'functional_authority', null, 'CDAO data/AI standards authority'],

  // COCOM chains — SecDef → CCMD → component commands
  ['indopacom', 'uspacflt', 'opcon', null, 'PACFLT is naval component of INDOPACOM'],
  ['centcom',   'navcent',  'opcon', null, null],
  ['transcom',  'amc_transcom', 'opcon', null, null],

  // JSF program — joint milestone authority
  ['ousd_as', 'peo_f35',  'milestone_authority', 'MDA', 'OUSD(A&S) is MDA for F-35'],
  ['ousd_as', 'aflcmc_jsf','acq_authority', 'PEO', null],

  // Cybercom dual-hat with NSA (operational relationship)
  ['cybercom', 'afcyber', 'opcon', null, '16 AF is AFCYBER service component'],
];

export default async (req) => {
  const url = new URL(req.url);
  if (url.searchParams.get('token') !== Netlify.env.get('SAM_SYNC_TOKEN'))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDatabase();
  const dry = url.searchParams.get('dry') === '1';

  if (dry) {
    return Response.json({
      org_types: ORG_TYPES.length,
      rel_types: REL_TYPES.length,
      org_assignments: ORG_ASSIGNMENTS.length,
      org_relationships: ORG_RELATIONSHIPS.length,
    });
  }

  let typesSeeded = 0, relTypesSeeded = 0, orgsUpdated = 0, relsSeeded = 0;
  const errs = [];

  // 1. Seed org types
  for (const [id, name, category, sort_order, description] of ORG_TYPES) {
    try {
      await db.sql`
        INSERT INTO org_types (id, name, category, sort_order, description)
        VALUES (${id}, ${name}, ${category}, ${sort_order}, ${description})
        ON CONFLICT (id) DO UPDATE SET
          name=EXCLUDED.name, category=EXCLUDED.category,
          sort_order=EXCLUDED.sort_order, description=EXCLUDED.description
      `;
      typesSeeded++;
    } catch(e) { errs.push('type:' + id + ':' + e.message.slice(0, 80)); }
  }

  // 2. Seed relationship types
  for (const [id, category, description, is_directional, label_from, label_to] of REL_TYPES) {
    try {
      await db.sql`
        INSERT INTO org_rel_types (id, name, category, description, is_directional, label_from, label_to)
        VALUES (${id}, ${id}, ${category}, ${description}, ${is_directional}, ${label_from}, ${label_to})
        ON CONFLICT (id) DO UPDATE SET
          category=EXCLUDED.category, description=EXCLUDED.description,
          is_directional=EXCLUDED.is_directional,
          label_from=EXCLUDED.label_from, label_to=EXCLUDED.label_to
      `;
      relTypesSeeded++;
    } catch(e) { errs.push('reltype:' + id + ':' + e.message.slice(0, 80)); }
  }

  // 3. Set org_type_id + parent_id on each org
  for (const [org_id, org_type_id, parent_id] of ORG_ASSIGNMENTS) {
    try {
      await db.sql`
        UPDATE orgs
        SET org_type_id = ${org_type_id}, parent_id = ${parent_id}
        WHERE id = ${org_id}
      `;
      orgsUpdated++;
    } catch(e) { errs.push('org:' + org_id + ':' + e.message.slice(0, 80)); }
  }

  // 4. Seed org relationships
  for (const [from_id, to_id, rel_type, auth_level, notes] of ORG_RELATIONSHIPS) {
    try {
      await db.sql`
        INSERT INTO org_relationships (from_org_id, to_org_id, rel_type_id, authority_level, notes)
        VALUES (${from_id}, ${to_id}, ${rel_type}, ${auth_level}, ${notes})
        ON CONFLICT (from_org_id, to_org_id, rel_type_id) DO UPDATE SET
          authority_level=EXCLUDED.authority_level, notes=EXCLUDED.notes
      `;
      relsSeeded++;
    } catch(e) { errs.push('rel:' + from_id + '→' + to_id + ':' + e.message.slice(0, 60)); }
  }

  return Response.json({
    org_types_seeded: typesSeeded,
    rel_types_seeded: relTypesSeeded,
    orgs_updated: orgsUpdated,
    relationships_seeded: relsSeeded,
    errors: errs.slice(0, 20),
  });
};

export const config = { path: '/api/seed-org-metadata' };

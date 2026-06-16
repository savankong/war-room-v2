-- Migration 016: DoW/DoD Org Structure (Jan 2026)
-- Reflects EO 14347 (Sept 5 2025), CDAO realignment (Aug 15 2025),
-- Innovation Ecosystem Reorg (Jan 9 2026), DIU/SCO Field Activity (Jan 14 2026)
-- Hierarchy: branch → sub → major → subtier

-- ── Ensure org_types rows exist ──────────────────────────────────────────────

INSERT INTO org_types (id, name, category, sort_order) VALUES
  ('civilian',       'Civilian Office',           'civilian',      1),
  ('military',       'Military Department',        'military',      2),
  ('acquisition',    'Acquisition & Sustainment',  'acquisition',   3),
  ('operational',    'Combatant Command',          'operational',   4),
  ('intelligence',   'Intelligence Agency',        'intelligence',  5),
  ('research',       'Research & Innovation',      'research',      6),
  ('support',        'Defense Support Agency',     'support',       7),
  ('field_activity', 'DoD Field Activity',         'support',       8)
ON CONFLICT (id) DO UPDATE SET
  name       = EXCLUDED.name,
  category   = EXCLUDED.category,
  sort_order = EXCLUDED.sort_order;

-- ── BRANCH ───────────────────────────────────────────────────────────────────

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, org_type_id, is_active, description) VALUES
  ('dod',
   'Department of Defense',
   'DoD',
   'Department of Defense',
   NULL, NULL, NULL,
   'civilian', true,
   'United States Department of Defense. Secondary name "Department of War" authorized under EO 14347 (Sept 5, 2025) for non-statutory/ceremonial use.')
ON CONFLICT (id) DO UPDATE SET
  full_name    = EXCLUDED.full_name,
  abbreviation = EXCLUDED.abbreviation,
  branch       = EXCLUDED.branch,
  org_type_id  = EXCLUDED.org_type_id,
  description  = EXCLUDED.description,
  is_active    = EXCLUDED.is_active;

-- ── SUB: Office of the Secretary of Defense ──────────────────────────────────

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, org_type_id, is_active) VALUES
  ('osd',
   'Office of the Secretary of Defense',
   'OSD',
   'Department of Defense',
   'Office of the Secretary of Defense',
   NULL, NULL,
   'dod', 'civilian', true)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name, abbreviation = EXCLUDED.abbreviation,
  branch = EXCLUDED.branch, sub = EXCLUDED.sub, parent_id = EXCLUDED.parent_id,
  org_type_id = EXCLUDED.org_type_id, is_active = EXCLUDED.is_active;

-- MAJOR: Office of the Secretary of Defense (principal)
INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, org_type_id, is_active, description) VALUES
  ('secdef',
   'Office of the Secretary of Defense',
   'SecDef',
   'Department of Defense',
   'Office of the Secretary of Defense',
   'Office of the Secretary of Defense',
   NULL,
   'osd', 'civilian', true,
   'Secretary of Defense: Pete Hegseth. Deputy Secretary: Steve Feinberg (secondary title "Deputy Secretary of War" per EO 14347).')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name, branch = EXCLUDED.branch, sub = EXCLUDED.sub,
  major = EXCLUDED.major, parent_id = EXCLUDED.parent_id, description = EXCLUDED.description,
  org_type_id = EXCLUDED.org_type_id, is_active = EXCLUDED.is_active;

-- MAJOR: USD Research & Engineering / CTO
INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, org_type_id, is_active, description) VALUES
  ('usd-re',
   'Under Secretary of Defense for Research and Engineering',
   'USD(R&E)',
   'Department of Defense',
   'Office of the Secretary of Defense',
   'Under Secretary of Defense for Research and Engineering',
   NULL,
   'osd', 'civilian', true,
   'Also serves as DoD Chief Technology Officer. Incumbent: Emil Michael (since May 20, 2025). Per Jan 9 2026 SecDef memo, has unified authority over the full DoW innovation ecosystem (DARPA, CDAO, DIU, SCO, OSC, TRMC, MEIA). Previous three-body oversight structure dissolved; replaced by single CTO Action Group.')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name, abbreviation = EXCLUDED.abbreviation,
  branch = EXCLUDED.branch, sub = EXCLUDED.sub, major = EXCLUDED.major,
  parent_id = EXCLUDED.parent_id, description = EXCLUDED.description,
  org_type_id = EXCLUDED.org_type_id, is_active = EXCLUDED.is_active;

-- SUBTIER: Innovation Ecosystem under USD(R&E)
INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, org_type_id, is_active, description) VALUES
  ('darpa',
   'Defense Advanced Research Projects Agency',
   'DARPA',
   'Department of Defense',
   'Office of the Secretary of Defense',
   'Under Secretary of Defense for Research and Engineering',
   'DARPA',
   'usd-re', 'research', true,
   'Breakthrough and foundational R&D. Reports to USD(R&E) under Jan 9 2026 innovation ecosystem reorg.'),

  ('cdao',
   'Chief Digital and Artificial Intelligence Office',
   'CDAO',
   'Department of Defense',
   'Office of the Secretary of Defense',
   'Under Secretary of Defense for Research and Engineering',
   'CDAO',
   'usd-re', 'research', true,
   'Realigned from Deputy SecDef direct-report to USD(R&E) effective Aug 15 2025 (Deputy SecDef memo Aug 14 2025). Incumbent: Cameron Stanley (appointed Jan 2026). Responsible for AI strategy, Advana, Maven Smart System.'),

  ('diu',
   'Defense Innovation Unit',
   'DIU',
   'Department of Defense',
   'Office of the Secretary of Defense',
   'Under Secretary of Defense for Research and Engineering',
   'DIU',
   'usd-re', 'field_activity', true,
   'Designated DoW Field Activity Jan 14 2026. Director: Owen West. Commercial and dual-use technology adoption; front door for production-ready commercial products. Also listed under Defense Agencies & DoD Field Activities (canonical: this record).'),

  ('sco',
   'Strategic Capabilities Office',
   'SCO',
   'Department of Defense',
   'Office of the Secretary of Defense',
   'Under Secretary of Defense for Research and Engineering',
   'SCO',
   'usd-re', 'field_activity', true,
   'Designated DoW Field Activity Jan 14 2026. Retains statutory reporting to Deputy SecDef but operates under CTO coordination. Develops operational concepts combining existing systems.'),

  ('osc',
   'Office of Strategic Capital',
   'OSC',
   'Department of Defense',
   'Office of the Secretary of Defense',
   'Under Secretary of Defense for Research and Engineering',
   'OSC',
   'usd-re', 'civilian', true,
   'Strategic investment and financing tools. Under USD(R&E) innovation ecosystem.'),

  ('trmc',
   'Test Resource Management Center',
   'TRMC',
   'Department of Defense',
   'Office of the Secretary of Defense',
   'Under Secretary of Defense for Research and Engineering',
   'TRMC',
   'usd-re', 'support', true,
   'Test and evaluation resources. Under USD(R&E) innovation ecosystem.'),

  ('meia',
   'Mission Engineering and Integration Activity',
   'MEIA',
   'Department of Defense',
   'Office of the Secretary of Defense',
   'Under Secretary of Defense for Research and Engineering',
   'MEIA',
   'usd-re', 'research', true,
   'Created Aug 2025. Mission engineering and problem intake. Industry engagement: problems → MEIA, products → DIU.'),

  ('asd-st',
   'Assistant Secretary of Defense for Science and Technology',
   'ASD(S&T)',
   'Department of Defense',
   'Office of the Secretary of Defense',
   'Under Secretary of Defense for Research and Engineering',
   'ASD(S&T)',
   'usd-re', 'civilian', true,
   'Technology innovation and foundational science. Established Jan 9 2026 USD(R&E) internal restructure.'),

  ('asd-ct',
   'Assistant Secretary of Defense for Commercial Technologies',
   'ASD(CT)',
   'Department of Defense',
   'Office of the Secretary of Defense',
   'Under Secretary of Defense for Research and Engineering',
   'ASD(CT)',
   'usd-re', 'civilian', true,
   'Commercial adoption policy. Redesignated from Critical Technologies. Established Jan 9 2026 USD(R&E) internal restructure.'),

  ('asd-mc',
   'Assistant Secretary of Defense for Mission Capabilities',
   'ASD(MC)',
   'Department of Defense',
   'Office of the Secretary of Defense',
   'Under Secretary of Defense for Research and Engineering',
   'ASD(MC)',
   'usd-re', 'civilian', true,
   'Operational capability innovation. Established Jan 9 2026 USD(R&E) internal restructure.')

ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name, abbreviation = EXCLUDED.abbreviation,
  branch = EXCLUDED.branch, sub = EXCLUDED.sub, major = EXCLUDED.major,
  subtier = EXCLUDED.subtier, parent_id = EXCLUDED.parent_id,
  description = EXCLUDED.description, org_type_id = EXCLUDED.org_type_id,
  is_active = EXCLUDED.is_active;

-- MAJOR: USD Acquisition & Sustainment
INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, org_type_id, is_active, description) VALUES
  ('usd-as',
   'Under Secretary of Defense for Acquisition and Sustainment',
   'USD(A&S)',
   'Department of Defense',
   'Office of the Secretary of Defense',
   'Under Secretary of Defense for Acquisition and Sustainment',
   NULL,
   'osd', 'acquisition', true,
   'Defense procurement, contracting policy, sustainment. Oversight of major defense acquisition programs.')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name, abbreviation = EXCLUDED.abbreviation,
  branch = EXCLUDED.branch, sub = EXCLUDED.sub, major = EXCLUDED.major,
  parent_id = EXCLUDED.parent_id, description = EXCLUDED.description,
  org_type_id = EXCLUDED.org_type_id, is_active = EXCLUDED.is_active;

-- MAJOR: USD Personnel & Readiness
INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, org_type_id, is_active, description) VALUES
  ('usd-pr',
   'Under Secretary of Defense for Personnel and Readiness',
   'USD(P&R)',
   'Department of Defense',
   'Office of the Secretary of Defense',
   'Under Secretary of Defense for Personnel and Readiness',
   NULL,
   'osd', 'civilian', true,
   'Incumbent: Anthony Tata (since Jul 18 2025). Personnel, readiness, health, education policy.')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name, abbreviation = EXCLUDED.abbreviation,
  branch = EXCLUDED.branch, sub = EXCLUDED.sub, major = EXCLUDED.major,
  parent_id = EXCLUDED.parent_id, description = EXCLUDED.description,
  org_type_id = EXCLUDED.org_type_id, is_active = EXCLUDED.is_active;

-- MAJOR: USD Comptroller / CFO
INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, org_type_id, is_active, description) VALUES
  ('usd-c',
   'Under Secretary of Defense (Comptroller) / Chief Financial Officer',
   'USD(C)',
   'Department of Defense',
   'Office of the Secretary of Defense',
   'Under Secretary of Defense (Comptroller) / CFO',
   NULL,
   'osd', 'civilian', true,
   'Budget, financial management, Future Years Defense Program (FYDP).')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name, abbreviation = EXCLUDED.abbreviation,
  branch = EXCLUDED.branch, sub = EXCLUDED.sub, major = EXCLUDED.major,
  parent_id = EXCLUDED.parent_id, description = EXCLUDED.description,
  org_type_id = EXCLUDED.org_type_id, is_active = EXCLUDED.is_active;

-- MAJOR: USD Intelligence & Security
INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, org_type_id, is_active, description) VALUES
  ('usd-is',
   'Under Secretary of Defense for Intelligence and Security',
   'USD(I&S)',
   'Department of Defense',
   'Office of the Secretary of Defense',
   'Under Secretary of Defense for Intelligence and Security',
   NULL,
   'osd', 'intelligence', true,
   'Intelligence oversight and security policy.')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name, abbreviation = EXCLUDED.abbreviation,
  branch = EXCLUDED.branch, sub = EXCLUDED.sub, major = EXCLUDED.major,
  parent_id = EXCLUDED.parent_id, description = EXCLUDED.description,
  org_type_id = EXCLUDED.org_type_id, is_active = EXCLUDED.is_active;

-- MAJOR: Joint Chiefs of Staff
INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, org_type_id, is_active, description) VALUES
  ('jcs',
   'Joint Chiefs of Staff',
   'JCS',
   'Department of Defense',
   'Office of the Secretary of Defense',
   'Joint Chiefs of Staff',
   NULL,
   'osd', 'military', true,
   'Chairman (CJCS) — advisory to SecDef; not in chain of command. VCJCS, and Service Chiefs: CSA (Army), CNO (Navy), CMC (Marines), CSAF (Air Force), CSO (Space Force), CSNG (National Guard).')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name, abbreviation = EXCLUDED.abbreviation,
  branch = EXCLUDED.branch, sub = EXCLUDED.sub, major = EXCLUDED.major,
  parent_id = EXCLUDED.parent_id, description = EXCLUDED.description,
  org_type_id = EXCLUDED.org_type_id, is_active = EXCLUDED.is_active;

-- ── SUB: Military Departments ─────────────────────────────────────────────────

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, org_type_id, is_active) VALUES
  ('mil-depts',
   'Military Departments',
   NULL,
   'Department of Defense',
   'Military Departments',
   NULL, NULL,
   'dod', 'military', true)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name, branch = EXCLUDED.branch, sub = EXCLUDED.sub,
  parent_id = EXCLUDED.parent_id, org_type_id = EXCLUDED.org_type_id, is_active = EXCLUDED.is_active;

-- MAJOR: Department of the Army
INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, org_type_id, is_active, description) VALUES
  ('army',
   'Department of the Army',
   'Army',
   'Army',
   'Military Departments',
   'Department of the Army',
   NULL,
   'mil-depts', 'military', true,
   'Secretary of the Army (SecArmy), Chief of Staff of the Army (CSA). Subtiers: HQDA, FORSCOM, TRADOC, AMC, USARPAC, USAREUR-AF, ARNORTH, ARSOUTH, USACC, USARC.')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name, abbreviation = EXCLUDED.abbreviation,
  branch = EXCLUDED.branch, sub = EXCLUDED.sub, major = EXCLUDED.major,
  parent_id = EXCLUDED.parent_id, description = EXCLUDED.description,
  org_type_id = EXCLUDED.org_type_id, is_active = EXCLUDED.is_active;

-- Army subtiers
INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, org_type_id, is_active) VALUES
  ('hqda',       'Headquarters, Department of the Army',              'HQDA',       'Army', 'Military Departments', 'Department of the Army', 'HQDA',       'army', 'military',     true),
  ('forscom',    'U.S. Army Forces Command',                          'FORSCOM',    'Army', 'Military Departments', 'Department of the Army', 'FORSCOM',    'army', 'military',     true),
  ('tradoc',     'U.S. Army Training and Doctrine Command',           'TRADOC',     'Army', 'Military Departments', 'Department of the Army', 'TRADOC',     'army', 'military',     true),
  ('amc-army',   'U.S. Army Materiel Command',                        'AMC',        'Army', 'Military Departments', 'Department of the Army', 'AMC',        'army', 'acquisition',  true),
  ('usarpac',    'U.S. Army Pacific',                                 'USARPAC',    'Army', 'Military Departments', 'Department of the Army', 'USARPAC',    'army', 'operational',  true),
  ('usareur',    'U.S. Army Europe and Africa',                       'USAREUR-AF', 'Army', 'Military Departments', 'Department of the Army', 'USAREUR-AF', 'army', 'operational',  true),
  ('arnorth',    'U.S. Army North',                                   'ARNORTH',    'Army', 'Military Departments', 'Department of the Army', 'ARNORTH',    'army', 'operational',  true),
  ('arsouth',    'U.S. Army South',                                   'ARSOUTH',    'Army', 'Military Departments', 'Department of the Army', 'ARSOUTH',    'army', 'operational',  true),
  ('usacc',      'U.S. Army Contracting Command',                     'USACC',      'Army', 'Military Departments', 'Department of the Army', 'USACC',      'army', 'acquisition',  true),
  ('usarc',      'U.S. Army Reserve Command',                         'USARC',      'Army', 'Military Departments', 'Department of the Army', 'USARC',      'army', 'military',     true)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name, abbreviation = EXCLUDED.abbreviation,
  branch = EXCLUDED.branch, sub = EXCLUDED.sub, major = EXCLUDED.major,
  subtier = EXCLUDED.subtier, parent_id = EXCLUDED.parent_id,
  org_type_id = EXCLUDED.org_type_id, is_active = EXCLUDED.is_active;

-- MAJOR: Department of the Navy
INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, org_type_id, is_active, description) VALUES
  ('navy',
   'Department of the Navy',
   'Navy',
   'Navy',
   'Military Departments',
   'Department of the Navy',
   NULL,
   'mil-depts', 'military', true,
   'Secretary of the Navy (SecNav), Chief of Naval Operations (CNO), Commandant of the Marine Corps (CMC). Subtiers: OPNAV, HQMC, USFFC, USPACFLT.')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name, abbreviation = EXCLUDED.abbreviation,
  branch = EXCLUDED.branch, sub = EXCLUDED.sub, major = EXCLUDED.major,
  parent_id = EXCLUDED.parent_id, description = EXCLUDED.description,
  org_type_id = EXCLUDED.org_type_id, is_active = EXCLUDED.is_active;

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, org_type_id, is_active) VALUES
  ('opnav',    'Office of the Chief of Naval Operations', 'OPNAV',    'Navy', 'Military Departments', 'Department of the Navy', 'OPNAV',    'navy', 'military',    true),
  ('hqmc',     'Headquarters, Marine Corps',              'HQMC',     'Navy', 'Military Departments', 'Department of the Navy', 'HQMC',     'navy', 'military',    true),
  ('usffc',    'U.S. Fleet Forces Command',               'USFFC',    'Navy', 'Military Departments', 'Department of the Navy', 'USFFC',    'navy', 'operational', true),
  ('uspacflt', 'U.S. Pacific Fleet',                      'USPACFLT', 'Navy', 'Military Departments', 'Department of the Navy', 'USPACFLT', 'navy', 'operational', true)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name, abbreviation = EXCLUDED.abbreviation,
  branch = EXCLUDED.branch, sub = EXCLUDED.sub, major = EXCLUDED.major,
  subtier = EXCLUDED.subtier, parent_id = EXCLUDED.parent_id,
  org_type_id = EXCLUDED.org_type_id, is_active = EXCLUDED.is_active;

-- MAJOR: Department of the Air Force (includes Space Force)
INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, org_type_id, is_active, description) VALUES
  ('af',
   'Department of the Air Force',
   'AF',
   'Air Force',
   'Military Departments',
   'Department of the Air Force',
   NULL,
   'mil-depts', 'military', true,
   'Secretary of the Air Force (SecAF), Chief of Staff of the Air Force (CSAF), Chief of Space Operations (CSO — Space Force). Subtiers: HAF, SF HQ, ACC, AMC, AFSOC, AETC, AFGSC, AFMC, AFRC, ANG.')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name, abbreviation = EXCLUDED.abbreviation,
  branch = EXCLUDED.branch, sub = EXCLUDED.sub, major = EXCLUDED.major,
  parent_id = EXCLUDED.parent_id, description = EXCLUDED.description,
  org_type_id = EXCLUDED.org_type_id, is_active = EXCLUDED.is_active;

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, org_type_id, is_active) VALUES
  ('haf',         'Headquarters Air Force',                  'HAF',         'Air Force',   'Military Departments', 'Department of the Air Force', 'HAF',         'af', 'military',    true),
  ('sf-hq',       'Headquarters Space Force',                'SF HQ',       'Space Force', 'Military Departments', 'Department of the Air Force', 'SF HQ',       'af', 'military',    true),
  ('acc',         'Air Combat Command',                      'ACC',         'Air Force',   'Military Departments', 'Department of the Air Force', 'ACC',         'af', 'operational', true),
  ('amc-af',      'Air Mobility Command',                    'AMC',         'Air Force',   'Military Departments', 'Department of the Air Force', 'AMC',         'af', 'operational', true),
  ('afsoc',       'Air Force Special Operations Command',    'AFSOC',       'Air Force',   'Military Departments', 'Department of the Air Force', 'AFSOC',       'af', 'operational', true),
  ('aetc',        'Air Education and Training Command',      'AETC',        'Air Force',   'Military Departments', 'Department of the Air Force', 'AETC',        'af', 'military',    true),
  ('afgsc',       'Air Force Global Strike Command',         'AFGSC',       'Air Force',   'Military Departments', 'Department of the Air Force', 'AFGSC',       'af', 'operational', true),
  ('afmc',        'Air Force Materiel Command',              'AFMC',        'Air Force',   'Military Departments', 'Department of the Air Force', 'AFMC',        'af', 'acquisition', true),
  ('afrc',        'Air Force Reserve Command',               'AFRC',        'Air Force',   'Military Departments', 'Department of the Air Force', 'AFRC',        'af', 'military',    true),
  ('ang',         'Air National Guard',                      'ANG',         'Air Force',   'Military Departments', 'Department of the Air Force', 'ANG',         'af', 'military',    true)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name, abbreviation = EXCLUDED.abbreviation,
  branch = EXCLUDED.branch, sub = EXCLUDED.sub, major = EXCLUDED.major,
  subtier = EXCLUDED.subtier, parent_id = EXCLUDED.parent_id,
  org_type_id = EXCLUDED.org_type_id, is_active = EXCLUDED.is_active;

-- ── SUB: Combatant Commands ───────────────────────────────────────────────────

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, org_type_id, is_active, description) VALUES
  ('ccmds',
   'Combatant Commands',
   'CCMDs',
   'Department of Defense',
   'Combatant Commands',
   NULL, NULL,
   'dod', 'operational', true,
   'Report to SecDef via CJCS; Title 10 chain of command.')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name, branch = EXCLUDED.branch, sub = EXCLUDED.sub,
  parent_id = EXCLUDED.parent_id, org_type_id = EXCLUDED.org_type_id, is_active = EXCLUDED.is_active;

-- Geographic CCMDs
INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, org_type_id, is_active, description) VALUES
  ('usindopacom', 'U.S. Indo-Pacific Command',      'USINDOPACOM', 'Department of Defense', 'Combatant Commands', 'Geographic Combatant Commands', 'USINDOPACOM', 'ccmds', 'operational', true, 'Indo-Pacific region.'),
  ('useucom',     'U.S. European Command',           'USEUCOM',     'Department of Defense', 'Combatant Commands', 'Geographic Combatant Commands', 'USEUCOM',     'ccmds', 'operational', true, 'Europe region.'),
  ('uscentcom',   'U.S. Central Command',            'USCENTCOM',   'Department of Defense', 'Combatant Commands', 'Geographic Combatant Commands', 'USCENTCOM',   'ccmds', 'operational', true, 'Middle East / Central Asia.'),
  ('usnorthcom',  'U.S. Northern Command',           'USNORTHCOM',  'Department of Defense', 'Combatant Commands', 'Geographic Combatant Commands', 'USNORTHCOM',  'ccmds', 'operational', true, 'North America; dual-hat with NORAD.'),
  ('ussouthcom',  'U.S. Southern Command',           'USSOUTHCOM',  'Department of Defense', 'Combatant Commands', 'Geographic Combatant Commands', 'USSOUTHCOM',  'ccmds', 'operational', true, 'Latin America.'),
  ('usafricom',   'U.S. Africa Command',             'USAFRICOM',   'Department of Defense', 'Combatant Commands', 'Geographic Combatant Commands', 'USAFRICOM',   'ccmds', 'operational', true, 'Africa region.')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name, abbreviation = EXCLUDED.abbreviation,
  branch = EXCLUDED.branch, sub = EXCLUDED.sub, major = EXCLUDED.major,
  subtier = EXCLUDED.subtier, parent_id = EXCLUDED.parent_id,
  description = EXCLUDED.description, org_type_id = EXCLUDED.org_type_id,
  is_active = EXCLUDED.is_active;

-- Functional CCMDs
INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, org_type_id, is_active, description) VALUES
  ('ussocom',    'U.S. Special Operations Command',   'USSOCOM',    'Department of Defense', 'Combatant Commands', 'Functional Combatant Commands', 'USSOCOM',    'ccmds', 'operational', true, 'Special Operations.'),
  ('usstratcom', 'U.S. Strategic Command',            'USSTRATCOM', 'Department of Defense', 'Combatant Commands', 'Functional Combatant Commands', 'USSTRATCOM', 'ccmds', 'operational', true, 'Nuclear / Strategic Deterrence.'),
  ('ustranscom', 'U.S. Transportation Command',       'USTRANSCOM', 'Department of Defense', 'Combatant Commands', 'Functional Combatant Commands', 'USTRANSCOM', 'ccmds', 'operational', true, 'Global Strategic Transport.'),
  ('uscybercom', 'U.S. Cyber Command',                'USCYBERCOM', 'Department of Defense', 'Combatant Commands', 'Functional Combatant Commands', 'USCYBERCOM', 'ccmds', 'operational', true, 'Cyber Operations; dual-hat with NSA Director.'),
  ('usspacecom', 'U.S. Space Command',                'USSPACECOM', 'Department of Defense', 'Combatant Commands', 'Functional Combatant Commands', 'USSPACECOM', 'ccmds', 'operational', true, 'Space Operations.')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name, abbreviation = EXCLUDED.abbreviation,
  branch = EXCLUDED.branch, sub = EXCLUDED.sub, major = EXCLUDED.major,
  subtier = EXCLUDED.subtier, parent_id = EXCLUDED.parent_id,
  description = EXCLUDED.description, org_type_id = EXCLUDED.org_type_id,
  is_active = EXCLUDED.is_active;

-- ── SUB: Defense Agencies & DoD Field Activities ─────────────────────────────

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, org_type_id, is_active) VALUES
  ('defense-agencies',
   'Defense Agencies and DoD Field Activities',
   NULL,
   'Department of Defense',
   'Defense Agencies and DoD Field Activities',
   NULL, NULL,
   'dod', 'support', true)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name, branch = EXCLUDED.branch, sub = EXCLUDED.sub,
  parent_id = EXCLUDED.parent_id, org_type_id = EXCLUDED.org_type_id, is_active = EXCLUDED.is_active;

-- Defense Agencies
INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, org_type_id, is_active, description) VALUES
  ('disa',  'Defense Information Systems Agency',        'DISA',  'Department of Defense', 'Defense Agencies and DoD Field Activities', 'Defense Agencies', 'DISA',  'defense-agencies', 'support',       true, 'IT infrastructure, DODIN.'),
  ('dia',   'Defense Intelligence Agency',               'DIA',   'Department of Defense', 'Defense Agencies and DoD Field Activities', 'Defense Agencies', 'DIA',   'defense-agencies', 'intelligence',  true, 'All-source intelligence.'),
  ('dla',   'Defense Logistics Agency',                  'DLA',   'Department of Defense', 'Defense Agencies and DoD Field Activities', 'Defense Agencies', 'DLA',   'defense-agencies', 'support',       true, 'Supply chain and logistics.'),
  ('mda',   'Missile Defense Agency',                    'MDA',   'Department of Defense', 'Defense Agencies and DoD Field Activities', 'Defense Agencies', 'MDA',   'defense-agencies', 'research',      true, 'Ballistic missile defense programs. Reports to USD(R&E).'),
  ('nga',   'National Geospatial-Intelligence Agency',   'NGA',   'Department of Defense', 'Defense Agencies and DoD Field Activities', 'Defense Agencies', 'NGA',   'defense-agencies', 'intelligence',  true, 'Geospatial intelligence.'),
  ('nro',   'National Reconnaissance Office',            'NRO',   'Department of Defense', 'Defense Agencies and DoD Field Activities', 'Defense Agencies', 'NRO',   'defense-agencies', 'intelligence',  true, 'Reconnaissance satellites.'),
  ('dcsa',  'Defense Counterintelligence and Security Agency', 'DCSA', 'Department of Defense', 'Defense Agencies and DoD Field Activities', 'Defense Agencies', 'DCSA', 'defense-agencies', 'intelligence', true, 'Formerly DSS. Counterintelligence and security.'),
  ('dfas',  'Defense Finance and Accounting Service',    'DFAS',  'Department of Defense', 'Defense Agencies and DoD Field Activities', 'Defense Agencies', 'DFAS',  'defense-agencies', 'support',       true, 'Financial management.'),
  ('dha',   'Defense Health Agency',                     'DHA',   'Department of Defense', 'Defense Agencies and DoD Field Activities', 'Defense Agencies', 'DHA',   'defense-agencies', 'support',       true, 'Military healthcare.'),
  ('dsca',  'Defense Security Cooperation Agency',       'DSCA',  'Department of Defense', 'Defense Agencies and DoD Field Activities', 'Defense Agencies', 'DSCA',  'defense-agencies', 'support',       true, 'Foreign military sales.'),
  ('dtra',  'Defense Threat Reduction Agency',           'DTRA',  'Department of Defense', 'Defense Agencies and DoD Field Activities', 'Defense Agencies', 'DTRA',  'defense-agencies', 'research',      true, 'WMD/CBRN threat reduction.')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name, abbreviation = EXCLUDED.abbreviation,
  branch = EXCLUDED.branch, sub = EXCLUDED.sub, major = EXCLUDED.major,
  subtier = EXCLUDED.subtier, parent_id = EXCLUDED.parent_id,
  description = EXCLUDED.description, org_type_id = EXCLUDED.org_type_id,
  is_active = EXCLUDED.is_active;

-- DoD Field Activities
-- DIU and SCO already inserted under USD(R&E); set canonical_org_id for dedup
INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, org_type_id, is_active, is_alias, canonical_org_id) VALUES
  ('diu-field',
   'Defense Innovation Unit (Field Activity)',
   'DIU',
   'Department of Defense',
   'Defense Agencies and DoD Field Activities',
   'DoD Field Activities',
   'DIU',
   'defense-agencies', 'field_activity', true, true, 'diu'),
  ('sco-field',
   'Strategic Capabilities Office (Field Activity)',
   'SCO',
   'Department of Defense',
   'Defense Agencies and DoD Field Activities',
   'DoD Field Activities',
   'SCO',
   'defense-agencies', 'field_activity', true, true, 'sco')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name, abbreviation = EXCLUDED.abbreviation,
  branch = EXCLUDED.branch, sub = EXCLUDED.sub, major = EXCLUDED.major,
  subtier = EXCLUDED.subtier, parent_id = EXCLUDED.parent_id,
  org_type_id = EXCLUDED.org_type_id, is_active = EXCLUDED.is_active,
  is_alias = EXCLUDED.is_alias, canonical_org_id = EXCLUDED.canonical_org_id;

-- Other Field Activities
INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, org_type_id, is_active, description) VALUES
  ('whs',  'Washington Headquarters Services',  'WHS',  'Department of Defense', 'Defense Agencies and DoD Field Activities', 'DoD Field Activities', 'WHS',  'defense-agencies', 'support', true, 'Administrative support for OSD.'),
  ('tma',  'TRICARE Management Activity',       'TMA',  'Department of Defense', 'Defense Agencies and DoD Field Activities', 'DoD Field Activities', 'TMA',  'defense-agencies', 'support', true, 'Under DHA.'),
  ('dam',  'Director of Administration and Management', 'DA&M', 'Department of Defense', 'Defense Agencies and DoD Field Activities', 'DoD Field Activities', 'DA&M', 'defense-agencies', 'support', true, 'OSD administrative management.')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name, abbreviation = EXCLUDED.abbreviation,
  branch = EXCLUDED.branch, sub = EXCLUDED.sub, major = EXCLUDED.major,
  subtier = EXCLUDED.subtier, parent_id = EXCLUDED.parent_id,
  description = EXCLUDED.description, org_type_id = EXCLUDED.org_type_id,
  is_active = EXCLUDED.is_active;

-- ── EO 14347 secondary names stored in org descriptions ─────────────────────
-- Note: org_aliases has a CHECK (canonical_org_id != alias_org_id) constraint,
-- so secondary name aliases for DoD/OSD are captured in the description field only.

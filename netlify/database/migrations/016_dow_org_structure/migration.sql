-- Migration 016: DoW/DoD Org Structure (Jan 2026)
-- Reflects EO 14347 (Sept 5 2025), CDAO realignment (Aug 15 2025),
-- Innovation Ecosystem Reorg (Jan 9 2026), DIU/SCO Field Activity (Jan 14 2026)
-- Hierarchy: branch → sub → major → subtier
-- Note: org_type_id intentionally omitted to avoid FK dependency on seeded org_types

-- ── BRANCH: Department of Defense ────────────────────────────────────────────

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, is_active, description)
VALUES (
  'dod', 'Department of Defense', 'DoD',
  'Department of Defense', NULL, NULL, NULL,
  true,
  'United States Department of Defense. Secondary name "Department of War" authorized under EO 14347 (Sept 5, 2025) for non-statutory/ceremonial use.'
) ON CONFLICT DO NOTHING;

-- ── SUB: Office of the Secretary of Defense ──────────────────────────────────

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, is_active)
VALUES ('osd', 'Office of the Secretary of Defense', 'OSD',
  'Department of Defense', 'Office of the Secretary of Defense', NULL, NULL, 'dod', true)
ON CONFLICT DO NOTHING;

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, is_active, description)
VALUES (
  'secdef', 'Office of the Secretary of Defense', 'SecDef',
  'Department of Defense', 'Office of the Secretary of Defense', 'Office of the Secretary of Defense', NULL,
  'osd', true,
  'Secretary of Defense: Pete Hegseth. Deputy: Steve Feinberg (secondary title "Deputy Secretary of War" per EO 14347).'
) ON CONFLICT DO NOTHING;

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, is_active, description)
VALUES (
  'usd-re', 'Under Secretary of Defense for Research and Engineering', 'USD(R&E)',
  'Department of Defense', 'Office of the Secretary of Defense',
  'Under Secretary of Defense for Research and Engineering', NULL,
  'osd', true,
  'Also DoD CTO. Incumbent: Emil Michael (May 2025). Unified authority over DARPA, CDAO, DIU, SCO, OSC, TRMC, MEIA per Jan 9 2026 SecDef memo.'
) ON CONFLICT DO NOTHING;

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, is_active, description)
VALUES (
  'usd-as', 'Under Secretary of Defense for Acquisition and Sustainment', 'USD(A&S)',
  'Department of Defense', 'Office of the Secretary of Defense',
  'Under Secretary of Defense for Acquisition and Sustainment', NULL,
  'osd', true, 'Defense procurement, contracting policy, sustainment.'
) ON CONFLICT DO NOTHING;

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, is_active, description)
VALUES (
  'usd-pr', 'Under Secretary of Defense for Personnel and Readiness', 'USD(P&R)',
  'Department of Defense', 'Office of the Secretary of Defense',
  'Under Secretary of Defense for Personnel and Readiness', NULL,
  'osd', true, 'Incumbent: Anthony Tata (Jul 2025). Personnel, readiness, health, education.'
) ON CONFLICT DO NOTHING;

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, is_active, description)
VALUES (
  'usd-c', 'Under Secretary of Defense (Comptroller) / Chief Financial Officer', 'USD(C)',
  'Department of Defense', 'Office of the Secretary of Defense',
  'Under Secretary of Defense (Comptroller) / CFO', NULL,
  'osd', true, 'Budget, financial management, FYDP.'
) ON CONFLICT DO NOTHING;

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, is_active, description)
VALUES (
  'usd-is', 'Under Secretary of Defense for Intelligence and Security', 'USD(I&S)',
  'Department of Defense', 'Office of the Secretary of Defense',
  'Under Secretary of Defense for Intelligence and Security', NULL,
  'osd', true, 'Intelligence oversight and security policy.'
) ON CONFLICT DO NOTHING;

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, is_active, description)
VALUES (
  'jcs', 'Joint Chiefs of Staff', 'JCS',
  'Department of Defense', 'Office of the Secretary of Defense',
  'Joint Chiefs of Staff', NULL,
  'osd', true,
  'Chairman advisory to SecDef; not in chain of command. Service Chiefs: CSA, CNO, CMC, CSAF, CSO, CSNG.'
) ON CONFLICT DO NOTHING;

-- Innovation Ecosystem under USD(R&E)
INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, is_active, description)
VALUES
  ('darpa', 'Defense Advanced Research Projects Agency', 'DARPA',
   'Department of Defense', 'Office of the Secretary of Defense',
   'Under Secretary of Defense for Research and Engineering', 'DARPA',
   'usd-re', true, 'Breakthrough and foundational R&D.'),
  ('cdao', 'Chief Digital and Artificial Intelligence Office', 'CDAO',
   'Department of Defense', 'Office of the Secretary of Defense',
   'Under Secretary of Defense for Research and Engineering', 'CDAO',
   'usd-re', true,
   'Realigned to USD(R&E) Aug 15 2025. Incumbent: Cameron Stanley (Jan 2026). AI strategy, Advana, Maven Smart System.'),
  ('diu', 'Defense Innovation Unit', 'DIU',
   'Department of Defense', 'Office of the Secretary of Defense',
   'Under Secretary of Defense for Research and Engineering', 'DIU',
   'usd-re', true,
   'Designated DoW Field Activity Jan 14 2026. Director: Owen West. Commercial tech adoption.'),
  ('sco', 'Strategic Capabilities Office', 'SCO',
   'Department of Defense', 'Office of the Secretary of Defense',
   'Under Secretary of Defense for Research and Engineering', 'SCO',
   'usd-re', true,
   'Designated DoW Field Activity Jan 14 2026. Operational concepts combining existing systems.'),
  ('osc', 'Office of Strategic Capital', 'OSC',
   'Department of Defense', 'Office of the Secretary of Defense',
   'Under Secretary of Defense for Research and Engineering', 'OSC',
   'usd-re', true, 'Strategic investment and financing tools.'),
  ('trmc', 'Test Resource Management Center', 'TRMC',
   'Department of Defense', 'Office of the Secretary of Defense',
   'Under Secretary of Defense for Research and Engineering', 'TRMC',
   'usd-re', true, 'Test and evaluation resources.'),
  ('meia', 'Mission Engineering and Integration Activity', 'MEIA',
   'Department of Defense', 'Office of the Secretary of Defense',
   'Under Secretary of Defense for Research and Engineering', 'MEIA',
   'usd-re', true, 'Created Aug 2025. Mission engineering and problem intake. Industry: problems to MEIA, products to DIU.'),
  ('asd-st', 'Assistant Secretary of Defense for Science and Technology', 'ASD(S&T)',
   'Department of Defense', 'Office of the Secretary of Defense',
   'Under Secretary of Defense for Research and Engineering', 'ASD(S&T)',
   'usd-re', true, 'Established Jan 9 2026.'),
  ('asd-ct', 'Assistant Secretary of Defense for Commercial Technologies', 'ASD(CT)',
   'Department of Defense', 'Office of the Secretary of Defense',
   'Under Secretary of Defense for Research and Engineering', 'ASD(CT)',
   'usd-re', true, 'Redesignated from Critical Technologies. Established Jan 9 2026.'),
  ('asd-mc', 'Assistant Secretary of Defense for Mission Capabilities', 'ASD(MC)',
   'Department of Defense', 'Office of the Secretary of Defense',
   'Under Secretary of Defense for Research and Engineering', 'ASD(MC)',
   'usd-re', true, 'Established Jan 9 2026.')
ON CONFLICT DO NOTHING;

-- ── SUB: Military Departments ─────────────────────────────────────────────────

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, is_active)
VALUES ('mil-depts', 'Military Departments', NULL,
  'Department of Defense', 'Military Departments', NULL, NULL, 'dod', true)
ON CONFLICT DO NOTHING;

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, is_active, description)
VALUES (
  'army', 'Department of the Army', 'Army',
  'Army', 'Military Departments', 'Department of the Army', NULL,
  'mil-depts', true,
  'SecArmy, CSA. Subtiers: HQDA, FORSCOM, TRADOC, AMC, USARPAC, USAREUR-AF, ARNORTH, ARSOUTH, USACC, USARC.'
) ON CONFLICT DO NOTHING;

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, is_active)
VALUES
  ('hqda',     'Headquarters, Department of the Army',         'HQDA',       'Army', 'Military Departments', 'Department of the Army', 'HQDA',       'army', true),
  ('forscom',  'U.S. Army Forces Command',                     'FORSCOM',    'Army', 'Military Departments', 'Department of the Army', 'FORSCOM',    'army', true),
  ('tradoc',   'U.S. Army Training and Doctrine Command',      'TRADOC',     'Army', 'Military Departments', 'Department of the Army', 'TRADOC',     'army', true),
  ('amc-army', 'U.S. Army Materiel Command',                   'AMC',        'Army', 'Military Departments', 'Department of the Army', 'AMC',        'army', true),
  ('usarpac',  'U.S. Army Pacific',                            'USARPAC',    'Army', 'Military Departments', 'Department of the Army', 'USARPAC',    'army', true),
  ('usareur',  'U.S. Army Europe and Africa',                  'USAREUR-AF', 'Army', 'Military Departments', 'Department of the Army', 'USAREUR-AF', 'army', true),
  ('arnorth',  'U.S. Army North',                              'ARNORTH',    'Army', 'Military Departments', 'Department of the Army', 'ARNORTH',    'army', true),
  ('arsouth',  'U.S. Army South',                              'ARSOUTH',    'Army', 'Military Departments', 'Department of the Army', 'ARSOUTH',    'army', true),
  ('usacc',    'U.S. Army Contracting Command',                'USACC',      'Army', 'Military Departments', 'Department of the Army', 'USACC',      'army', true),
  ('usarc',    'U.S. Army Reserve Command',                    'USARC',      'Army', 'Military Departments', 'Department of the Army', 'USARC',      'army', true)
ON CONFLICT DO NOTHING;

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, is_active, description)
VALUES (
  'navy', 'Department of the Navy', 'Navy',
  'Navy', 'Military Departments', 'Department of the Navy', NULL,
  'mil-depts', true,
  'SecNav, CNO, CMC. Subtiers: OPNAV, HQMC, USFFC, USPACFLT.'
) ON CONFLICT DO NOTHING;

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, is_active)
VALUES
  ('opnav',    'Office of the Chief of Naval Operations', 'OPNAV',    'Navy', 'Military Departments', 'Department of the Navy', 'OPNAV',    'navy', true),
  ('hqmc',     'Headquarters, Marine Corps',              'HQMC',     'Navy', 'Military Departments', 'Department of the Navy', 'HQMC',     'navy', true),
  ('usffc',    'U.S. Fleet Forces Command',               'USFFC',    'Navy', 'Military Departments', 'Department of the Navy', 'USFFC',    'navy', true),
  ('uspacflt', 'U.S. Pacific Fleet',                      'USPACFLT', 'Navy', 'Military Departments', 'Department of the Navy', 'USPACFLT', 'navy', true)
ON CONFLICT DO NOTHING;

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, is_active, description)
VALUES (
  'af', 'Department of the Air Force', 'AF',
  'Air Force', 'Military Departments', 'Department of the Air Force', NULL,
  'mil-depts', true,
  'SecAF, CSAF, CSO (Space Force). Subtiers: HAF, SF HQ, ACC, AMC, AFSOC, AETC, AFGSC, AFMC, AFRC, ANG.'
) ON CONFLICT DO NOTHING;

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, is_active)
VALUES
  ('haf',    'Headquarters Air Force',               'HAF',   'Air Force',   'Military Departments', 'Department of the Air Force', 'HAF',   'af', true),
  ('sf-hq',  'Headquarters Space Force',             'SF HQ', 'Space Force', 'Military Departments', 'Department of the Air Force', 'SF HQ', 'af', true),
  ('acc',    'Air Combat Command',                   'ACC',   'Air Force',   'Military Departments', 'Department of the Air Force', 'ACC',   'af', true),
  ('amc-af', 'Air Mobility Command',                 'AMC',   'Air Force',   'Military Departments', 'Department of the Air Force', 'AMC',   'af', true),
  ('afsoc',  'Air Force Special Operations Command', 'AFSOC', 'Air Force',   'Military Departments', 'Department of the Air Force', 'AFSOC', 'af', true),
  ('aetc',   'Air Education and Training Command',   'AETC',  'Air Force',   'Military Departments', 'Department of the Air Force', 'AETC',  'af', true),
  ('afgsc',  'Air Force Global Strike Command',      'AFGSC', 'Air Force',   'Military Departments', 'Department of the Air Force', 'AFGSC', 'af', true),
  ('afmc',   'Air Force Materiel Command',           'AFMC',  'Air Force',   'Military Departments', 'Department of the Air Force', 'AFMC',  'af', true),
  ('afrc',   'Air Force Reserve Command',            'AFRC',  'Air Force',   'Military Departments', 'Department of the Air Force', 'AFRC',  'af', true),
  ('ang',    'Air National Guard',                   'ANG',   'Air Force',   'Military Departments', 'Department of the Air Force', 'ANG',   'af', true)
ON CONFLICT DO NOTHING;

-- ── SUB: Combatant Commands ───────────────────────────────────────────────────

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, is_active, description)
VALUES ('ccmds', 'Combatant Commands', 'CCMDs',
  'Department of Defense', 'Combatant Commands', NULL, NULL, 'dod', true,
  'Report to SecDef via CJCS; Title 10 chain of command.')
ON CONFLICT DO NOTHING;

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, is_active, description)
VALUES
  ('usindopacom', 'U.S. Indo-Pacific Command',      'USINDOPACOM', 'Department of Defense', 'Combatant Commands', 'Geographic Combatant Commands', 'USINDOPACOM', 'ccmds', true, 'Indo-Pacific.'),
  ('useucom',     'U.S. European Command',           'USEUCOM',     'Department of Defense', 'Combatant Commands', 'Geographic Combatant Commands', 'USEUCOM',     'ccmds', true, 'Europe.'),
  ('uscentcom',   'U.S. Central Command',            'USCENTCOM',   'Department of Defense', 'Combatant Commands', 'Geographic Combatant Commands', 'USCENTCOM',   'ccmds', true, 'Middle East / Central Asia.'),
  ('usnorthcom',  'U.S. Northern Command',           'USNORTHCOM',  'Department of Defense', 'Combatant Commands', 'Geographic Combatant Commands', 'USNORTHCOM',  'ccmds', true, 'North America; dual-hat NORAD.'),
  ('ussouthcom',  'U.S. Southern Command',           'USSOUTHCOM',  'Department of Defense', 'Combatant Commands', 'Geographic Combatant Commands', 'USSOUTHCOM',  'ccmds', true, 'Latin America.'),
  ('usafricom',   'U.S. Africa Command',             'USAFRICOM',   'Department of Defense', 'Combatant Commands', 'Geographic Combatant Commands', 'USAFRICOM',   'ccmds', true, 'Africa.'),
  ('ussocom',     'U.S. Special Operations Command', 'USSOCOM',     'Department of Defense', 'Combatant Commands', 'Functional Combatant Commands', 'USSOCOM',     'ccmds', true, 'Special Operations.'),
  ('usstratcom',  'U.S. Strategic Command',          'USSTRATCOM',  'Department of Defense', 'Combatant Commands', 'Functional Combatant Commands', 'USSTRATCOM',  'ccmds', true, 'Nuclear / Strategic Deterrence.'),
  ('ustranscom',  'U.S. Transportation Command',     'USTRANSCOM',  'Department of Defense', 'Combatant Commands', 'Functional Combatant Commands', 'USTRANSCOM',  'ccmds', true, 'Global Strategic Transport.'),
  ('uscybercom',  'U.S. Cyber Command',              'USCYBERCOM',  'Department of Defense', 'Combatant Commands', 'Functional Combatant Commands', 'USCYBERCOM',  'ccmds', true, 'Cyber; dual-hat NSA Director.'),
  ('usspacecom',  'U.S. Space Command',              'USSPACECOM',  'Department of Defense', 'Combatant Commands', 'Functional Combatant Commands', 'USSPACECOM',  'ccmds', true, 'Space Operations.')
ON CONFLICT DO NOTHING;

-- ── SUB: Defense Agencies & DoD Field Activities ─────────────────────────────

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, is_active)
VALUES ('defense-agencies', 'Defense Agencies and DoD Field Activities', NULL,
  'Department of Defense', 'Defense Agencies and DoD Field Activities', NULL, NULL, 'dod', true)
ON CONFLICT DO NOTHING;

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, is_active, description)
VALUES
  ('disa', 'Defense Information Systems Agency',          'DISA',  'Department of Defense', 'Defense Agencies and DoD Field Activities', 'Defense Agencies', 'DISA',  'defense-agencies', true, 'IT infrastructure, DODIN.'),
  ('dia',  'Defense Intelligence Agency',                 'DIA',   'Department of Defense', 'Defense Agencies and DoD Field Activities', 'Defense Agencies', 'DIA',   'defense-agencies', true, 'All-source intelligence.'),
  ('dla',  'Defense Logistics Agency',                    'DLA',   'Department of Defense', 'Defense Agencies and DoD Field Activities', 'Defense Agencies', 'DLA',   'defense-agencies', true, 'Supply chain and logistics.'),
  ('mda',  'Missile Defense Agency',                      'MDA',   'Department of Defense', 'Defense Agencies and DoD Field Activities', 'Defense Agencies', 'MDA',   'defense-agencies', true, 'Ballistic missile defense.'),
  ('nga',  'National Geospatial-Intelligence Agency',     'NGA',   'Department of Defense', 'Defense Agencies and DoD Field Activities', 'Defense Agencies', 'NGA',   'defense-agencies', true, 'Geospatial intelligence.'),
  ('nro',  'National Reconnaissance Office',              'NRO',   'Department of Defense', 'Defense Agencies and DoD Field Activities', 'Defense Agencies', 'NRO',   'defense-agencies', true, 'Reconnaissance satellites.'),
  ('dcsa', 'Defense Counterintelligence and Security Agency', 'DCSA', 'Department of Defense', 'Defense Agencies and DoD Field Activities', 'Defense Agencies', 'DCSA', 'defense-agencies', true, 'Formerly DSS.'),
  ('dfas', 'Defense Finance and Accounting Service',      'DFAS',  'Department of Defense', 'Defense Agencies and DoD Field Activities', 'Defense Agencies', 'DFAS',  'defense-agencies', true, 'Financial management.'),
  ('dha',  'Defense Health Agency',                       'DHA',   'Department of Defense', 'Defense Agencies and DoD Field Activities', 'Defense Agencies', 'DHA',   'defense-agencies', true, 'Military healthcare.'),
  ('dsca', 'Defense Security Cooperation Agency',         'DSCA',  'Department of Defense', 'Defense Agencies and DoD Field Activities', 'Defense Agencies', 'DSCA',  'defense-agencies', true, 'Foreign military sales.'),
  ('dtra', 'Defense Threat Reduction Agency',             'DTRA',  'Department of Defense', 'Defense Agencies and DoD Field Activities', 'Defense Agencies', 'DTRA',  'defense-agencies', true, 'WMD/CBRN threat reduction.'),
  ('whs',  'Washington Headquarters Services',            'WHS',   'Department of Defense', 'Defense Agencies and DoD Field Activities', 'DoD Field Activities', 'WHS',  'defense-agencies', true, 'OSD administrative support.'),
  ('tma',  'TRICARE Management Activity',                 'TMA',   'Department of Defense', 'Defense Agencies and DoD Field Activities', 'DoD Field Activities', 'TMA',  'defense-agencies', true, 'Under DHA.'),
  ('dam',  'Director of Administration and Management',   'DA&M',  'Department of Defense', 'Defense Agencies and DoD Field Activities', 'DoD Field Activities', 'DA&M', 'defense-agencies', true, 'OSD admin management.')
ON CONFLICT DO NOTHING;

-- DIU and SCO alias rows pointing to the USD(R&E) canonical entries
INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, parent_id, is_active, is_alias, canonical_org_id)
VALUES
  ('diu-field', 'Defense Innovation Unit (Field Activity)', 'DIU',
   'Department of Defense', 'Defense Agencies and DoD Field Activities', 'DoD Field Activities', 'DIU',
   'defense-agencies', true, true, 'diu'),
  ('sco-field', 'Strategic Capabilities Office (Field Activity)', 'SCO',
   'Department of Defense', 'Defense Agencies and DoD Field Activities', 'DoD Field Activities', 'SCO',
   'defense-agencies', true, true, 'sco')
ON CONFLICT DO NOTHING;

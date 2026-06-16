-- Migration 020: Fix org hierarchy data for key DoD orgs
-- Uses plain UPDATEs since rows already exist (ON CONFLICT DO NOTHING in 016 skipped them)

-- ── DoD root ──────────────────────────────────────────────────────────────────
UPDATE orgs SET branch='Department of Defense', sub=NULL, major=NULL, subtier=NULL,
  parent_id=NULL, hierarchy_level=0, abs_hierarchy_level=0, is_active=true
  WHERE id='dod';

-- ── Sub: Office of the Secretary of Defense ───────────────────────────────────
UPDATE orgs SET branch='Department of Defense', sub='Office of the Secretary of Defense', major=NULL, subtier=NULL,
  parent_id='dod', hierarchy_level=1, abs_hierarchy_level=1, is_active=true
  WHERE id='osd';

UPDATE orgs SET branch='Department of Defense', sub='Office of the Secretary of Defense', major='Office of the Secretary of Defense', subtier=NULL,
  parent_id='osd', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='secdef';

UPDATE orgs SET branch='Department of Defense', sub='Office of the Secretary of Defense', major='Under Secretary of Defense for Research and Engineering', subtier=NULL,
  parent_id='osd', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='usd-re';

UPDATE orgs SET branch='Department of Defense', sub='Office of the Secretary of Defense', major='Under Secretary of Defense for Acquisition and Sustainment', subtier=NULL,
  parent_id='osd', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='usd-as';

UPDATE orgs SET branch='Department of Defense', sub='Office of the Secretary of Defense', major='Under Secretary of Defense for Personnel and Readiness', subtier=NULL,
  parent_id='osd', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='usd-pr';

UPDATE orgs SET branch='Department of Defense', sub='Office of the Secretary of Defense', major='Under Secretary of Defense (Comptroller)', subtier=NULL,
  parent_id='osd', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='usd-c';

UPDATE orgs SET branch='Department of Defense', sub='Office of the Secretary of Defense', major='Under Secretary of Defense for Intelligence and Security', subtier=NULL,
  parent_id='osd', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='usd-is';

UPDATE orgs SET branch='Department of Defense', sub='Office of the Secretary of Defense', major='Joint Chiefs of Staff', subtier=NULL,
  parent_id='osd', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='jcs';

UPDATE orgs SET branch='Department of Defense', sub='Office of the Secretary of Defense', major='Under Secretary of Defense for Research and Engineering', subtier='DARPA',
  parent_id='usd-re', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='darpa';

UPDATE orgs SET branch='Department of Defense', sub='Office of the Secretary of Defense', major='Under Secretary of Defense for Research and Engineering', subtier='CDAO',
  parent_id='usd-re', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='cdao';

UPDATE orgs SET branch='Department of Defense', sub='Office of the Secretary of Defense', major='Under Secretary of Defense for Research and Engineering', subtier='DIU',
  parent_id='usd-re', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='diu';

UPDATE orgs SET branch='Department of Defense', sub='Office of the Secretary of Defense', major='Under Secretary of Defense for Research and Engineering', subtier='SCO',
  parent_id='usd-re', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='sco';

UPDATE orgs SET branch='Department of Defense', sub='Office of the Secretary of Defense', major='Under Secretary of Defense for Research and Engineering', subtier='OSC',
  parent_id='usd-re', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='osc';

UPDATE orgs SET branch='Department of Defense', sub='Office of the Secretary of Defense', major='Under Secretary of Defense for Research and Engineering', subtier='TRMC',
  parent_id='usd-re', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='trmc';

UPDATE orgs SET branch='Department of Defense', sub='Office of the Secretary of Defense', major='Under Secretary of Defense for Research and Engineering', subtier='MEIA',
  parent_id='usd-re', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='meia';

UPDATE orgs SET branch='Department of Defense', sub='Office of the Secretary of Defense', major='Under Secretary of Defense for Research and Engineering', subtier='ASD(S&T)',
  parent_id='usd-re', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='asd-st';

UPDATE orgs SET branch='Department of Defense', sub='Office of the Secretary of Defense', major='Under Secretary of Defense for Research and Engineering', subtier='ASD(CT)',
  parent_id='usd-re', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='asd-ct';

UPDATE orgs SET branch='Department of Defense', sub='Office of the Secretary of Defense', major='Under Secretary of Defense for Research and Engineering', subtier='ASD(MC)',
  parent_id='usd-re', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='asd-mc';

-- ── Sub: Military Departments ─────────────────────────────────────────────────
UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major=NULL, subtier=NULL,
  parent_id='dod', hierarchy_level=1, abs_hierarchy_level=1, is_active=true
  WHERE id='mil-depts';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Army', subtier=NULL,
  parent_id='mil-depts', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='army';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Army', subtier='HQDA',
  parent_id='army', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='hqda';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Army', subtier='FORSCOM',
  parent_id='army', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='forscom';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Army', subtier='TRADOC',
  parent_id='army', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='tradoc';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Army', subtier='AMC',
  parent_id='army', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='amc-army';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Army', subtier='USARPAC',
  parent_id='army', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='usarpac';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Army', subtier='USAREUR-AF',
  parent_id='army', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='usareur';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Army', subtier='ARNORTH',
  parent_id='army', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='arnorth';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Army', subtier='ARSOUTH',
  parent_id='army', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='arsouth';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Army', subtier='USACC',
  parent_id='army', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='usacc';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Army', subtier='USARC',
  parent_id='army', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='usarc';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Army', subtier='ARNG',
  parent_id='army', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='army_ng';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Navy', subtier=NULL,
  parent_id='mil-depts', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='navy';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Navy', subtier='OPNAV',
  parent_id='navy', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='opnav';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Navy', subtier='HQMC',
  parent_id='navy', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='hqmc';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Navy', subtier='USFFC',
  parent_id='navy', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='usffc';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Navy', subtier='USPACFLT',
  parent_id='navy', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='uspacflt';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Air Force', subtier=NULL,
  parent_id='mil-depts', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='af';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Air Force', subtier='HAF',
  parent_id='af', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='haf';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Air Force', subtier='USSF',
  parent_id='af', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='sf-hq';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Air Force', subtier='ACC',
  parent_id='af', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='acc';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Air Force', subtier='AMC',
  parent_id='af', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='amc-af';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Air Force', subtier='AFSOC',
  parent_id='af', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='afsoc';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Air Force', subtier='AETC',
  parent_id='af', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='aetc';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Air Force', subtier='AFGSC',
  parent_id='af', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='afgsc';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Air Force', subtier='AFMC',
  parent_id='af', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='afmc';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Air Force', subtier='AFRC',
  parent_id='af', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='afrc';

UPDATE orgs SET branch='Department of Defense', sub='Military Departments', major='Department of the Air Force', subtier='ANG',
  parent_id='af', hierarchy_level=3, abs_hierarchy_level=3, is_active=true
  WHERE id='ang';

-- ── Sub: Combatant Commands ───────────────────────────────────────────────────
UPDATE orgs SET branch='Department of Defense', sub='Combatant Commands', major=NULL, subtier=NULL,
  parent_id='dod', hierarchy_level=1, abs_hierarchy_level=1, is_active=true
  WHERE id='ccmds';

UPDATE orgs SET branch='Department of Defense', sub='Combatant Commands', major='Geographic Combatant Commands', subtier='USINDOPACOM',
  parent_id='ccmds', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='usindopacom';

UPDATE orgs SET branch='Department of Defense', sub='Combatant Commands', major='Geographic Combatant Commands', subtier='USEUCOM',
  parent_id='ccmds', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='useucom';

UPDATE orgs SET branch='Department of Defense', sub='Combatant Commands', major='Geographic Combatant Commands', subtier='USCENTCOM',
  parent_id='ccmds', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='uscentcom';

UPDATE orgs SET branch='Department of Defense', sub='Combatant Commands', major='Geographic Combatant Commands', subtier='USNORTHCOM',
  parent_id='ccmds', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='usnorthcom';

UPDATE orgs SET branch='Department of Defense', sub='Combatant Commands', major='Geographic Combatant Commands', subtier='USSOUTHCOM',
  parent_id='ccmds', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='ussouthcom';

UPDATE orgs SET branch='Department of Defense', sub='Combatant Commands', major='Geographic Combatant Commands', subtier='USAFRICOM',
  parent_id='ccmds', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='usafricom';

UPDATE orgs SET branch='Department of Defense', sub='Combatant Commands', major='Functional Combatant Commands', subtier='USSOCOM',
  parent_id='ccmds', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='ussocom';

UPDATE orgs SET branch='Department of Defense', sub='Combatant Commands', major='Functional Combatant Commands', subtier='USSTRATCOM',
  parent_id='ccmds', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='usstratcom';

UPDATE orgs SET branch='Department of Defense', sub='Combatant Commands', major='Functional Combatant Commands', subtier='USTRANSCOM',
  parent_id='ccmds', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='ustranscom';

UPDATE orgs SET branch='Department of Defense', sub='Combatant Commands', major='Functional Combatant Commands', subtier='USCYBERCOM',
  parent_id='ccmds', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='uscybercom';

UPDATE orgs SET branch='Department of Defense', sub='Combatant Commands', major='Functional Combatant Commands', subtier='USSPACECOM',
  parent_id='ccmds', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='usspacecom';

-- ── Sub: Defense Agencies & DoD Field Activities ──────────────────────────────
UPDATE orgs SET branch='Department of Defense', sub='Defense Agencies & DoD Field Activities', major=NULL, subtier=NULL,
  parent_id='dod', hierarchy_level=1, abs_hierarchy_level=1, is_active=true
  WHERE id='defense-agencies';

UPDATE orgs SET branch='Department of Defense', sub='Defense Agencies & DoD Field Activities', major='Defense Agencies', subtier='DISA',
  parent_id='defense-agencies', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='disa';

UPDATE orgs SET branch='Department of Defense', sub='Defense Agencies & DoD Field Activities', major='Defense Agencies', subtier='DIA',
  parent_id='defense-agencies', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='dia';

UPDATE orgs SET branch='Department of Defense', sub='Defense Agencies & DoD Field Activities', major='Defense Agencies', subtier='DLA',
  parent_id='defense-agencies', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='dla';

UPDATE orgs SET branch='Department of Defense', sub='Defense Agencies & DoD Field Activities', major='Defense Agencies', subtier='MDA',
  parent_id='defense-agencies', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='mda';

UPDATE orgs SET branch='Department of Defense', sub='Defense Agencies & DoD Field Activities', major='Defense Agencies', subtier='NGA',
  parent_id='defense-agencies', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='nga';

UPDATE orgs SET branch='Department of Defense', sub='Defense Agencies & DoD Field Activities', major='Defense Agencies', subtier='NRO',
  parent_id='defense-agencies', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='nro';

UPDATE orgs SET branch='Department of Defense', sub='Defense Agencies & DoD Field Activities', major='Defense Agencies', subtier='DCSA',
  parent_id='defense-agencies', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='dcsa';

UPDATE orgs SET branch='Department of Defense', sub='Defense Agencies & DoD Field Activities', major='Defense Agencies', subtier='DFAS',
  parent_id='defense-agencies', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='dfas';

UPDATE orgs SET branch='Department of Defense', sub='Defense Agencies & DoD Field Activities', major='Defense Agencies', subtier='DHA',
  parent_id='defense-agencies', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='dha';

UPDATE orgs SET branch='Department of Defense', sub='Defense Agencies & DoD Field Activities', major='Defense Agencies', subtier='DSCA',
  parent_id='defense-agencies', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='dsca';

UPDATE orgs SET branch='Department of Defense', sub='Defense Agencies & DoD Field Activities', major='Defense Agencies', subtier='DTRA',
  parent_id='defense-agencies', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='dtra';

UPDATE orgs SET branch='Department of Defense', sub='Defense Agencies & DoD Field Activities', major='DoD Field Activities', subtier='WHS',
  parent_id='defense-agencies', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='whs';

UPDATE orgs SET branch='Department of Defense', sub='Defense Agencies & DoD Field Activities', major='DoD Field Activities', subtier='TMA',
  parent_id='defense-agencies', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='tma';

UPDATE orgs SET branch='Department of Defense', sub='Defense Agencies & DoD Field Activities', major='DoD Field Activities', subtier='DA&M',
  parent_id='defense-agencies', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='dam';

UPDATE orgs SET branch='Department of Defense', sub='Defense Agencies & DoD Field Activities', major='DoD Field Activities', subtier='DIU (Field Activity)',
  parent_id='defense-agencies', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='diu-field';

UPDATE orgs SET branch='Department of Defense', sub='Defense Agencies & DoD Field Activities', major='DoD Field Activities', subtier='SCO (Field Activity)',
  parent_id='defense-agencies', hierarchy_level=2, abs_hierarchy_level=2, is_active=true
  WHERE id='sco-field';

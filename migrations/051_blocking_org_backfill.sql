-- Migration 051: blocking org backfill
--
-- Engineering spec §4, "Org backfill (blocking)". These 21 root orgs must
-- exist before scoring goes live, because an unresolved org means an unscored
-- opportunity, and §5 gives org alignment up to 20 of the 100 points.
--
-- Most of these rows are already in the database, seeded by the one-off
-- Netlify function seed-orgs-master.mjs. That function set `subtier` to the
-- acronym but left `full_name` and `abbreviation` NULL — and
-- lib/ingestion/org-matcher.ts resolves SAM office codes via
-- `lower(abbreviation)`, so those NULLs are the reason acronym-keyed notices
-- fall through to the fuzzy department match. This migration fills them in.
--
-- Written as insert-then-update so it is correct from zero (fresh DO database,
-- no seed function ever run) and idempotent against the existing database.
-- COALESCE on update means it never overwrites a value someone set by hand.

INSERT INTO orgs (id, full_name, abbreviation, branch, sub, major, subtier, loc, is_active, description)
VALUES
  ('centcom',  'United States Central Command',                    'CENTCOM',  'Combatant Command', 'CENTCOM',  'Combatant Command', 'CENTCOM',  'MacDill AFB, FL',        true, 'Geographic combatant command: Middle East, Central Asia.'),
  ('eucom',    'United States European Command',                   'EUCOM',    'Combatant Command', 'EUCOM',    'Combatant Command', 'EUCOM',    'Stuttgart, Germany',     true, 'Geographic combatant command: Europe.'),
  ('northcom', 'United States Northern Command',                   'NORTHCOM', 'Combatant Command', 'NORTHCOM', 'Combatant Command', 'NORTHCOM', 'Peterson SFB, CO',       true, 'Geographic combatant command: North America, homeland defense.'),
  ('southcom', 'United States Southern Command',                   'SOUTHCOM', 'Combatant Command', 'SOUTHCOM', 'Combatant Command', 'SOUTHCOM', 'Doral, FL',              true, 'Geographic combatant command: Central and South America, Caribbean.'),
  ('stratcom', 'United States Strategic Command',                  'STRATCOM', 'Combatant Command', 'STRATCOM', 'Combatant Command', 'STRATCOM', 'Offutt AFB, NE',         true, 'Functional combatant command: strategic deterrence, nuclear operations.'),
  ('transcom', 'United States Transportation Command',             'TRANSCOM', 'Combatant Command', 'TRANSCOM', 'Combatant Command', 'TRANSCOM', 'Scott AFB, IL',          true, 'Functional combatant command: mobility, distribution, logistics.'),
  ('cybercom', 'United States Cyber Command',                      'CYBERCOM', 'Combatant Command', 'CYBERCOM', 'Combatant Command', 'CYBERCOM', 'Fort Meade, MD',         true, 'Functional combatant command: cyberspace operations.'),
  ('africom',  'United States Africa Command',                     'AFRICOM',  'Combatant Command', 'AFRICOM',  'Combatant Command', 'AFRICOM',  'Stuttgart, Germany',     true, 'Geographic combatant command: Africa.'),
  ('spacecom', 'United States Space Command',                      'SPACECOM', 'Combatant Command', 'SPACECOM', 'Combatant Command', 'SPACECOM', 'Peterson SFB, CO',       true, 'Functional combatant command: space operations.'),
  ('dia',      'Defense Intelligence Agency',                      'DIA',      'DoW',               'OSD I&S',  'OSD',               'DIA',      'Washington, DC',         true, 'Combat support agency: all-source military intelligence.'),
  ('nsa',      'National Security Agency',                         'NSA',      'DoW',               'OSD I&S',  'OSD',               'NSA',      'Fort Meade, MD',         true, 'Combat support agency: signals intelligence, cybersecurity.'),
  ('nga',      'National Geospatial-Intelligence Agency',          'NGA',      'DoW',               'OSD I&S',  'OSD',               'NGA',      'Springfield, VA',        true, 'Combat support agency: geospatial intelligence.'),
  ('nro',      'National Reconnaissance Office',                   'NRO',      'DoW',               'OSD I&S',  'OSD',               'NRO',      'Chantilly, VA',          true, 'Overhead reconnaissance systems.'),
  ('disa',     'Defense Information Systems Agency',               'DISA',     'DoW',               'OSD I&S',  'OSD',               'DISA',     'Fort Meade, MD',         true, 'Combat support agency: IT and communications infrastructure.'),
  ('dla',      'Defense Logistics Agency',                         'DLA',      'DoW',               'OSD A&S',  'OSD',               'DLA',      'Fort Belvoir, VA',       true, 'Combat support agency: logistics, supply chain, disposition.'),
  ('dcsa',     'Defense Counterintelligence and Security Agency',  'DCSA',     'DoW',               'OSD I&S',  'OSD',               'DCSA',     'Quantico, VA',           true, 'Personnel vetting, industrial security, counterintelligence.'),
  ('dtra',     'Defense Threat Reduction Agency',                  'DTRA',     'DoW',               'OSD A&S',  'OSD',               'DTRA',     'Fort Belvoir, VA',       true, 'Countering weapons of mass destruction.'),
  ('dha',      'Defense Health Agency',                            'DHA',      'DoW',               'OSD P&R',  'OSD',               'DHA',      'Falls Church, VA',       true, 'Combat support agency: military health system.'),
  ('dfas',     'Defense Finance and Accounting Service',           'DFAS',     'DoW',               'OSD C',    'OSD',               'DFAS',     'Indianapolis, IN',       true, 'Finance and accounting services.'),
  ('cdao',     'Chief Digital and Artificial Intelligence Office', 'CDAO',     'DoW',               'OSD R&E',  'OSD',               'CDAO',     'Pentagon, Arlington, VA', true, 'Data, analytics, and AI adoption across the Department.'),
  ('diu',      'Defense Innovation Unit',                          'DIU',      'DoW',               'OSD R&E',  'OSD',               'DIU',      'Mountain View, CA',      true, 'Commercial technology adoption; Commercial Solutions Openings.')
ON CONFLICT (id) DO NOTHING;

-- Fill the resolution-critical columns on rows that already existed. COALESCE
-- keeps any value already present, including manual corrections.
UPDATE orgs o
SET full_name    = COALESCE(o.full_name, v.full_name),
    abbreviation = COALESCE(o.abbreviation, v.abbreviation),
    is_active    = COALESCE(o.is_active, true)
FROM (VALUES
  ('centcom',  'United States Central Command',                    'CENTCOM'),
  ('eucom',    'United States European Command',                   'EUCOM'),
  ('northcom', 'United States Northern Command',                   'NORTHCOM'),
  ('southcom', 'United States Southern Command',                   'SOUTHCOM'),
  ('stratcom', 'United States Strategic Command',                  'STRATCOM'),
  ('transcom', 'United States Transportation Command',             'TRANSCOM'),
  ('cybercom', 'United States Cyber Command',                      'CYBERCOM'),
  ('africom',  'United States Africa Command',                     'AFRICOM'),
  ('spacecom', 'United States Space Command',                      'SPACECOM'),
  ('dia',      'Defense Intelligence Agency',                      'DIA'),
  ('nsa',      'National Security Agency',                         'NSA'),
  ('nga',      'National Geospatial-Intelligence Agency',          'NGA'),
  ('nro',      'National Reconnaissance Office',                   'NRO'),
  ('disa',     'Defense Information Systems Agency',               'DISA'),
  ('dla',      'Defense Logistics Agency',                         'DLA'),
  ('dcsa',     'Defense Counterintelligence and Security Agency',  'DCSA'),
  ('dtra',     'Defense Threat Reduction Agency',                  'DTRA'),
  ('dha',      'Defense Health Agency',                            'DHA'),
  ('dfas',     'Defense Finance and Accounting Service',           'DFAS'),
  ('cdao',     'Chief Digital and Artificial Intelligence Office', 'CDAO'),
  ('diu',      'Defense Innovation Unit',                          'DIU')
) AS v(id, full_name, abbreviation)
WHERE o.id = v.id;

-- org-matcher.ts resolves on lower(abbreviation); without this the lookup is a
-- sequential scan of every org on every unresolved notice.
CREATE INDEX IF NOT EXISTS idx_orgs_abbreviation_lower ON orgs (lower(abbreviation));
CREATE INDEX IF NOT EXISTS idx_orgs_id_lower ON orgs (lower(id));

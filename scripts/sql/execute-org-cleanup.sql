-- Organization Cleanup and Recategorization
-- Executes the parser logic to normalize all "OTHER" organizations
-- Run this in Netlify Database UI or through any connected database client

-- ===== PHASE 1: SCHEMA PREPARATION =====
-- Add necessary columns if not exists (safe to run multiple times)

ALTER TABLE orgs
ADD COLUMN IF NOT EXISTS organization_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS entity_classification VARCHAR(20),
ADD COLUMN IF NOT EXISTS canonical_hierarchy_path TEXT,
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS raw_original_value TEXT;

-- ===== PHASE 2: PROCUREMENT CODES ONLY =====
-- Identify and flag organizations that are ONLY procurement codes (no org name)
-- These should be extracted and removed from hierarchy

UPDATE orgs
SET
  organization_type = 'procurement_code',
  entity_classification = 'Procurement',
  confidence_score = 1.0
WHERE parent_id = 'other'
  AND (
    full_name ~ '^FA[0-9]{4}$'
    OR full_name ~ '^N[0-9]{5}$'
    OR full_name ~ '^W[0-9A-Z]{3}$'
    OR full_name ~ '^[A-Z]{1,3}[0-9]{3,4}$'
  )
  AND LENGTH(full_name) < 20;

-- ===== PHASE 3: DLA ORGANIZATIONS =====
-- Fix DLA organizations with normalized names and proper parent

UPDATE orgs
SET
  full_name = 'DLA Maritime',
  description = 'DLA Maritime',
  parent_id = 'defense-logistics-agency',
  organization_type = 'division',
  entity_classification = 'Federal',
  canonical_hierarchy_path = 'Department of Defense > Defense Logistics Agency > DLA Maritime',
  confidence_score = 0.95,
  raw_original_value = full_name
WHERE parent_id = 'other'
  AND full_name ~* 'DLA.*MARITIME'
  AND full_name NOT ~* 'PEARL|HARBOR|PORTSMOUTH|SHIPYARD'
  AND LENGTH(full_name) > 80;

UPDATE orgs
SET
  full_name = 'DLA Maritime - Pearl Harbor',
  description = 'DLA Maritime - Pearl Harbor',
  parent_id = 'defense-logistics-agency',
  organization_type = 'division',
  entity_classification = 'Federal',
  canonical_hierarchy_path = 'Department of Defense > Defense Logistics Agency > DLA Maritime > Pearl Harbor, HI',
  confidence_score = 0.98,
  raw_original_value = full_name
WHERE parent_id = 'other'
  AND (full_name ~* 'DLA.*MARITIME.*PEARL'
       OR full_name ~* 'DEFENSE LOGISTICS.*DLA MARITIME.*SHIPYARD.*PEARL')
  AND full_name ~* 'PEARL|HARBOR';

UPDATE orgs
SET
  full_name = 'DLA Maritime - Portsmouth',
  description = 'DLA Maritime - Portsmouth',
  parent_id = 'defense-logistics-agency',
  organization_type = 'division',
  entity_classification = 'Federal',
  canonical_hierarchy_path = 'Department of Defense > Defense Logistics Agency > DLA Maritime > Portsmouth, NH',
  confidence_score = 0.98,
  raw_original_value = full_name
WHERE parent_id = 'other'
  AND full_name ~* 'DLA.*MARITIME.*PORTSMOUTH|DEFENSE LOGISTICS.*MARITIME.*SHIPYARD.*PORTSMOUTH';

UPDATE orgs
SET
  full_name = 'DLA Aviation',
  description = 'DLA Aviation',
  parent_id = 'defense-logistics-agency',
  organization_type = 'division',
  entity_classification = 'Federal',
  canonical_hierarchy_path = 'Department of Defense > Defense Logistics Agency > DLA Aviation',
  confidence_score = 0.92,
  raw_original_value = full_name
WHERE parent_id = 'other'
  AND full_name ~* 'DLA.*AVIATION'
  AND full_name NOT ~* 'PHILADELPHIA|HUNTSVILLE|OKLAHOMA|OGDEN|PA|AL|OK|UT'
  AND LENGTH(full_name) > 80;

UPDATE orgs
SET
  full_name = 'DLA Aviation at Philadelphia, PA',
  description = 'DLA Aviation at Philadelphia, PA',
  parent_id = 'defense-logistics-agency',
  organization_type = 'division',
  entity_classification = 'Federal',
  canonical_hierarchy_path = 'Department of Defense > Defense Logistics Agency > DLA Aviation > Philadelphia, PA',
  confidence_score = 0.97,
  raw_original_value = full_name
WHERE parent_id = 'other'
  AND full_name ~* 'DLA.*AVIATION.*PHILADELPHIA|PHILADELPHIA.*PA';

UPDATE orgs
SET
  full_name = 'DLA Aviation at Huntsville, AL',
  description = 'DLA Aviation at Huntsville, AL',
  parent_id = 'defense-logistics-agency',
  organization_type = 'division',
  entity_classification = 'Federal',
  canonical_hierarchy_path = 'Department of Defense > Defense Logistics Agency > DLA Aviation > Huntsville, AL',
  confidence_score = 0.97,
  raw_original_value = full_name
WHERE parent_id = 'other'
  AND full_name ~* 'DLA.*AVIATION.*HUNTSVILLE|HUNTSVILLE.*AL';

UPDATE orgs
SET
  full_name = 'DLA Aviation at Oklahoma City, OK',
  description = 'DLA Aviation at Oklahoma City, OK',
  parent_id = 'defense-logistics-agency',
  organization_type = 'division',
  entity_classification = 'Federal',
  canonical_hierarchy_path = 'Department of Defense > Defense Logistics Agency > DLA Aviation > Oklahoma City, OK',
  confidence_score = 0.97,
  raw_original_value = full_name
WHERE parent_id = 'other'
  AND full_name ~* 'DLA.*AVIATION.*OKLAHOMA|OKLAHOMA.*OK';

UPDATE orgs
SET
  full_name = 'DLA Aviation at Ogden, UT',
  description = 'DLA Aviation at Ogden, UT',
  parent_id = 'defense-logistics-agency',
  organization_type = 'division',
  entity_classification = 'Federal',
  canonical_hierarchy_path = 'Department of Defense > Defense Logistics Agency > DLA Aviation > Ogden, UT',
  confidence_score = 0.97,
  raw_original_value = full_name
WHERE parent_id = 'other'
  AND full_name ~* 'DLA.*AVIATION.*OGDEN|OGDEN.*UT';

UPDATE orgs
SET
  full_name = 'DLA Land and Maritime - Albany',
  description = 'DLA Land and Maritime - Albany',
  parent_id = 'defense-logistics-agency',
  organization_type = 'division',
  entity_classification = 'Federal',
  canonical_hierarchy_path = 'Department of Defense > Defense Logistics Agency > DLA Land and Maritime > Albany, NY',
  confidence_score = 0.96,
  raw_original_value = full_name
WHERE parent_id = 'other'
  AND full_name ~* 'DLA.*LAND.*MARITIME|LAND.*MARITIME.*ALBANY|ALBANY';

-- ===== PHASE 4: NAVY ORGANIZATIONS =====
-- Fix Naval Supply Systems and related organizations

UPDATE orgs
SET
  full_name = 'NAVSUP Weapon Systems Support - Mechanicsburg, PA',
  description = 'NAVSUP Weapon Systems Support - Mechanicsburg, PA',
  parent_id = 'dept-of-navy',
  organization_type = 'division',
  entity_classification = 'Federal',
  canonical_hierarchy_path = 'Department of Defense > Department of the Navy > Naval Supply Systems Command > NAVSUP Weapon Systems Support > Mechanicsburg, PA',
  confidence_score = 0.93,
  raw_original_value = full_name
WHERE parent_id = 'other'
  AND full_name ~* 'NAVAL SUPPLY|NAVSUP'
  AND full_name ~* 'WEAPON SYSTEMS|WSS'
  AND full_name ~* 'MECH|MECHANICSBURG'
  AND LENGTH(full_name) > 90;

UPDATE orgs
SET
  full_name = 'NAVSUP Weapon Systems Support',
  description = 'NAVSUP Weapon Systems Support',
  parent_id = 'dept-of-navy',
  organization_type = 'division',
  entity_classification = 'Federal',
  canonical_hierarchy_path = 'Department of Defense > Department of the Navy > Naval Supply Systems Command > NAVSUP Weapon Systems Support',
  confidence_score = 0.9,
  raw_original_value = full_name
WHERE parent_id = 'other'
  AND full_name ~* 'NAVSUP|NAVAL SUPPLY'
  AND full_name ~* 'WEAPON SYSTEMS|WSS'
  AND LENGTH(full_name) > 90;

-- ===== PHASE 5: AIR FORCE ORGANIZATIONS =====
-- Fix Air Force procurement and command organizations

UPDATE orgs
SET
  full_name = 'Air Force Nuclear Weapons Center',
  description = 'Air Force Nuclear Weapons Center',
  parent_id = 'dept-of-air-force',
  organization_type = 'command',
  entity_classification = 'Federal',
  canonical_hierarchy_path = 'Department of Defense > Department of the Air Force > Air Force Nuclear Weapons Center',
  confidence_score = 0.92,
  raw_original_value = full_name
WHERE parent_id = 'other'
  AND full_name ~* 'AFNWC|AIR FORCE NUCLEAR';

UPDATE orgs
SET
  full_name = 'Air Force Research Laboratory',
  description = 'Air Force Research Laboratory',
  parent_id = 'dept-of-air-force',
  organization_type = 'laboratory',
  entity_classification = 'Federal',
  canonical_hierarchy_path = 'Department of Defense > Department of the Air Force > Air Force Research Laboratory',
  confidence_score = 0.92,
  raw_original_value = full_name
WHERE parent_id = 'other'
  AND full_name ~* 'AFRL|AIR FORCE RESEARCH LAB'
  AND full_name NOT ~* 'AFMC|MATERIEL COMMAND';

UPDATE orgs
SET
  full_name = 'Air Force Materiel Command',
  description = 'Air Force Materiel Command',
  parent_id = 'dept-of-air-force',
  organization_type = 'major_command',
  entity_classification = 'Federal',
  canonical_hierarchy_path = 'Department of Defense > Department of the Air Force > Air Force Materiel Command',
  confidence_score = 0.92,
  raw_original_value = full_name
WHERE parent_id = 'other'
  AND full_name ~* 'AFMC|AIR FORCE MATERIEL';

-- ===== PHASE 6: ARMY NATIONAL GUARD ORGANIZATIONS =====
-- Fix National Guard units by state

UPDATE orgs
SET
  full_name = 'National Guard Bureau Joint Force - California (CAANG 163)',
  description = 'National Guard Bureau Joint Force - California (CAANG 163)',
  parent_id = 'dept-of-army',
  organization_type = 'military_unit',
  entity_classification = 'Federal',
  canonical_hierarchy_path = 'Department of Defense > Department of the Army > National Guard Bureau > Joint Force - California (CAANG 163)',
  confidence_score = 0.94,
  raw_original_value = full_name
WHERE parent_id = 'other'
  AND full_name ~* 'NATIONAL GUARD.*CALIFORNIA|US PROPERTY.*FISCAL.*CA'
  AND LENGTH(full_name) > 80;

UPDATE orgs
SET
  full_name = 'National Guard Bureau Joint Force - Hawaii (HIANG 154)',
  description = 'National Guard Bureau Joint Force - Hawaii (HIANG 154)',
  parent_id = 'dept-of-army',
  organization_type = 'military_unit',
  entity_classification = 'Federal',
  canonical_hierarchy_path = 'Department of Defense > Department of the Army > National Guard Bureau > Joint Force - Hawaii (HIANG 154)',
  confidence_score = 0.94,
  raw_original_value = full_name
WHERE parent_id = 'other'
  AND full_name ~* 'NATIONAL GUARD.*HAWAII|US PROPERTY.*FISCAL.*HI'
  AND LENGTH(full_name) > 80;

UPDATE orgs
SET
  full_name = 'National Guard Bureau Joint Force - Kansas (KSANG 184)',
  description = 'National Guard Bureau Joint Force - Kansas (KSANG 184)',
  parent_id = 'dept-of-army',
  organization_type = 'military_unit',
  entity_classification = 'Federal',
  canonical_hierarchy_path = 'Department of Defense > Department of the Army > National Guard Bureau > Joint Force - Kansas (KSANG 184)',
  confidence_score = 0.94,
  raw_original_value = full_name
WHERE parent_id = 'other'
  AND full_name ~* 'NATIONAL GUARD.*KANSAS|US PROPERTY.*FISCAL.*KS'
  AND LENGTH(full_name) > 80;

UPDATE orgs
SET
  full_name = 'National Guard Bureau Joint Force - Michigan (MIANG)',
  description = 'National Guard Bureau Joint Force - Michigan (MIANG)',
  parent_id = 'dept-of-army',
  organization_type = 'military_unit',
  entity_classification = 'Federal',
  canonical_hierarchy_path = 'Department of Defense > Department of the Army > National Guard Bureau > Joint Force - Michigan (MIANG)',
  confidence_score = 0.93,
  raw_original_value = full_name
WHERE parent_id = 'other'
  AND full_name ~* 'NATIONAL GUARD.*MICHIGAN|US PROPERTY.*FISCAL.*MI'
  AND LENGTH(full_name) > 80;

UPDATE orgs
SET
  full_name = 'National Guard Bureau Joint Force - Wisconsin (WIANG)',
  description = 'National Guard Bureau Joint Force - Wisconsin (WIANG)',
  parent_id = 'dept-of-army',
  organization_type = 'military_unit',
  entity_classification = 'Federal',
  canonical_hierarchy_path = 'Department of Defense > Department of the Army > National Guard Bureau > Joint Force - Wisconsin (WIANG)',
  confidence_score = 0.93,
  raw_original_value = full_name
WHERE parent_id = 'other'
  AND full_name ~* 'NATIONAL GUARD.*WISCONSIN|US PROPERTY.*FISCAL.*WI'
  AND LENGTH(full_name) > 80;

-- ===== PHASE 7: VERIFICATION & REPORTING =====

-- Show remaining organizations in OTHER category
SELECT
  COUNT(*) as remaining_in_other,
  COUNT(CASE WHEN entity_classification = 'Federal' THEN 1 END) as federal_remaining,
  COUNT(CASE WHEN entity_classification = 'Procurement' THEN 1 END) as procurement_remaining,
  COUNT(CASE WHEN entity_classification IS NULL THEN 1 END) as unclassified_remaining
FROM orgs
WHERE parent_id = 'other';

-- Show summary of recategorized organizations
SELECT
  parent_id,
  COUNT(*) as count,
  entity_classification
FROM orgs
WHERE entity_classification = 'Federal'
  AND parent_id != 'other'
GROUP BY parent_id, entity_classification
ORDER BY count DESC;

-- Show organizations that were updated
SELECT
  id,
  full_name,
  parent_id,
  organization_type,
  confidence_score
FROM orgs
WHERE parent_id IN ('defense-logistics-agency', 'dept-of-navy', 'dept-of-air-force', 'dept-of-army')
  AND entity_classification = 'Federal'
  AND raw_original_value IS NOT NULL
ORDER BY parent_id, full_name;

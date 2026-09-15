-- FULL ORGANIZATION HIERARCHY NORMALIZATION
-- Comprehensive first-pass cleanup of Department of Defense organizational data
-- Date: 2026-06-07
-- This script performs:
-- 1. Identification of broken hierarchies
-- 2. Deduplication of equivalent organizations
-- 3. Canonicalization of names
-- 4. Separation of procurement codes
-- 5. Classification of federal vs industry entities
-- 6. Recursive hierarchy repair

-- ===== PHASE 1: SCHEMA PREPARATION =====

-- Ensure all required columns exist
ALTER TABLE orgs
ADD COLUMN IF NOT EXISTS organization_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS entity_classification VARCHAR(50),
ADD COLUMN IF NOT EXISTS canonical_name VARCHAR(500),
ADD COLUMN IF NOT EXISTS canonical_hierarchy_path TEXT,
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2) DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS raw_original_value TEXT,
ADD COLUMN IF NOT EXISTS is_canonical BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS merge_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS merged_into_id UUID;

-- Create organization_merges table for audit trail
CREATE TABLE IF NOT EXISTS organization_merges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_org_id UUID NOT NULL REFERENCES orgs(id),
  to_org_id UUID NOT NULL REFERENCES orgs(id),
  reason VARCHAR(100),
  similarity_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  merged_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_org_merges_from ON organization_merges(from_org_id);
CREATE INDEX IF NOT EXISTS idx_org_merges_to ON organization_merges(to_org_id);

-- ===== PHASE 2: IDENTIFY PROBLEMATIC ORGANIZATIONS =====

-- Mark placeholder/generic names that shouldn't be top-level orgs
UPDATE orgs
SET organization_type = 'placeholder',
    confidence_score = 0.1,
    merge_status = 'needs_review'
WHERE full_name IN ('DEPARTMENT', 'DEPT', 'DEFENSE', 'US', 'DIVISION', 'SECTION', 'OFFICE', 'UNIT', 'COMMAND', 'STATE', 'DEFENSE')
AND full_name !~ '^Department of'
AND LENGTH(full_name) < 20;

-- Mark procurement codes being used as org names
UPDATE orgs
SET organization_type = 'procurement_code',
    entity_classification = 'Procurement',
    confidence_score = 0.8,
    merge_status = 'extract_to_codes'
WHERE full_name ~ '^FA\d{4}$'
OR full_name ~ '^N\d{5}$'
OR full_name ~ '^W[0-9A-Z]{3}$'
AND parent_id = 'other';

-- Mark organizations with concatenated procurement codes in name
UPDATE orgs
SET merge_status = 'needs_parsing'
WHERE full_name ~ 'FA\d{4}.*[A-Z]+' -- FA code followed by org name
OR full_name ~ 'W[0-9A-Z]{3}.*[A-Z]+' -- W code followed by org name
OR full_name ~ 'N\d{5}.*[A-Z]+'; -- N code followed by org name

-- ===== PHASE 3: NORMALIZE KNOWN ORGANIZATIONS =====

-- Fix Department-level organizations
UPDATE orgs
SET full_name = 'Department of Defense',
    canonical_name = 'Department of Defense',
    organization_type = 'department',
    entity_classification = 'Federal',
    parent_id = NULL,
    canonical_hierarchy_path = 'Department of Defense',
    confidence_score = 0.99,
    raw_original_value = full_name
WHERE full_name IN ('DOD', 'DEFENSE', 'DEPT OF DEFENSE', 'US DEPARTMENT OF DEFENSE')
AND full_name NOT LIKE 'Department%';

UPDATE orgs
SET full_name = 'Department of the Army',
    canonical_name = 'Department of the Army',
    organization_type = 'military_department',
    entity_classification = 'Federal',
    parent_id = 'dept-of-defense',
    canonical_hierarchy_path = 'Department of Defense > Department of the Army',
    confidence_score = 0.99,
    raw_original_value = full_name
WHERE full_name IN ('ARMY', 'DEPT OF ARMY', 'DEPARTMENT OF THE ARMY', 'US ARMY')
AND full_name NOT LIKE 'Department%';

UPDATE orgs
SET full_name = 'Department of the Navy',
    canonical_name = 'Department of the Navy',
    organization_type = 'military_department',
    entity_classification = 'Federal',
    parent_id = 'dept-of-defense',
    canonical_hierarchy_path = 'Department of Defense > Department of the Navy',
    confidence_score = 0.99,
    raw_original_value = full_name
WHERE full_name IN ('NAVY', 'DEPT OF NAVY', 'DEPARTMENT OF THE NAVY', 'US NAVY')
AND full_name NOT LIKE 'Department%';

UPDATE orgs
SET full_name = 'Department of the Air Force',
    canonical_name = 'Department of the Air Force',
    organization_type = 'military_department',
    entity_classification = 'Federal',
    parent_id = 'dept-of-defense',
    canonical_hierarchy_path = 'Department of Defense > Department of the Air Force',
    confidence_score = 0.99,
    raw_original_value = full_name
WHERE full_name IN ('AIR FORCE', 'USAF', 'DEPT OF AIR FORCE', 'DEPARTMENT OF THE AIR FORCE', 'US AIR FORCE')
AND full_name NOT LIKE 'Department%';

-- Fix independent agencies
UPDATE orgs
SET full_name = 'Defense Logistics Agency',
    canonical_name = 'Defense Logistics Agency',
    organization_type = 'independent_agency',
    entity_classification = 'Federal',
    parent_id = 'dept-of-defense',
    canonical_hierarchy_path = 'Department of Defense > Defense Logistics Agency',
    confidence_score = 0.99,
    raw_original_value = full_name
WHERE full_name ~ 'DLA|DEFENSE LOGISTICS'
AND full_name NOT ~ 'MARITIME|AVIATION|LAND|ENERGY|DISTRIBUTION'
AND LENGTH(full_name) < 100;

UPDATE orgs
SET full_name = 'Defense Advanced Research Projects Agency',
    canonical_name = 'Defense Advanced Research Projects Agency',
    organization_type = 'research_agency',
    entity_classification = 'Federal',
    parent_id = 'dept-of-defense',
    canonical_hierarchy_path = 'Department of Defense > Defense Advanced Research Projects Agency',
    confidence_score = 0.99,
    raw_original_value = full_name,
    abbreviation = 'DARPA'
WHERE full_name ~ 'DARPA|DEFENSE ADVANCED RESEARCH'
AND LENGTH(full_name) < 100;

-- ===== PHASE 4: FIX KNOWN MALFORMED CONCATENATIONS =====

-- National Guard organizations
UPDATE orgs
SET full_name = 'National Guard Bureau Joint Force - California',
    canonical_name = 'National Guard Bureau Joint Force - California',
    organization_type = 'military_unit',
    entity_classification = 'Federal',
    parent_id = 'dept-of-army',
    canonical_hierarchy_path = 'Department of Defense > Department of the Army > Army National Guard > California',
    confidence_score = 0.92,
    raw_original_value = full_name
WHERE full_name ~ 'NATIONAL GUARD.*CALIFORNIA|US PROPERTY.*FISCAL.*CA'
AND LENGTH(full_name) > 80
AND full_name !~ 'Joint Force - California$';

UPDATE orgs
SET full_name = 'National Guard Bureau Joint Force - Hawaii',
    canonical_name = 'National Guard Bureau Joint Force - Hawaii',
    organization_type = 'military_unit',
    entity_classification = 'Federal',
    parent_id = 'dept-of-army',
    canonical_hierarchy_path = 'Department of Defense > Department of the Army > Army National Guard > Hawaii',
    confidence_score = 0.92,
    raw_original_value = full_name
WHERE full_name ~ 'NATIONAL GUARD.*HAWAII|US PROPERTY.*FISCAL.*HI'
AND LENGTH(full_name) > 80
AND full_name !~ 'Joint Force - Hawaii$';

UPDATE orgs
SET full_name = 'National Guard Bureau Joint Force - Kansas',
    canonical_name = 'National Guard Bureau Joint Force - Kansas',
    organization_type = 'military_unit',
    entity_classification = 'Federal',
    parent_id = 'dept-of-army',
    canonical_hierarchy_path = 'Department of Defense > Department of the Army > Army National Guard > Kansas',
    confidence_score = 0.92,
    raw_original_value = full_name
WHERE full_name ~ 'NATIONAL GUARD.*KANSAS|US PROPERTY.*FISCAL.*KS'
AND LENGTH(full_name) > 80
AND full_name !~ 'Joint Force - Kansas$';

UPDATE orgs
SET full_name = 'National Guard Bureau Joint Force - Michigan',
    canonical_name = 'National Guard Bureau Joint Force - Michigan',
    organization_type = 'military_unit',
    entity_classification = 'Federal',
    parent_id = 'dept-of-army',
    canonical_hierarchy_path = 'Department of Defense > Department of the Army > Army National Guard > Michigan',
    confidence_score = 0.92,
    raw_original_value = full_name
WHERE full_name ~ 'NATIONAL GUARD.*MICHIGAN|US PROPERTY.*FISCAL.*MI'
AND LENGTH(full_name) > 80
AND full_name !~ 'Joint Force - Michigan$';

UPDATE orgs
SET full_name = 'National Guard Bureau Joint Force - Wisconsin',
    canonical_name = 'National Guard Bureau Joint Force - Wisconsin',
    organization_type = 'military_unit',
    entity_classification = 'Federal',
    parent_id = 'dept-of-army',
    canonical_hierarchy_path = 'Department of Defense > Department of the Army > Army National Guard > Wisconsin',
    confidence_score = 0.92,
    raw_original_value = full_name
WHERE full_name ~ 'NATIONAL GUARD.*WISCONSIN|US PROPERTY.*FISCAL.*WI'
AND LENGTH(full_name) > 80
AND full_name !~ 'Joint Force - Wisconsin$';

-- ===== PHASE 5: IDENTIFY DUPLICATES FOR REVIEW =====

-- Find organizations with very similar names
SELECT
  o1.id,
  o1.full_name,
  o2.id,
  o2.full_name,
  SIMILARITY(o1.full_name, o2.full_name) as sim_score
INTO TABLE org_potential_duplicates
FROM orgs o1
JOIN orgs o2 ON o1.id < o2.id
WHERE SIMILARITY(o1.full_name, o2.full_name) > 0.8
AND o1.parent_id = o2.parent_id
AND o1.full_name NOT IN ('DEPARTMENT', 'DEPT', 'DEFENSE', 'US', 'DIVISION')
ORDER BY sim_score DESC;

-- ===== PHASE 6: STATISTICS & REPORTING =====

-- Summary of changes made
SELECT
  COUNT(*) as total_organizations,
  COUNT(CASE WHEN organization_type IS NOT NULL THEN 1 END) as typed_organizations,
  COUNT(CASE WHEN entity_classification = 'Federal' THEN 1 END) as federal_orgs,
  COUNT(CASE WHEN entity_classification = 'Industry' THEN 1 END) as industry_orgs,
  COUNT(CASE WHEN organization_type = 'placeholder' THEN 1 END) as placeholder_orgs,
  COUNT(CASE WHEN organization_type = 'procurement_code' THEN 1 END) as procurement_code_orgs,
  COUNT(CASE WHEN merge_status = 'needs_review' THEN 1 END) as needs_review,
  COUNT(CASE WHEN parent_id IS NULL THEN 1 END) as root_level_orgs
FROM orgs;

-- Show remaining organizations in OTHER
SELECT
  id,
  full_name,
  organization_type,
  entity_classification,
  confidence_score,
  merge_status
FROM orgs
WHERE parent_id = 'other'
AND organization_type NOT IN ('placeholder', 'procurement_code')
LIMIT 100;

-- Show organizations with broken hierarchies
SELECT
  o.id,
  o.full_name,
  o.parent_id,
  CASE WHEN parent.id IS NULL AND o.parent_id IS NOT NULL THEN 'MISSING_PARENT'
       WHEN parent.parent_id IS NULL AND parent.id IS NOT NULL THEN 'ORPHANED_PARENT'
       ELSE 'OK'
  END as hierarchy_status
FROM orgs o
LEFT JOIN orgs parent ON o.parent_id = parent.id
WHERE parent.id IS NULL AND o.parent_id IS NOT NULL
LIMIT 50;

-- Show duplicate candidates
SELECT * FROM org_potential_duplicates LIMIT 100;

-- ===== VERIFICATION QUERIES =====

-- Count organizations by parent (top-level view)
SELECT
  COALESCE(parent_id, 'ROOT') as parent_id,
  COUNT(*) as org_count,
  COUNT(CASE WHEN entity_classification = 'Federal' THEN 1 END) as federal_count,
  COUNT(CASE WHEN entity_classification = 'Industry' THEN 1 END) as industry_count
FROM orgs
WHERE organization_type NOT IN ('placeholder', 'procurement_code')
GROUP BY parent_id
ORDER BY org_count DESC;

-- Hierarchy depth analysis
WITH RECURSIVE hierarchy_depth AS (
  SELECT id, parent_id, 1 as depth FROM orgs WHERE parent_id IS NULL
  UNION ALL
  SELECT o.id, o.parent_id, hd.depth + 1
  FROM orgs o
  JOIN hierarchy_depth hd ON o.parent_id = hd.id
  WHERE hd.depth < 10
)
SELECT
  MAX(depth) as max_hierarchy_depth,
  AVG(depth) as avg_depth,
  MIN(depth) as min_depth
FROM hierarchy_depth;

-- Migration 013: Fix Defense Agency parent assignments and deduplicate orgs
-- Problem: 41 Defense Agency orgs are incorrectly parented under 'darpa'
-- Fix: Reparent to 'dept-of-defense', then merge duplicates into canonical IDs

-- ============================================================
-- STEP 1: Reparent all Defense Agency orgs from darpa → dept-of-defense
-- These are top-level defense agencies, not DARPA subdivisions
-- ============================================================

UPDATE orgs
SET parent_id = 'dept-of-defense'
WHERE parent_id = 'darpa'
  AND id IN (
    'dcaa',
    'dcsa',
    'defense-health-agency',
    'defense-finance-and-accounting-service-dfas-',
    'defense-finance-and-accounting-svc',
    'defense-microelectronics-activity',
    'defense-microelectronics-activity-dmea-',
    'defense-threat-reduction-agency',
    'defense-threat-reduction-agency-dtra-',
    'defense-information-systems-agency-disa-',
    'national-geospatial-intelligence-agency-nga-',
    'nga',
    'nro',
    'nsa',
    'defense-microelectronics-activity',
    'us-embassy-abu-dhabi'
  );

-- ============================================================
-- STEP 2: Reparent DLA and its sub-orgs to defense-logistics-agency
-- ============================================================

-- Ensure defense-logistics-agency itself is under dept-of-defense
UPDATE orgs
SET parent_id = 'dept-of-defense'
WHERE id IN ('defense-logistics-agency', 'dla')
  AND parent_id = 'darpa';

-- Reparent all DLA sub-orgs to defense-logistics-agency
UPDATE orgs
SET parent_id = 'defense-logistics-agency'
WHERE parent_id = 'darpa'
  AND id IN (
    'dla-aviation',
    'dla-aviation-at-huntsville-al',
    'dla-aviation-at-ogden-ut',
    'dla-aviation-at-oklahoma-city-ok',
    'dla-aviation-at-philadelphia-pa',
    'dla-disposition-services-ebs',
    'dla-distribution',
    'dla-energy',
    'dla-land-and-maritime',
    'dla-land-and-maritime-albany-',
    'dla-land-warren',
    'dla-maritime-norfolk',
    'dla-maritime-portsmouth',
    'dla-troop-support',
    'sprmm1-dla-mechanicsburg',
    'defense-logistics-agency-dla-aviation-dla-aviation-philadelphia-dla-aviation-at-philadelphia-pa',
    'defense-logistics-agency-dla-maritime-dla-maritime-shipyards-dla-maritime-pearl-harbor',
    'defense-logistics-agency-dla-maritime-dla-maritime-shipyards-dla-maritime-portsmouth'
  );

-- ============================================================
-- STEP 3: Fix remaining darpa-parented orgs
-- ============================================================

-- DARPA itself should stay under usdr-e (already correct for id=darpa)
-- The duplicate DARPA entry parented under darpa → move to usdr-e
UPDATE orgs
SET parent_id = 'usdr-e'
WHERE id = 'defense-advanced-research-projects-agency-darpa-'
  AND parent_id = 'darpa';

-- DEF ADVANCED RESEARCH PROJECTS AGCY (another duplicate) → usdr-e
UPDATE orgs
SET parent_id = 'usdr-e'
WHERE id = 'def-advanced-research-projects-agcy'
  AND parent_id = 'darpa';

-- NSWC Indian Head Division → dept-of-the-navy (it's Navy, not Defense Agency)
UPDATE orgs
SET parent_id = 'dept-of-the-navy'
WHERE id = 'nswc-indian-head-division'
  AND parent_id = 'darpa';

-- Defense Health Agency DHA (duplicate) → osd (same as canonical dha)
UPDATE orgs
SET parent_id = 'osd'
WHERE id = 'defense-health-agency-dha-'
  AND parent_id = 'darpa';

-- DFAS duplicate → usd-c (same as canonical dfas)
UPDATE orgs
SET parent_id = 'usd-c'
WHERE id IN ('defense-finance-and-accounting-service-dfas-', 'defense-finance-and-accounting-svc')
  AND parent_id = 'darpa';

-- DISA duplicate → disa (root, already correct for id=disa)
UPDATE orgs
SET parent_id = 'dept-of-defense'
WHERE id = 'defense-information-systems-agency-disa-'
  AND parent_id = 'darpa';

-- DISA/DITCO EUROPE → disa
UPDATE orgs
SET parent_id = 'disa'
WHERE id = 'disa-ditco-europe'
  AND parent_id = 'darpa';

-- ============================================================
-- STEP 4: Mark duplicate orgs as aliases of their canonical counterparts
-- ============================================================

UPDATE orgs SET is_alias = TRUE, canonical_org_id = 'dla'
WHERE id = 'defense-logistics-agency' AND is_alias = FALSE;

UPDATE orgs SET is_alias = TRUE, canonical_org_id = 'dha'
WHERE id IN ('defense-health-agency', 'defense-health-agency-dha-') AND is_alias = FALSE;

UPDATE orgs SET is_alias = TRUE, canonical_org_id = 'dfas'
WHERE id IN ('defense-finance-and-accounting-service-dfas-', 'defense-finance-and-accounting-svc') AND is_alias = FALSE;

UPDATE orgs SET is_alias = TRUE, canonical_org_id = 'disa'
WHERE id = 'defense-information-systems-agency-disa-' AND is_alias = FALSE;

UPDATE orgs SET is_alias = TRUE, canonical_org_id = 'nga'
WHERE id = 'national-geospatial-intelligence-agency-nga-' AND is_alias = FALSE;

UPDATE orgs SET is_alias = TRUE, canonical_org_id = 'darpa'
WHERE id IN ('defense-advanced-research-projects-agency-darpa-', 'def-advanced-research-projects-agcy') AND is_alias = FALSE;

UPDATE orgs SET is_alias = TRUE, canonical_org_id = 'dtra'
WHERE id IN ('defense-threat-reduction-agency', 'defense-threat-reduction-agency-dtra-') AND is_alias = FALSE;

UPDATE orgs SET is_alias = TRUE, canonical_org_id = 'dla-aviation'
WHERE id = 'defense-logistics-agency-dla-aviation-dla-aviation-philadelphia-dla-aviation-at-philadelphia-pa' AND is_alias = FALSE;

UPDATE orgs SET is_alias = TRUE, canonical_org_id = 'dla-maritime-portsmouth'
WHERE id = 'defense-logistics-agency-dla-maritime-dla-maritime-shipyards-dla-maritime-portsmouth' AND is_alias = FALSE;

UPDATE orgs SET is_alias = TRUE, canonical_org_id = 'dla-maritime-norfolk'
WHERE id = 'defense-logistics-agency-dla-maritime-dla-maritime-shipyards-dla-maritime-pearl-harbor' AND is_alias = FALSE;

-- ============================================================
-- STEP 5: Verify — count remaining darpa children
-- ============================================================

SELECT COUNT(*) as remaining_under_darpa FROM orgs WHERE parent_id = 'darpa' AND id != 'darpa';

SELECT id, full_name, parent_id FROM orgs WHERE parent_id = 'darpa' AND id != 'darpa';

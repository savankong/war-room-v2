-- Migration 014: Fix remaining Defense Health Agency sub-org
UPDATE orgs
SET parent_id = 'defense-health-agency'
WHERE id = 'defense-health-agency-hcd-west'
  AND parent_id = 'darpa';

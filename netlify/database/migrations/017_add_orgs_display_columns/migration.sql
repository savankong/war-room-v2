-- Migration 017: Add missing display columns to orgs table
-- organization_type and abs_hierarchy_level were referenced in app code
-- but never added via a numbered migration.

ALTER TABLE orgs ADD COLUMN IF NOT EXISTS organization_type   VARCHAR(100);
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS abs_hierarchy_level INTEGER;

CREATE INDEX IF NOT EXISTS idx_orgs_abs_hierarchy_level ON orgs(abs_hierarchy_level);
CREATE INDEX IF NOT EXISTS idx_orgs_organization_type   ON orgs(organization_type);

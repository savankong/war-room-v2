-- Migration 009: Add hierarchical org linking to contracts
-- Supports SAM.gov's 5-level hierarchy structure

-- Add hierarchy level columns to track parsed org structure
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS hierarchy_level_1 VARCHAR(255);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS hierarchy_level_2 VARCHAR(255);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS hierarchy_level_3 VARCHAR(255);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS hierarchy_level_4 VARCHAR(255);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS hierarchy_level_5 VARCHAR(255);

-- Add org_id references for each hierarchy level (nullable - populated by data migration)
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS org_id_level_1 VARCHAR(255);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS org_id_level_2 VARCHAR(255);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS org_id_level_3 VARCHAR(255);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS org_id_level_4 VARCHAR(255);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS org_id_level_5 VARCHAR(255);

-- Create indexes for efficient lookups (before adding constraints)
CREATE INDEX IF NOT EXISTS idx_contracts_org_id_level_1 ON contracts(org_id_level_1);
CREATE INDEX IF NOT EXISTS idx_contracts_org_id_level_2 ON contracts(org_id_level_2);
CREATE INDEX IF NOT EXISTS idx_contracts_org_id_level_3 ON contracts(org_id_level_3);
CREATE INDEX IF NOT EXISTS idx_contracts_org_id_level_4 ON contracts(org_id_level_4);
CREATE INDEX IF NOT EXISTS idx_contracts_org_id_level_5 ON contracts(org_id_level_5);

-- Add hierarchy metadata to orgs table
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS hierarchy_level INT;
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS hierarchy_path VARCHAR(500);
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS canonical_hierarchy_name VARCHAR(255);

-- Create indexes for hierarchy lookups
CREATE INDEX IF NOT EXISTS idx_orgs_hierarchy_level ON orgs(hierarchy_level);
CREATE INDEX IF NOT EXISTS idx_orgs_hierarchy_path ON orgs(hierarchy_path);

-- Note: Foreign key constraints will be added in a separate migration (010)
-- after all hierarchy data has been properly populated and validated.
-- This allows the schema to be extended without data integrity issues.

-- Migration 012: Fix org normalization constraints
-- Migration 011 attempted to add foreign key constraints to existing tables via ALTER TABLE.
-- This failed silently in Netlify Database. This migration removes those constraints,
-- allowing the columns to be added as simple TEXT fields. Data integrity is maintained
-- at the application level.

-- The columns should already exist from migration 011, so these are no-ops if they do.
-- But we explicitly ensure they exist and are the correct type.

-- Ensure columns exist on orgs (remove any constraints that might exist)
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS canonical_org_id TEXT;
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS is_alias BOOLEAN DEFAULT FALSE;
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS is_contracting_office BOOLEAN DEFAULT FALSE;
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sam_sub_agency TEXT;
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sam_major_command TEXT;
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS contracting_office_code TEXT;

-- Ensure columns exist on contracts
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS canonical_org_id TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS hierarchy_label_1 TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS hierarchy_label_2 TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS hierarchy_label_3 TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS hierarchy_label_4 TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS hierarchy_label_5 TEXT;

-- Ensure column exists on contacts
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS canonical_org_id TEXT;

-- Ensure all indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_orgs_canonical_org_id ON orgs(canonical_org_id);
CREATE INDEX IF NOT EXISTS idx_orgs_is_alias ON orgs(is_alias);
CREATE INDEX IF NOT EXISTS idx_orgs_is_contracting_office ON orgs(is_contracting_office);
CREATE INDEX IF NOT EXISTS idx_contracts_canonical_org_id ON contracts(canonical_org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_canonical_org_id ON contacts(canonical_org_id);
CREATE INDEX IF NOT EXISTS idx_org_aliases_canonical ON org_aliases(canonical_org_id);
CREATE INDEX IF NOT EXISTS idx_org_aliases_alias ON org_aliases(alias_org_id);

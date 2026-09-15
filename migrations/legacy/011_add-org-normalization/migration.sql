-- Migration 011: Add organization normalization and deduplication support
-- Supports cross-linkage of Signals/Organizations/Stakeholders via canonical_org_id
-- Tracks organization aliases (multiple slugs → single canonical org)
-- Adds hierarchy_label columns for human-readable breadcrumb display

-- 1. CREATE ORG_ALIASES TABLE
-- Tracks multiple slugs/identifiers that map to a single canonical org
CREATE TABLE IF NOT EXISTS org_aliases (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  canonical_org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  alias_org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  alias_type TEXT, -- 'slug_variant', 'sub_agency_name', 'legacy_name', etc.
  source TEXT, -- Where this alias came from (SAM.gov, internal, etc.)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT no_self_alias CHECK (canonical_org_id != alias_org_id),
  UNIQUE(canonical_org_id, alias_org_id)
);

CREATE INDEX IF NOT EXISTS idx_org_aliases_canonical ON org_aliases(canonical_org_id);
CREATE INDEX IF NOT EXISTS idx_org_aliases_alias ON org_aliases(alias_org_id);

-- 2. ADD COLUMNS TO ORGS TABLE
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS canonical_org_id TEXT REFERENCES orgs(id) ON DELETE SET NULL;
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS is_alias BOOLEAN DEFAULT FALSE;
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS is_contracting_office BOOLEAN DEFAULT FALSE;
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sam_sub_agency TEXT;
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sam_major_command TEXT;
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS contracting_office_code TEXT;

CREATE INDEX IF NOT EXISTS idx_orgs_canonical_org_id ON orgs(canonical_org_id);
CREATE INDEX IF NOT EXISTS idx_orgs_is_alias ON orgs(is_alias);
CREATE INDEX IF NOT EXISTS idx_orgs_is_contracting_office ON orgs(is_contracting_office);

-- 3. ADD COLUMNS TO CONTRACTS TABLE
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS canonical_org_id TEXT REFERENCES orgs(id) ON DELETE SET NULL;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS hierarchy_label_1 TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS hierarchy_label_2 TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS hierarchy_label_3 TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS hierarchy_label_4 TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS hierarchy_label_5 TEXT;

CREATE INDEX IF NOT EXISTS idx_contracts_canonical_org_id ON contracts(canonical_org_id);

-- 4. ADD COLUMNS TO CONTACTS TABLE
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS canonical_org_id TEXT REFERENCES orgs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_canonical_org_id ON contacts(canonical_org_id);

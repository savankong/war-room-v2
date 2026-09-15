-- Migration: Add Organization Parser Fields
-- Purpose: Support normalized organization parsing and classification
-- Date: 2026-06-07

-- Add new columns to orgs table for parser support
ALTER TABLE orgs
ADD COLUMN IF NOT EXISTS organization_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS entity_classification VARCHAR(20),
ADD COLUMN IF NOT EXISTS canonical_hierarchy_path TEXT,
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS raw_original_value TEXT,
ADD COLUMN IF NOT EXISTS installation_id UUID,
ADD COLUMN IF NOT EXISTS is_alias BOOLEAN DEFAULT FALSE;

-- Create organization_aliases table
CREATE TABLE IF NOT EXISTS organization_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  alias_name VARCHAR(255),
  alias_type VARCHAR(50),  -- "acronym", "abbreviation", "historical", "alternate_spelling"
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_org_aliases_canonical_id ON organization_aliases(canonical_org_id);
CREATE INDEX IF NOT EXISTS idx_org_aliases_name ON organization_aliases(alias_name);

-- Create procurement_codes table
CREATE TABLE IF NOT EXISTS procurement_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,  -- FA8204, W6QM, N12345, etc.
  code_type VARCHAR(50),  -- "air_force", "navy", "army", "generic"
  related_org_id UUID REFERENCES orgs(id) ON DELETE SET NULL,
  contracting_office_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_procurement_code ON procurement_codes(code);
CREATE INDEX IF NOT EXISTS idx_procurement_org_id ON procurement_codes(related_org_id);

-- Create org_procurement_relationships table
CREATE TABLE IF NOT EXISTS org_procurement_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  procurement_code_id UUID NOT NULL REFERENCES procurement_codes(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50),  -- "owned_by", "operated_by", "issuing_office"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(org_id, procurement_code_id)
);

CREATE INDEX IF NOT EXISTS idx_org_proc_rel_org_id ON org_procurement_relationships(org_id);
CREATE INDEX IF NOT EXISTS idx_org_proc_rel_code_id ON org_procurement_relationships(procurement_code_id);

-- Create installations table
CREATE TABLE IF NOT EXISTS installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  location_city VARCHAR(100),
  location_state VARCHAR(2),
  location_country VARCHAR(100),
  installation_type VARCHAR(50),  -- "naval_base", "air_force_base", "depot", etc.
  lat DECIMAL(9,6),
  lon DECIMAL(9,6),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_installation_name ON installations(name);
CREATE INDEX IF NOT EXISTS idx_installation_city_state ON installations(location_city, location_state);

-- Create industry_entities table (for non-federal contractors)
CREATE TABLE IF NOT EXISTS industry_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name VARCHAR(255),
  dba_names TEXT[],  -- "Doing Business As"
  parent_company_id UUID REFERENCES industry_entities(id) ON DELETE SET NULL,
  duns_number VARCHAR(20),
  cage_code VARCHAR(5),
  classification VARCHAR(100),  -- "Defense contractor", "Technology", etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_industry_legal_name ON industry_entities(legal_name);
CREATE INDEX IF NOT EXISTS idx_industry_cage_code ON industry_entities(cage_code);

-- Create org_parse_logs table for debugging
CREATE TABLE IF NOT EXISTS org_parse_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_input TEXT,
  parsed_output JSONB,
  confidence_score DECIMAL(3,2),
  status VARCHAR(50),  -- "success", "ambiguous", "failed", "review_needed"
  reviewed_by UUID,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_parse_logs_status ON org_parse_logs(status);
CREATE INDEX IF NOT EXISTS idx_parse_logs_created_at ON org_parse_logs(created_at);

-- Add comment describing new columns
COMMENT ON COLUMN orgs.organization_type IS 'Type of organization: command, division, laboratory, etc.';
COMMENT ON COLUMN orgs.entity_classification IS 'Federal, Industry, or Unknown';
COMMENT ON COLUMN orgs.canonical_hierarchy_path IS 'Full hierarchy path from DoD down to this org';
COMMENT ON COLUMN orgs.confidence_score IS 'Parser confidence score 0.00-1.00';
COMMENT ON COLUMN orgs.raw_original_value IS 'Original unparsed string from source data';
COMMENT ON COLUMN orgs.installation_id IS 'Reference to military installation if applicable';
COMMENT ON COLUMN orgs.is_alias IS 'True if this org is an alias for another canonical org';

-- Backfill known military installation data
INSERT INTO installations (name, location_city, location_state, installation_type)
VALUES
  ('Pearl Harbor', 'Pearl Harbor', 'HI', 'naval_base'),
  ('Mechanicsburg Supply Depot', 'Mechanicsburg', 'PA', 'supply_depot'),
  ('Wright-Patterson AFB', 'Wright-Patterson', 'OH', 'air_force_base'),
  ('Huntsville Research Park', 'Huntsville', 'AL', 'research_facility'),
  ('Oklahoma City Distribution Center', 'Oklahoma City', 'OK', 'distribution_center'),
  ('Ogden Defense Depot', 'Ogden', 'UT', 'defense_depot'),
  ('Philadelphia Distribution Center', 'Philadelphia', 'PA', 'distribution_center'),
  ('Albany Distribution Center', 'Albany', 'NY', 'distribution_center')
ON CONFLICT DO NOTHING;

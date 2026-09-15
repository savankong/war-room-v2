-- ============================================================
-- Migration 007: Normalize DoD Contracting Office Strings
-- ============================================================
-- Adds structured normalized fields to contracts table
-- Parses messy strings like "FA2396 USAF AFMC AFRL PZL AFRL PZLE"
-- into clean, structured components and canonical display names.

ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS contracting_office_code  TEXT,      -- FA2396, N68936, etc
  ADD COLUMN IF NOT EXISTS service_branch            TEXT,      -- USAF, NAVY, ARMY, USSF, etc
  ADD COLUMN IF NOT EXISTS major_command            TEXT,      -- AFMC, ACC, NAVAIR, etc
  ADD COLUMN IF NOT EXISTS agency_or_lab            TEXT,      -- AFRL, DARPA, DISA, etc
  ADD COLUMN IF NOT EXISTS division_or_directorate  TEXT,      -- PZL, PZLE, NAWCAD, etc
  ADD COLUMN IF NOT EXISTS canonical_name           TEXT,      -- "AFRL PZLE Contracting Office (FA2396)"
  ADD COLUMN IF NOT EXISTS normalized_raw           TEXT;      -- cleaned, deduplicated original

-- Index for lookups and grouping by normalized fields
CREATE INDEX IF NOT EXISTS idx_contracting_code    ON contracts(contracting_office_code);
CREATE INDEX IF NOT EXISTS idx_service_branch      ON contracts(service_branch);
CREATE INDEX IF NOT EXISTS idx_major_command       ON contracts(major_command);
CREATE INDEX IF NOT EXISTS idx_agency_or_lab       ON contracts(agency_or_lab);
CREATE INDEX IF NOT EXISTS idx_canonical_name      ON contracts(canonical_name);

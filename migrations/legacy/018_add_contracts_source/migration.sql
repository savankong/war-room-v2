-- Migration 018: Add source column to contracts table
-- Required by sync-usaspending route and org detail contract queries

ALTER TABLE contracts ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS awardee TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS naics_code TEXT;

CREATE INDEX IF NOT EXISTS idx_contracts_source  ON contracts(source);
CREATE INDEX IF NOT EXISTS idx_contracts_awardee ON contracts(awardee);

ALTER TABLE contracts ADD COLUMN IF NOT EXISTS org_id TEXT;

CREATE INDEX IF NOT EXISTS idx_contracts_org_id ON contracts(org_id);

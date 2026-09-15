ALTER TABLE contracts ADD COLUMN IF NOT EXISTS signal_type TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS award_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS external_id TEXT;
CREATE INDEX IF NOT EXISTS idx_contracts_signal_type ON contracts(signal_type);

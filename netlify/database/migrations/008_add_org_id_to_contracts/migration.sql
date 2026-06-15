ALTER TABLE contracts ADD COLUMN IF NOT EXISTS org_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_contracts_org_id ON contracts(org_id);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_contracts_org_id'
  ) THEN
    ALTER TABLE contracts ADD CONSTRAINT fk_contracts_org_id
    FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE SET NULL;
  END IF;
END $$;

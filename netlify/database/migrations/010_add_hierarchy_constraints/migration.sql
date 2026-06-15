-- Migration 010: Add foreign key constraints for hierarchy levels
-- This migration adds constraints after data population

-- Check if constraints exist before adding them (using transaction)
DO $$
BEGIN
  -- Add constraint for level 1 if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_contracts_org_id_level_1'
  ) THEN
    ALTER TABLE contracts
    ADD CONSTRAINT fk_contracts_org_id_level_1
    FOREIGN KEY (org_id_level_1) REFERENCES orgs(id) ON DELETE SET NULL;
  END IF;

  -- Add constraint for level 2 if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_contracts_org_id_level_2'
  ) THEN
    ALTER TABLE contracts
    ADD CONSTRAINT fk_contracts_org_id_level_2
    FOREIGN KEY (org_id_level_2) REFERENCES orgs(id) ON DELETE SET NULL;
  END IF;

  -- Add constraint for level 3 if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_contracts_org_id_level_3'
  ) THEN
    ALTER TABLE contracts
    ADD CONSTRAINT fk_contracts_org_id_level_3
    FOREIGN KEY (org_id_level_3) REFERENCES orgs(id) ON DELETE SET NULL;
  END IF;

  -- Add constraint for level 4 if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_contracts_org_id_level_4'
  ) THEN
    ALTER TABLE contracts
    ADD CONSTRAINT fk_contracts_org_id_level_4
    FOREIGN KEY (org_id_level_4) REFERENCES orgs(id) ON DELETE SET NULL;
  END IF;

  -- Add constraint for level 5 if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_contracts_org_id_level_5'
  ) THEN
    ALTER TABLE contracts
    ADD CONSTRAINT fk_contracts_org_id_level_5
    FOREIGN KEY (org_id_level_5) REFERENCES orgs(id) ON DELETE SET NULL;
  END IF;
END $$;

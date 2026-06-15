-- Add org_id to contracts table to link signals to organizations
ALTER TABLE contracts
ADD COLUMN org_id VARCHAR(255);

-- Add index for efficient lookups
CREATE INDEX idx_contracts_org_id ON contracts(org_id);

-- Add foreign key constraint
ALTER TABLE contracts
ADD CONSTRAINT fk_contracts_org_id
FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE SET NULL;

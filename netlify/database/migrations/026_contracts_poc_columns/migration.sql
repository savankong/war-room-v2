-- Add POC columns to contracts if they don't exist
-- (contracts table was originally created without these columns in older envs)
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS poc           TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS poc_email     TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS alt_poc       TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS alt_poc_email TEXT;

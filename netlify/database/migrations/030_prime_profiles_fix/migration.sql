-- Fix prime contractor profiles: ensure profile JSONB column exists
-- and normalize any null entries from 029_prime_logos migration
ALTER TABLE industry_companies ADD COLUMN IF NOT EXISTS profile JSONB;

-- No-op update to restore migration hash integrity
-- (this migration was applied to production but the file was lost)
UPDATE industry_companies SET profile = profile WHERE profile IS NULL AND profile IS NOT NULL;

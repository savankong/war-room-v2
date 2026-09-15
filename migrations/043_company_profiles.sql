-- Migration 043: company_profiles
--
-- Engineering spec §3, 1:1 with user_companies. This is the input side of the
-- matching engine (§5) — every scoring factor reads a column defined here.
--
-- target_org_ids holds orgs.id values. This codebase's org table is `orgs`
-- (the spec calls it `organizations`) and `canonical_org_id` is a column on
-- `orgs`/`contracts` pointing back at `orgs.id`, so org targets are stored as
-- orgs.id text slugs. Left as TEXT[] rather than a join table because the
-- matching engine reads the whole array on every score and never queries a
-- single element.

CREATE TABLE IF NOT EXISTS company_profiles (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_company_id   TEXT NOT NULL UNIQUE
                      REFERENCES user_companies(id) ON DELETE CASCADE,
  naics_codes       TEXT[] NOT NULL DEFAULT '{}',
  psc_codes         TEXT[] NOT NULL DEFAULT '{}',
  set_asides        TEXT[] NOT NULL DEFAULT '{}',
  vehicles          TEXT[] NOT NULL DEFAULT '{}',
  target_org_ids    TEXT[] NOT NULL DEFAULT '{}',
  capabilities      TEXT[] NOT NULL DEFAULT '{}',
  keywords          TEXT[] NOT NULL DEFAULT '{}',
  excluded_keywords TEXT[] NOT NULL DEFAULT '{}',
  min_value         DECIMAL(18,2),
  max_value         DECIMAL(18,2),
  prime_pref        TEXT NOT NULL DEFAULT 'either'
                      CHECK (prime_pref IN ('prime', 'sub', 'either')),
  geo_constraints   TEXT[] NOT NULL DEFAULT '{}',
  source            TEXT NOT NULL DEFAULT 'manual'
                      CHECK (source IN ('manual', 'inferred')),
  -- Bumped on every profile edit. matches.profile_version records which
  -- version produced a score, so stale matches are identifiable without
  -- recomputing them.
  version           INTEGER NOT NULL DEFAULT 1,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT company_profiles_value_band
    CHECK (min_value IS NULL OR max_value IS NULL OR min_value <= max_value)
);

CREATE INDEX IF NOT EXISTS idx_company_profiles_company ON company_profiles (user_company_id);
CREATE INDEX IF NOT EXISTS idx_company_profiles_naics ON company_profiles USING GIN (naics_codes);
CREATE INDEX IF NOT EXISTS idx_company_profiles_target_orgs ON company_profiles USING GIN (target_org_ids);

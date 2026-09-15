-- Migration 000: legacy bootstrap
--
-- Engineering spec §2, migration checklist item 4: "Recreate the schema as
-- numbered migration files so the DB is reproducible from zero."
--
-- Four tables reached production without ever appearing in a migration. They
-- were created by hand in the Netlify query editor, or by inline DDL inside a
-- request handler (app/api/seed-industry-companies and app/api/sync-sbir both
-- still open with a CREATE TABLE IF NOT EXISTS). The result is that the
-- migration chain does not run from zero: migration 029 does
-- `ALTER TABLE industry_companies` against a table nothing ever created, and
-- fails.
--
-- Numbered 000 so it runs ahead of the Netlify-era migrations that assume
-- these tables exist. Definitions are copied from the inline DDL that created
-- them in production, so this is a description of the live schema, not a
-- redesign of it.
--
-- None of this is v3 surface area — §14 puts company and agency intelligence
-- pages out of scope for v1. It is here so a fresh DigitalOcean database can
-- be built from `npm run migrate` alone.

-- From app/api/seed-industry-companies/route.ts, which creates this table on
-- first call. Required by migrations 029, 030 and 039.
CREATE TABLE IF NOT EXISTS industry_companies (
  id                   SERIAL PRIMARY KEY,
  legal_name           TEXT NOT NULL UNIQUE,
  name                 TEXT NOT NULL,
  ticker               TEXT,
  headquarters         TEXT,
  website              TEXT,
  employees            INT,
  revenue_b            NUMERIC(8,1),
  dod_contract_value_b NUMERIC(8,1),
  description          TEXT,
  logo_url             TEXT,
  focus_areas          TEXT[],
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- From app/api/sync-sbir/route.ts.
CREATE TABLE IF NOT EXISTS sbir_awards (
  id                                  SERIAL PRIMARY KEY,
  uei                                 TEXT,
  firm                                TEXT,
  award_title                         TEXT,
  agency                              TEXT,
  branch                              TEXT,
  phase                               TEXT,
  program                             TEXT,
  award_year                          INT,
  award_amount                        BIGINT,
  research_area_keywords              TEXT,
  abstract                            TEXT,
  hubzone_owned                       BOOLEAN,
  women_owned                         BOOLEAN,
  socially_economically_disadvantaged BOOLEAN,
  poc_name                            TEXT,
  poc_email                           TEXT,
  org_id                              TEXT REFERENCES orgs(id),
  synced_at                           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sbir_awards_org ON sbir_awards (org_id);
CREATE INDEX IF NOT EXISTS idx_sbir_awards_uei ON sbir_awards (uei);

-- The same route adds these three columns to orgs on every call.
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sbir_capabilities TEXT[];
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sbir_designations TEXT[];
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS sbir_award_count INT DEFAULT 0;

-- Read by app/api/feed/route.ts. Column list taken from that SELECT.
CREATE TABLE IF NOT EXISTS feed_items (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type         TEXT,
  title        TEXT,
  body         TEXT,
  image_url    TEXT,
  video_url    TEXT,
  source       TEXT,
  source_url   TEXT,
  entity_name  TEXT,
  entity_logo  TEXT,
  tags         TEXT[],
  value_b      NUMERIC(8,1),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  pinned       BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_feed_items_published
  ON feed_items (pinned DESC, published_at DESC);

-- Read by app/api/feed/route.ts to personalize the feed.
CREATE TABLE IF NOT EXISTS follows (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id   TEXT NOT NULL,
  entity_name TEXT,
  entity_meta JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (user_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_user ON follows (user_id);

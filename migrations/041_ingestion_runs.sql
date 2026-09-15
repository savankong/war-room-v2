-- Migration 041: ingestion_runs
--
-- This table has been written to by lib/ingestion/logger.ts since the Netlify
-- era but was created by hand in the Netlify query editor and never captured in
-- a migration. Recreating it here so the schema is reproducible from zero,
-- per engineering spec §2 (migration checklist item 4).

CREATE TABLE IF NOT EXISTS ingestion_runs (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  source         TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'running'
                   CHECK (status IN ('running', 'success', 'failed')),
  records_synced INTEGER,
  inserted_count INTEGER NOT NULL DEFAULT 0,
  updated_count  INTEGER NOT NULL DEFAULT 0,
  skipped_count  INTEGER NOT NULL DEFAULT 0,
  errored_count  INTEGER NOT NULL DEFAULT 0,
  unresolved_org_count INTEGER NOT NULL DEFAULT 0,
  error_log      TEXT,
  started_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ingestion_runs_source_started
  ON ingestion_runs (source, started_at DESC);

-- Older deployments already have the table without the per-outcome counters
-- that §4 requires ("Log every run to ingestion_runs with inserted, updated,
-- skipped, errored counts").
ALTER TABLE ingestion_runs
  ADD COLUMN IF NOT EXISTS inserted_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_count  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS skipped_count  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS errored_count  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unresolved_org_count INTEGER NOT NULL DEFAULT 0;

-- Migration 048: signals
--
-- Engineering spec §3. New table. Note that "signals" in v2 was not a table —
-- it was a view over contracts.signal_type, rendered by /signals. That column
-- stays where it is; nothing here touches it. This table holds the discrete,
-- timestamped events the briefing's "Market signals" section reads (§9) and
-- that the nightly contract_expiring job writes (§4).
--
-- subject_type/subject_id is a soft reference (contracts.id, opportunities.id,
-- orgs.id) rather than a FK, because a signal outlives the row it describes.

CREATE TABLE IF NOT EXISTS signals (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type             TEXT NOT NULL CHECK (type IN (
                     'new_notice', 'contract_mod', 'contract_expiring',
                     'new_award', 'sources_sought', 'forecast_update')),
  subject_type     TEXT NOT NULL CHECK (subject_type IN ('contract', 'opportunity', 'org')),
  subject_id       TEXT NOT NULL,
  canonical_org_id TEXT REFERENCES orgs(id) ON DELETE SET NULL,
  payload          JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at      TIMESTAMPTZ NOT NULL,
  detected_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- The detector jobs are idempotent by re-running: the same expiring contract
  -- must not produce a new signal row every night.
  UNIQUE (type, subject_type, subject_id, occurred_at)
);

CREATE INDEX IF NOT EXISTS idx_signals_org_occurred ON signals (canonical_org_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_type_occurred ON signals (type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_subject ON signals (subject_type, subject_id);

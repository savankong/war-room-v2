-- Migration 047: capture_briefs
--
-- Engineering spec §3 and §6. Cached by (user_company_id, opportunity_id,
-- prompt_version) so opening the same brief twice makes one LLM call
-- (acceptance criterion 6). Bumping PROMPT_VERSION in lib/capture/prompt.ts
-- invalidates the cache without a delete.

CREATE TABLE IF NOT EXISTS capture_briefs (
  id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_company_id       TEXT NOT NULL REFERENCES user_companies(id) ON DELETE CASCADE,
  opportunity_id        TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  recommendation        TEXT NOT NULL
                          CHECK (recommendation IN ('pursue', 'position_now', 'monitor', 'partner', 'pass')),
  summary               TEXT,
  why_it_matters        JSONB NOT NULL DEFAULT '[]'::jsonb,
  fit_rationale         JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendation_rationale JSONB NOT NULL DEFAULT '[]'::jsonb,
  next_action           TEXT,
  incumbent_contract_id TEXT REFERENCES contracts(id) ON DELETE SET NULL,
  incumbent_evidence    JSONB NOT NULL DEFAULT '[]'::jsonb,
  recompete_confidence  TEXT CHECK (recompete_confidence IN ('high', 'medium', 'low')),
  recompete_evidence    JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Array of {person_id, why, suggested_action}. Every person_id resolves to a
  -- real contacts.id (acceptance criterion 7); capped at five (§6).
  people                JSONB NOT NULL DEFAULT '[]'::jsonb,
  model                 TEXT,
  prompt_version        TEXT NOT NULL,
  -- 'llm' when the model returned valid JSON, 'template' when both attempts
  -- failed schema validation and the deterministic fallback produced the brief.
  generator             TEXT NOT NULL DEFAULT 'llm'
                          CHECK (generator IN ('llm', 'template')),
  input_tokens          INTEGER,
  output_tokens         INTEGER,
  generated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (user_company_id, opportunity_id, prompt_version)
);

CREATE INDEX IF NOT EXISTS idx_capture_briefs_company ON capture_briefs (user_company_id);
CREATE INDEX IF NOT EXISTS idx_capture_briefs_generated ON capture_briefs (generated_at DESC);

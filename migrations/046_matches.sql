-- Migration 046: matches
--
-- Engineering spec §3 and §5. One row per (company, opportunity) pair that
-- survived the hard disqualifiers. `score` is stored but never displayed —
-- the UI renders `fit` plus the evidence lines (§5, "Never show a numeric
-- score to the user").
--
-- evidence is a JSONB array of {factor, points, line} objects. Every awarded
-- point carries a human-readable line; the briefing and brief page render
-- those lines directly.

CREATE TABLE IF NOT EXISTS matches (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_company_id TEXT NOT NULL REFERENCES user_companies(id) ON DELETE CASCADE,
  opportunity_id  TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  score           INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  fit             TEXT NOT NULL CHECK (fit IN ('strong', 'fair', 'weak')),
  evidence        JSONB NOT NULL DEFAULT '[]'::jsonb,
  profile_version INTEGER NOT NULL DEFAULT 1,
  -- Set when the customer marks not_relevant. Acceptance criterion 10:
  -- "Not relevant permanently hides the opportunity for that company."
  dismissed_at    TIMESTAMPTZ,
  saved_at        TIMESTAMPTZ,
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (user_company_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_company_fit
  ON matches (user_company_id, fit, score DESC);

-- The Today screen and the briefing builder both read this slice: live,
-- undismissed matches for one company, best first.
CREATE INDEX IF NOT EXISTS idx_matches_company_live
  ON matches (user_company_id, score DESC)
  WHERE dismissed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_matches_opportunity ON matches (opportunity_id);

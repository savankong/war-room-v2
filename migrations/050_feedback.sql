-- Migration 050: feedback
--
-- Engineering spec §3 and §7. Product spec §11 calls this "the only honest
-- read on whether the product works" — the primary success metric is counted
-- off these rows, not off how many opportunities we sent.
--
-- No unique constraint on (company, opportunity): a customer may mark
-- "too_early" in March and "pursuing" in June, and that change of mind is the
-- signal. The Today screen reads the latest verdict per opportunity.

CREATE TABLE IF NOT EXISTS feedback (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_company_id TEXT NOT NULL REFERENCES user_companies(id) ON DELETE CASCADE,
  opportunity_id  TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  verdict         TEXT NOT NULL CHECK (verdict IN (
                    'relevant', 'not_relevant', 'pursuing', 'passed',
                    'already_knew', 'too_early', 'wrong_capability')),
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_company_created
  ON feedback (user_company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_company_opportunity
  ON feedback (user_company_id, opportunity_id);
CREATE INDEX IF NOT EXISTS idx_feedback_verdict ON feedback (verdict);

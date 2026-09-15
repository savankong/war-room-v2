-- Migration 049: briefings
--
-- Engineering spec §3 and §9. One row per email sent. payload is the rendered
-- briefing (opportunity ids, recompete, people, signals) so a send is
-- reproducible and auditable after the fact — "what did we actually tell this
-- customer on the 14th" is the first question when they reply.

CREATE TABLE IF NOT EXISTS briefings (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_company_id   TEXT NOT NULL REFERENCES user_companies(id) ON DELETE CASCADE,
  period_start      DATE NOT NULL,
  period_end        DATE NOT NULL,
  payload           JSONB NOT NULL DEFAULT '{}'::jsonb,
  opportunity_count SMALLINT NOT NULL DEFAULT 0
                      CHECK (opportunity_count <= 3),  -- §9 hard cap
  resend_message_id TEXT,
  sent_at           TIMESTAMPTZ,
  opened_at         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One briefing per company per period. Re-running send-briefings after a
  -- partial failure must not double-send.
  UNIQUE (user_company_id, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_briefings_company_sent ON briefings (user_company_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_briefings_resend_message ON briefings (resend_message_id);

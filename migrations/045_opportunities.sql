-- Migration 045: opportunities
--
-- Engineering spec §3 and §4. Separate from `contracts` on purpose: contracts
-- holds awarded history (the incumbent read in §6), opportunities holds the
-- forward-looking notices the matching engine scores. The v2 pipeline wrote
-- both into `contracts` with a signal_type discriminator, which made
-- "expiring award" and "open solicitation" indistinguishable in a query.
--
-- Unresolved org rows keep department_slug with canonical_org_id NULL and are
-- never dropped (§4). They surface in the admin queue (§7.5).

CREATE TABLE IF NOT EXISTS opportunities (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  external_id         TEXT NOT NULL,
  source              TEXT NOT NULL CHECK (source IN ('sam', 'forecast', 'manual')),
  title               TEXT NOT NULL,
  notice_type         TEXT,
  solicitation_number TEXT,
  naics_code          TEXT,
  psc_code            TEXT,
  set_aside           TEXT,
  posted_date         DATE,
  response_deadline   TIMESTAMPTZ,
  archive_date        DATE,
  department_slug     TEXT,
  canonical_org_id    TEXT REFERENCES orgs(id) ON DELETE SET NULL,
  office_name         TEXT,
  estimated_value     DECIMAL(18,2),
  description         TEXT,
  ui_url              TEXT,
  place_of_performance TEXT,
  poc_name            TEXT,
  poc_email           TEXT,
  raw_payload         JSONB,
  ingested_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (source, external_id)
);

CREATE INDEX IF NOT EXISTS idx_opportunities_org ON opportunities (canonical_org_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities (response_deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_naics ON opportunities (naics_code);
CREATE INDEX IF NOT EXISTS idx_opportunities_psc ON opportunities (psc_code);
CREATE INDEX IF NOT EXISTS idx_opportunities_notice_type ON opportunities (notice_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_posted ON opportunities (posted_date DESC);

-- The admin unresolved-org queue (§7.5) reads exactly this slice.
CREATE INDEX IF NOT EXISTS idx_opportunities_unresolved
  ON opportunities (department_slug, ingested_at DESC)
  WHERE canonical_org_id IS NULL;

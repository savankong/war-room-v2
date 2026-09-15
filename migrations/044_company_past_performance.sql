-- Migration 044: company_past_performance
--
-- Engineering spec §3. Feeds two scoring factors in §5 ("Past performance in
-- the same org lineage", 15 points) and the NAICS evidence line ("Same NAICS
-- as 3 of your past contracts").
--
-- contract_id is nullable and references contracts(id) (TEXT): a customer can
-- type in past performance we have no contract record for, and that entry is
-- still worth scoring against.

CREATE TABLE IF NOT EXISTS company_past_performance (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_company_id  TEXT NOT NULL REFERENCES user_companies(id) ON DELETE CASCADE,
  contract_id      TEXT REFERENCES contracts(id) ON DELETE SET NULL,
  canonical_org_id TEXT REFERENCES orgs(id) ON DELETE SET NULL,
  title            TEXT NOT NULL,
  description      TEXT,
  naics_code       TEXT,
  psc_code         TEXT,
  value            DECIMAL(18,2),
  vehicle          TEXT,
  start_date       DATE,
  end_date         DATE,
  source           TEXT NOT NULL DEFAULT 'manual'
                     CHECK (source IN ('manual', 'usaspending', 'inferred')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cpp_company ON company_past_performance (user_company_id);
CREATE INDEX IF NOT EXISTS idx_cpp_org ON company_past_performance (canonical_org_id);
CREATE INDEX IF NOT EXISTS idx_cpp_naics ON company_past_performance (naics_code);

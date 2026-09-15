-- Migration 052: capture columns on contracts
--
-- Engineering spec §6 asks incumbent detection to filter on "end_date in the
-- future or within the last six months" and rank by "total obligation", and
-- the brief to show "incumbent, award amount, award date, expiration, vehicle,
-- modification count". §4 asks for a nightly job writing contract_expiring
-- signals "for any active contract with end_date inside 18 months".
--
-- None of period of performance, vehicle, total obligation or modification
-- count exists on `contracts` today. The table carries award_date and
-- award_amt only, which is enough to say who won and for how much, and not
-- enough to say when it runs out — which is the entire recompete read.
--
-- USASpending supplies all of these on the award record; lib/ingestion/
-- usaspending populates them from this migration forward. Rows ingested before
-- it keep NULLs, and §6 treats a NULL end_date as "unknown", never as
-- "expiring" — an invented expiration date is exactly the failure mode
-- product spec §8 rule 1 forbids.

ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS start_date         DATE,
  ADD COLUMN IF NOT EXISTS end_date           DATE,
  ADD COLUMN IF NOT EXISTS psc_code           TEXT,
  ADD COLUMN IF NOT EXISTS vehicle            TEXT,
  ADD COLUMN IF NOT EXISTS total_obligation   DECIMAL(18,2),
  ADD COLUMN IF NOT EXISTS modification_count INTEGER,
  ADD COLUMN IF NOT EXISTS recipient_uei      TEXT;

-- Incumbent detection filters on the lineage plus a live-ish end_date, and the
-- expiring-contract job scans forward 18 months.
CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON contracts (end_date)
  WHERE end_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contracts_org_end_date
  ON contracts (canonical_org_id, end_date DESC)
  WHERE canonical_org_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contracts_psc_code ON contracts (psc_code)
  WHERE psc_code IS NOT NULL;

-- §6 ranks incumbent candidates by total obligation.
CREATE INDEX IF NOT EXISTS idx_contracts_total_obligation
  ON contracts (total_obligation DESC NULLS LAST);

-- Title similarity is the third incumbent filter. Without trigram support that
-- is a sequential scan over every contract in the lineage on every brief.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_contracts_title_trgm
  ON contracts USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_opportunities_title_trgm
  ON opportunities USING GIN (title gin_trgm_ops);

-- ============================================================
-- Migration 006: Org Hierarchy Redesign
-- Replaces hardcoded hierarchy levels (major/subtier/sub)
-- with flexible org types + typed relationship table.
--
-- Design principles:
--   1. orgs.parent_id = ONE administrative parent (clean tree)
--   2. org_relationships = everything else (oversight, OPCON,
--      acquisition authority, reporting chains, support)
--   3. org_types replaces major/subtier/sub tier labels
--   4. Non-destructive: old columns kept until data is migrated
-- ============================================================

-- ── 1. Org type definitions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS org_types (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE,
  category     TEXT NOT NULL,
    -- 'civilian'    Secretary-level civilian offices (SecDef, USD, ASD)
    -- 'military'    Service HQ, major commands, field commands
    -- 'acquisition' Systems commands, PAEs, CPEs, PEOs, POs
    -- 'operational' CCMDs, component commands, fleets
    -- 'intelligence' Defense agencies (DIA, DISA, DCSA, NSA...)
    -- 'research'    DARPA, ONR, AFRL, DEVCOM, innovation units
    -- 'support'     DLA, DFAS, WHS, contracting commands
  sort_order   INTEGER DEFAULT 99,
  description  TEXT
);

-- ── 2. Relationship type definitions ─────────────────────────
CREATE TABLE IF NOT EXISTS org_rel_types (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL UNIQUE,
  category        TEXT NOT NULL,
    -- 'command'     Military command authority
    -- 'oversight'   Policy / programmatic oversight
    -- 'acquisition' Acquisition authority chain
    -- 'reporting'   Administrative reporting
    -- 'support'     Supporting / supported relationships
  description     TEXT,
  is_directional  BOOLEAN DEFAULT TRUE,
  label_from      TEXT,   -- e.g. 'oversees'
  label_to        TEXT    -- e.g. 'is overseen by'
);

-- ── 3. Non-destructive additions to orgs ─────────────────────
--    Old columns (major, subtier, sub) preserved for rollback.
--    New columns carry the redesigned model.
ALTER TABLE orgs
  ADD COLUMN IF NOT EXISTS org_type_id  TEXT REFERENCES org_types(id),
  ADD COLUMN IF NOT EXISTS parent_id    TEXT REFERENCES orgs(id),
  ADD COLUMN IF NOT EXISTS full_name    TEXT,   -- unambiguous full name
  ADD COLUMN IF NOT EXISTS abbreviation TEXT,   -- canonical acronym
  ADD COLUMN IF NOT EXISTS website      TEXT,
  ADD COLUMN IF NOT EXISTS is_active    BOOLEAN DEFAULT TRUE;

-- ── 4. Typed many-to-many org relationships ───────────────────
CREATE TABLE IF NOT EXISTS org_relationships (
  id            SERIAL PRIMARY KEY,
  from_org_id   TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  to_org_id     TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  rel_type_id   TEXT NOT NULL REFERENCES org_rel_types(id),

  -- Optional metadata per relationship type
  authority_level  TEXT,      -- acquisition: 'SAE' | 'DRPM' | 'PAE' | 'CPE' | 'PEO' | 'PM'
  notes            TEXT,
  effective_date   DATE,
  end_date         DATE,      -- NULL = currently active

  UNIQUE (from_org_id, to_org_id, rel_type_id)
);

CREATE INDEX IF NOT EXISTS idx_org_rel_from  ON org_relationships(from_org_id);
CREATE INDEX IF NOT EXISTS idx_org_rel_to    ON org_relationships(to_org_id);
CREATE INDEX IF NOT EXISTS idx_org_rel_type  ON org_relationships(rel_type_id);
CREATE INDEX IF NOT EXISTS idx_org_rel_active ON org_relationships(end_date)
  WHERE end_date IS NULL;

-- ── 5. Backward-compatible view ───────────────────────────────
--    Existing queries against orgs still work.
--    New queries can join through this view for enriched data.
CREATE OR REPLACE VIEW org_hierarchy_view AS
SELECT
  o.id,
  COALESCE(o.abbreviation, o.sub)        AS abbreviation,
  COALESCE(o.full_name, o.description)   AS full_name,
  o.branch,
  o.loc                                  AS location,
  o.budget,
  o.r_and_d,
  o.contract_vehicles,
  o.is_active,
  ot.id                                  AS org_type_id,
  ot.name                                AS org_type,
  ot.category                            AS org_category,
  ot.sort_order                          AS org_type_sort,
  p.id                                   AS parent_id,
  COALESCE(p.abbreviation, p.sub)        AS parent_abbreviation,
  COALESCE(p.full_name, p.description)   AS parent_name,
  gp.id                                  AS grandparent_id,
  COALESCE(gp.abbreviation, gp.sub)      AS grandparent_abbreviation,
  COALESCE(gp.full_name, gp.description) AS grandparent_name
FROM orgs o
LEFT JOIN org_types ot ON o.org_type_id = ot.id
LEFT JOIN orgs p  ON o.parent_id = p.id
LEFT JOIN orgs gp ON p.parent_id = gp.id;

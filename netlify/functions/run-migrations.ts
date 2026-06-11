import type { Context } from '@netlify/functions';
import { getDatabase } from '@netlify/database';

export default async function handler(_req: Request, _ctx: Context) {
  const { sql: db } = getDatabase();

  try {
    await db`
      CREATE TABLE IF NOT EXISTS organizations (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name            VARCHAR(255) NOT NULL,
        slug            VARCHAR(255) UNIQUE NOT NULL,
        badge_text      VARCHAR(20),
        badge_color     VARCHAR(7),
        description     TEXT,
        sector          VARCHAR(100),
        hq_address      VARCHAR(255),
        personnel_count INTEGER,
        created_at      TIMESTAMPTZ DEFAULT now()
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS organization_settings (
        org_id        UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
        primary_color VARCHAR(7),
        palette       JSONB,
        font_size     INTEGER DEFAULT 16,
        density       VARCHAR(10) DEFAULT 'regular' CHECK (density IN ('compact','regular','comfy')),
        dark_mode     BOOLEAN DEFAULT false
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS people (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        manager_id    UUID REFERENCES people(id) ON DELETE SET NULL,
        full_name     VARCHAR(255) NOT NULL,
        role_title    VARCHAR(255),
        avatar_url    VARCHAR(500),
        avatar_color  VARCHAR(7),
        contact_info  JSONB,
        created_at    TIMESTAMPTZ DEFAULT now()
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS teams (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        name        VARCHAR(255) NOT NULL,
        description TEXT,
        created_at  TIMESTAMPTZ DEFAULT now()
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS offices (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        name       VARCHAR(255),
        location   VARCHAR(255),
        lat        DECIMAL(9,6),
        lng        DECIMAL(9,6),
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS team_members (
        team_id   UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
        PRIMARY KEY (team_id, person_id)
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS office_members (
        office_id UUID NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
        person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
        PRIMARY KEY (office_id, person_id)
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS contracts (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
        title           VARCHAR(500) NOT NULL,
        value           DECIMAL(18,2),
        budget_pipeline DECIMAL(18,2),
        status          VARCHAR(50) CHECK (status IN ('Competed','Sole Source','Opportunity')),
        award_date      DATE,
        signal_type     VARCHAR(50) CHECK (signal_type IN ('Opportunity','Award','Budget')),
        external_id     VARCHAR(255) UNIQUE,
        source          VARCHAR(50) DEFAULT 'manual' CHECK (source IN ('sam_gov','usaspending','manual')),
        raw_payload     JSONB,
        created_at      TIMESTAMPTZ DEFAULT now()
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS ingestion_runs (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source         VARCHAR(50) CHECK (source IN ('sam_gov','usaspending')),
        started_at     TIMESTAMPTZ DEFAULT now(),
        completed_at   TIMESTAMPTZ,
        records_synced INTEGER,
        status         VARCHAR(20) CHECK (status IN ('running','success','failed')),
        error_log      TEXT
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS followers (
        user_id     UUID NOT NULL,
        org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        followed_at TIMESTAMPTZ DEFAULT now(),
        PRIMARY KEY (user_id, org_id)
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS related_organizations (
        org_id_1 UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        org_id_2 UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        PRIMARY KEY (org_id_1, org_id_2),
        CHECK (org_id_1 < org_id_2)
      )
    `;

    // Idempotent column additions
    await db`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS naics_code          VARCHAR(10)`;
    await db`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS psc_code            VARCHAR(10)`;
    await db`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS description         TEXT`;
    await db`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS awardee             VARCHAR(500)`;
    await db`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS solicitation_number VARCHAR(100)`;
    await db`ALTER TABLE people    ADD COLUMN IF NOT EXISTS email               VARCHAR(255)`;
    await db`ALTER TABLE people    ADD COLUMN IF NOT EXISTS phone               VARCHAR(50)`;
    await db`ALTER TABLE people    ADD COLUMN IF NOT EXISTS location            VARCHAR(255)`;

    // Indexes (IF NOT EXISTS not supported for indexes — use DO blocks)
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_people_org_id        ON people(org_id)',
      'CREATE INDEX IF NOT EXISTS idx_people_manager_id    ON people(manager_id)',
      'CREATE INDEX IF NOT EXISTS idx_contracts_org_id     ON contracts(org_id)',
      'CREATE INDEX IF NOT EXISTS idx_contracts_signal     ON contracts(signal_type)',
      'CREATE INDEX IF NOT EXISTS idx_contracts_source     ON contracts(source)',
      'CREATE INDEX IF NOT EXISTS idx_contracts_external   ON contracts(external_id)',
      'CREATE INDEX IF NOT EXISTS idx_ingestion_source     ON ingestion_runs(source)',
      'CREATE INDEX IF NOT EXISTS idx_ingestion_status     ON ingestion_runs(status)',
    ];

    await db`CREATE INDEX IF NOT EXISTS idx_people_org_id     ON people(org_id)`;
    await db`CREATE INDEX IF NOT EXISTS idx_people_manager_id ON people(manager_id)`;
    await db`CREATE INDEX IF NOT EXISTS idx_contracts_org_id  ON contracts(org_id)`;
    await db`CREATE INDEX IF NOT EXISTS idx_contracts_signal  ON contracts(signal_type)`;
    await db`CREATE INDEX IF NOT EXISTS idx_contracts_source  ON contracts(source)`;
    await db`CREATE INDEX IF NOT EXISTS idx_contracts_external ON contracts(external_id)`;
    await db`CREATE INDEX IF NOT EXISTS idx_ingestion_source  ON ingestion_runs(source)`;
    await db`CREATE INDEX IF NOT EXISTS idx_ingestion_status  ON ingestion_runs(status)`;

    return Response.json({ ok: true, message: 'Migration complete — all tables and indexes created.' });
  } catch (err) {
    console.error('Migration error:', err);
    return Response.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

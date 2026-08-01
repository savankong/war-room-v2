CREATE TABLE IF NOT EXISTS follows (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('org', 'company', 'person', 'signal')),
  entity_id   TEXT NOT NULL,
  entity_name TEXT,
  entity_meta JSONB,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS follows_user_idx ON follows(user_id);
CREATE INDEX IF NOT EXISTS follows_entity_idx ON follows(entity_type, entity_id);

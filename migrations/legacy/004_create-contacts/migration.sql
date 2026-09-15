CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  name TEXT,
  initials TEXT,
  title TEXT,
  org_id TEXT REFERENCES orgs(id),
  org_full TEXT,
  email TEXT,
  phone TEXT,
  color TEXT,
  awards TEXT,
  opps INTEGER DEFAULT 0,
  last_signal TEXT,
  tags TEXT[],
  linkedin TEXT
);

CREATE TABLE IF NOT EXISTS contact_contracts (
  id SERIAL PRIMARY KEY,
  contact_id TEXT REFERENCES contacts(id),
  type TEXT,
  title TEXT,
  vendor TEXT,
  value TEXT,
  date TEXT
);

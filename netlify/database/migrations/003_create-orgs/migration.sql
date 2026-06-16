CREATE TABLE IF NOT EXISTS orgs (
  id TEXT PRIMARY KEY,
  sub TEXT,
  branch TEXT,
  budget TEXT,
  major TEXT,
  subtier TEXT,
  loc TEXT,
  budget_detail TEXT,
  r_and_d TEXT,
  contract_vehicles TEXT[],
  description TEXT
);

CREATE TABLE IF NOT EXISTS org_awards (
  id SERIAL PRIMARY KEY,
  org_id TEXT REFERENCES orgs(id),
  title TEXT,
  vendor TEXT,
  value TEXT,
  date TEXT
);

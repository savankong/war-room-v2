-- Migration 042: user_companies
--
-- Engineering spec §3. The customer's own company — the thing every match,
-- brief, and briefing is computed against. One row per paying account.
--
-- users.id is SERIAL (see 001_create-users), so owner_user_id is INTEGER.

CREATE TABLE IF NOT EXISTS user_companies (
  id                     TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name                   TEXT NOT NULL,
  website                TEXT,
  description            TEXT,
  owner_user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  plan                   TEXT NOT NULL DEFAULT 'trial'
                           CHECK (plan IN ('trial', 'capture', 'cancelled')),
  status                 TEXT NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active', 'paused', 'deleted')),
  trial_ends_at          TIMESTAMPTZ,
  briefing_frequency     TEXT NOT NULL DEFAULT 'mwf'
                           CHECK (briefing_frequency IN ('mwf', 'weekly', 'off')),
  onboarding_step        SMALLINT NOT NULL DEFAULT 1,
  onboarding_completed_at TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_companies_owner ON user_companies (owner_user_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_stripe_customer ON user_companies (stripe_customer_id);

-- The Stripe webhook looks subscriptions up by id, so it must be unique.
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_companies_stripe_subscription
  ON user_companies (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

--- AuditFlow — Optional business layer tables
--- WARNING: Apply only against the intended project after confirming the target database/ref.
--- Supabase project reference for this setup: fqnorsqggyshqfmihivw
---
--- 1) Waitlist
CREATE TABLE IF NOT EXISTS waitlist (
  id          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email       text UNIQUE NOT NULL,
  company     text,
  role        text,          -- quality_manager | auditor | dept_head | other
  use_case    text,
  source      text,          -- linkedin | word_of_mouth | search | cold_outreach
  status      text DEFAULT 'waiting',  -- waiting | onboarded | declined | lost
  notes       text,
  created_at  timestamptz DEFAULT now()
);

--- 2) Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id text REFERENCES organizations(id),
  plan            text,          -- starter | professional | enterprise
  mrr_usd         numeric(10,2),
  status          text,          -- trial | active | past_due | churned
  trial_ends_at   timestamptz,
  started_at      timestamptz,
  canceled_at     timestamptz,
  churn_reason    text,
  created_at      timestamptz DEFAULT now()
);

--- 3) Product events
CREATE TABLE IF NOT EXISTS product_events (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id text REFERENCES organizations(id),
  user_id         text REFERENCES users(id),
  event_type      text,  -- assessment_created | assessment_completed | ncr_opened | evidence_uploaded | report_generated
  properties      jsonb,
  occurred_at     timestamptz DEFAULT now()
);

--- Helpful indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist (email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON subscriptions (organization_id);
CREATE INDEX IF NOT EXISTS idx_product_events_org ON product_events (organization_id);
CREATE INDEX IF NOT EXISTS idx_product_events_user ON product_events (user_id);

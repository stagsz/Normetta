--- AuditFlow — Business layer tables (waitlist, subscriptions, product_events)
--- WARNING: Apply only against the intended project after confirming the target database/ref.
--- Supabase project reference for this setup: fqnorsqggyshqfmihivw
---

-- 1) Waitlist
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

-- 2) Subscriptions
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

-- 3) Product events
CREATE TABLE IF NOT EXISTS product_events (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id text REFERENCES organizations(id),
  user_id         text REFERENCES users(id),
  event_type      text,  -- assessment_created | assessment_completed | ncr_opened | evidence_uploaded | report_generated
  properties      jsonb,
  occurred_at     timestamptz DEFAULT now()
);

-- Helpful indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist (email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON subscriptions (organization_id);
CREATE INDEX IF NOT EXISTS idx_product_events_org ON product_events (organization_id);
CREATE INDEX IF NOT EXISTS idx_product_events_user ON product_events (user_id);

-- RLS Policies
-- Waitlist: allow inserts from anon/public (for lead capture forms), restrict reads to authenticated org members
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waitlist_insert_anon" ON waitlist
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "waitlist_select_authenticated" ON waitlist
  FOR SELECT TO authenticated
  USING (true);

-- Subscriptions: org members can read their org's subscription, system admins can read all
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_org_member" ON subscriptions
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE id = (SELECT organization_id FROM users WHERE id = auth.uid())
    )
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'
  );

CREATE POLICY "subscriptions_insert_service_role" ON subscriptions
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "subscriptions_update_service_role" ON subscriptions
  FOR UPDATE TO service_role
  USING (true);

-- Product events: org members can read their org's events, service_role can insert
ALTER TABLE product_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_events_select_org_member" ON product_events
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE id = (SELECT organization_id FROM users WHERE id = auth.uid())
    )
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'SYSTEM_ADMIN'
  );

CREATE POLICY "product_events_insert_service_role" ON product_events
  FOR INSERT TO service_role
  WITH CHECK (true);
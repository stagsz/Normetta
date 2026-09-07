-- GDPR data-subject request audit trail (export / anonymize).
-- Append-only. Run manually in the Supabase SQL Editor (migrations are not
-- auto-run on deploy for this project).

CREATE TABLE gdpr_audit_logs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action         text NOT NULL,
  target_user_id uuid NOT NULL REFERENCES users(id),
  target_email   text NOT NULL,
  actor_id       uuid NOT NULL REFERENCES users(id),
  status         text NOT NULL,
  reason         text,
  counts         jsonb,
  metadata       jsonb,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gdpr_audit_target_user ON gdpr_audit_logs (target_user_id);
CREATE INDEX idx_gdpr_audit_actor       ON gdpr_audit_logs (actor_id);
CREATE INDEX idx_gdpr_audit_created     ON gdpr_audit_logs (created_at);

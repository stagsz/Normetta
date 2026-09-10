-- Adds Organization.allowedDomains (Json, default []) — required by the
-- email-domain validation feature (schema change from commit bdad7ab).
-- Applied to Supabase production on 2026-07-05.
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "allowedDomains" JSONB DEFAULT '[]'::jsonb;

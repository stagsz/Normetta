-- Adds User.emailDomain (VarChar(255), default '') with index — required by
-- the email-domain validation feature (schema change from commit 28f6117).
-- The backfill is mandatory: authService.login rejects users whose
-- emailDomain is empty, so adding the column without backfilling would lock
-- out every existing user.
-- Applied to Supabase production on 2026-07-05.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailDomain" VARCHAR(255) NOT NULL DEFAULT '';
UPDATE "users" SET "emailDomain" = lower(split_part(email, '@', 2)) WHERE "emailDomain" = '';
CREATE INDEX IF NOT EXISTS "users_emailDomain_idx" ON "users"("emailDomain");

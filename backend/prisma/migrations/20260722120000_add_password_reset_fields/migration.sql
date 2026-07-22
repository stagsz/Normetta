-- Adds password-reset support to the User model.
-- Only the SHA-256 hash of the reset token is stored; the raw token is emailed.
-- Migration is run MANUALLY in the Supabase SQL Editor — do NOT add this to a
-- prisma migrate deploy step (Vercel builds must not auto-migrate).
-- Migration authored 2026-07-22.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_token" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_expires" TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS "users_reset_password_token_idx" ON "users"("reset_password_token");

# AuditFlow RLS — Operator Runbook

Use this as the single execution packet for the rollout window.

## Packet contents
- `docs/RLS_ROLLOUT.md` — strategy and rationale
- `docs/RLS_PRODUCTION_VERIFICATION.md` — step-by-step commands and smoke tests
- `docs/RLS_OPERATOR_HANDOFF.md` — contacts and rollback
- `backend/prisma/migrations/20260711200000_rls_tenant_isolation/migration.sql` — migration to apply
- `backend/src/middleware/tenantContext.ts` — middleware that sets `app.current_org_id`
- `backend/src/index.ts` — app wiring change

## Execution order
1. Review `docs/RLS_OPERATOR_HANDOFF.md`
2. Create `app_tenant` role in Supabase SQL editor or psql
3. Apply `backend/prisma/migrations/20260711200000_rls_tenant_isolation/migration.sql` to prod
4. Verify policies via `SELECT DISTINCT ... FROM pg_policies`
5. Rotate backend DB connection to `app_tenant`
6. Redeploy backend on Vercel
7. Run smoke tests in `docs/RLS_PRODUCTION_VERIFICATION.md`
8. Sign off at the bottom of `docs/RLS_PRODUCTION_VERIFICATION.md`

## Required secrets
- Current service role connection string (for rollback)
- New `app_tenant` password

## Rollback
Revert Vercel `DATABASE_URL`/`POSTGRES_PRISMA_URL`/`POSTGRES_URL` to previous service role. Re-deploy. RLS policies remain but are inactive for that role.

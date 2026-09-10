# AuditFlow RLS — Operator Handoff Note

To: infrastructure/ops
From: Greisz Consulting / AuditFlow lead
Date: 2026-07-11
Priority: high — affects production database and backend Vercel deployment

## Objective
Activate row-level tenant isolation with zero app downtime.

## What is changing
- DB: new `app_tenant` role + `tenant_isolation` RLS policies
- App: backend will connect as `app_tenant` instead of the current bypass role
- Safety: existing policies are inactive until role switch

## Prerequisites
- Read `docs/RLS_ROLLOUT.md`
- Read `docs/RLS_PRODUCTION_VERIFICATION.md`
- Backup completed

## Files to review
- `backend/prisma/migrations/20260711200000_rls_tenant_isolation/migration.sql`
- `backend/src/middleware/tenantContext.ts`
- `backend/src/index.ts`

## Command sequence
1. Create role in Supabase SQL editor or via psql
2. Apply migration from `backend/prisma/migrations/.../migration.sql`
3. Verify with `SELECT DISTINCT ... FROM pg_policies`
4. Rotate backend DB password/role to `app_tenant`
5. Redeploy backend on Vercel
6. Run smoke tests from verification checklist
7. Sign off and close incident

## Rollback
Revert Vercel `DATABASE_URL`/`POSTGRES_PRISMA_URL`/`POSTGRES_URL` to previous service role. App behavior returns to current state; RLS policies remain but are bypassed.

## Contacts
- Privacy/controller: Greisz Consulting
- Product: AuditFlow

## Completion
Operator: ______________________
Date: __________________________

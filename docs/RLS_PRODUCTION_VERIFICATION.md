# AuditFlow RLS — Production Verification Checklist

Use this during the rollout window. Complete each step in order.

## Pre-flight
- [ ] Backup taken: `pg_dump` or Supabase backup snapshot
- [ ] Maintenance window agreed if needed
- [ ] `docs/RLS_ROLLOUT.md` reviewed by the operator

## Step 1. Create the `app_tenant` role
Supabase dashboard or psql:
```sql
create role app_tenant login password 'REPLACE_WITH_STRONG_PASSWORD' nobypassrls;
grant usage on schema public, app to app_tenant;
grant execute on function app.current_org_id() to app_tenant;
grant select, insert, update, delete on all tables in schema public to app_tenant;
grant usage, select on all sequences in schema public to app_tenant;
alter default privileges in schema public grant select, insert, update, delete on tables to app_tenant;
alter default privileges in schema public grant usage, select on sequences to app_tenant;
```

## Step 2. Apply the migration
Run against the **prod database** only:
```bash
psql "$DATABASE_URL" -f backend/prisma/migrations/20260711200000_rls_tenant_isolation/migration.sql
```

## Step 3. Verify policies are active
```bash
psql "$DATABASE_URL" -c "
select distinct schemaname, tablename, policyname, permissive, roles, qual, with_check
from pg_policies
where policyname = 'tenant_isolation'
order by tablename;
"
```

## Step 4. Cut over backend role
Set or update `DATABASE_URL` to use `app_tenant`:
```bash
postgresql://app_tenant:REPLACE_WITH_STRONG_PASSWORD@<host>:5432/<db>?sslmode=require
```

Vercel env vars to check:
- `DATABASE_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL`

## Step 5. Smoke tests
- [ ] As an existing user: dashboard loads, assessments list, create assessment succeeds
- [ ] As a user with no `organizationId`: API returns 401 or empty instead of another org's data
- [ ] Admin user list filters to same org
- [ ] Assessment CSV export only returns org data
- [ ] Evidence upload for another org's assessment is denied

## Rollback
If anything breaks, revert the backend env var to the previous bypass-role connection. The app will regain its old behavior and the RLS policies will remain inactive for that role.

## Completion
- [ ] Verification commands above run clean
- [ ] `app_tenant` role is the live DB user
- [ ] Operator signs off below

Operator: ______________________
Date: __________________________

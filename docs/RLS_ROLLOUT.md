# AuditFlow RLS Migration Rollout Guide

## Prerequisites
- Backup prod first: `pg_dump "$DATABASE_URL" > backup_$(date +%Y%m%d)_rls.sql`
- Confirm the safe domain cleanup has run and no test users remain.
- Review `backend/prisma/migrations/20260711200000_rls_tenant_isolation/migration.sql`.

## Step 1: Create the `app_tenant` role
Connect as a superuser/postgres and run:

```sql
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'app_tenant') then
    create role app_tenant login password 'REPLACE_WITH_STRONG_RANDOM_PASSWORD' nobypassrls;
  end if;
end$$;
```

Replace the placeholder password with a strong random value and store it securely.

## Step 2: Apply the RLS migration
```bash
psql "$DATABASE_URL" -f backend/prisma/migrations/20260711200000_rls_tenant_isolation/migration.sql
```

Because current app traffic still uses the bypass role, this changes enforcement metadata only at this stage.

## Step 3: Verify policies exist
```sql
\dp public.users
\dp public.assessments
\dp public.question_responses
\dp public.non_conformities
\dp public.corrective_actions
\dp public.evidence
\dp public.assessment_team_members
```

You should see `tenant_isolation` policies for `app_tenant`.

## Step 4: Smoke-test tenant isolation
As app code switched to `app_tenant`, a missing `SET app.current_org_id` should return zero rows for tenant-scoped queries. Verify downstream list endpoints with no org context show empty results, not leaked data.

## Step 5: Cut over the backend connection
Update your backend connection/user to connect as `app_tenant` instead of the bypass role. Set the GUC per request:

```sql
SET LOCAL app.current_org_id = :organizationId;
```

In a Node/Prisma setup, execute that right after acquiring the connection, before app queries.

Keep the bypass connection only for migrations and provisioning paths.

## Step 6: Confirm live behavior
- Run the app’s auth + org-scoped flows.
- Confirm cross-tenant access is denied.
- If anything breaks, roll back by reverting the connection role; the policies can stay in place.

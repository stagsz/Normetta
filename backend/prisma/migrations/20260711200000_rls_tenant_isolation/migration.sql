-- =============================================================================
-- AuditFlow — Multi-tenant RLS hardening migration
-- Project: fqnorsqggyshqfmihivw (eu-west-1)
-- Author:  drafted for review — DO NOT auto-apply to prod without reading the
--          companion rollout guide.
--
-- STRATEGY
--   Keep your existing custom auth. Enforce tenant isolation in the DATABASE
--   (not just app code) using a per-request GUC `app.current_org_id` + RLS.
--   A forgotten "WHERE organizationId = ?" then fails safe instead of leaking.
--
-- WHY THIS IS SAFE TO APPLY
--   Your backend today connects with a BYPASSRLS role (postgres / service_role),
--   so these policies do NOT change the running app's behaviour on apply.
--   Real enforcement switches on only when you point the app at the new
--   `app_tenant` role (see rollout guide, Step "Switch the connection role").
--   You can apply this migration, verify, and cut over on your own schedule.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. Helper schema + current-org accessor.
--    Kept in the `app` schema (NOT `public`) so it is never exposed through the
--    auto-generated PostgREST API. Returns NULL when the GUC is unset, which
--    makes every RLS check fail-closed (no rows) — the safe default.
-- -----------------------------------------------------------------------------
create schema if not exists app;

create or replace function app.current_org_id()
returns text
language sql
stable
as $$
  select nullif(current_setting('app.current_org_id', true), '')
$$;

comment on function app.current_org_id() is
  'Tenant/org id for the current request, set via SET LOCAL app.current_org_id '
  '(or set_config(''app.current_org_id'', $1, true)). NULL when unset so RLS '
  'denies all rows by default.';

-- -----------------------------------------------------------------------------
-- 2. Dedicated application role — subject to RLS (NOBYPASSRLS).
--    Your normal app traffic connects as this role instead of `postgres`.
--    Keep `postgres`/`service_role` ONLY for migrations, reference-data seeding,
--    and the signup/provisioning path (which must create the first org row).
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'app_tenant') then
    create role app_tenant login password 'CHANGE_ME_STRONG_PASSWORD' nobypassrls;
  end if;
end$$;

grant usage on schema public, app to app_tenant;
grant execute on function app.current_org_id() to app_tenant;
grant select, insert, update, delete on all tables in schema public to app_tenant;
grant usage, select on all sequences in schema public to app_tenant;

alter default privileges in schema public
  grant select, insert, update, delete on tables to app_tenant;
alter default privileges in schema public
  grant usage, select on sequences to app_tenant;

-- -----------------------------------------------------------------------------
-- 3. Tenant policies — tables with a DIRECT org column (camelCase "organizationId").
--    FOR ALL with USING (reads/updates/deletes) + WITH CHECK (inserts/updates)
--    so a tenant can neither see nor write another org's rows.
-- -----------------------------------------------------------------------------

drop policy if exists tenant_isolation on public.organizations;
create policy tenant_isolation on public.organizations
  for all to app_tenant
  using (id = app.current_org_id())
  with check (id = app.current_org_id());

drop policy if exists tenant_isolation on public.users;
create policy tenant_isolation on public.users
  for all to app_tenant
  using ("organizationId" = app.current_org_id())
  with check ("organizationId" = app.current_org_id());

drop policy if exists tenant_isolation on public.assessments;
create policy tenant_isolation on public.assessments
  for all to app_tenant
  using ("organizationId" = app.current_org_id())
  with check ("organizationId" = app.current_org_id());

drop policy if exists tenant_isolation on public.divisions;
create policy tenant_isolation on public.divisions
  for all to app_tenant
  using ("organizationId" = app.current_org_id())
  with check ("organizationId" = app.current_org_id());

drop policy if exists tenant_isolation on public.departments;
create policy tenant_isolation on public.departments
  for all to app_tenant
  using ("organizationId" = app.current_org_id())
  with check ("organizationId" = app.current_org_id());

drop policy if exists tenant_isolation on public.org_roles;
create policy tenant_isolation on public.org_roles
  for all to app_tenant
  using ("organizationId" = app.current_org_id())
  with check ("organizationId" = app.current_org_id());

drop policy if exists tenant_isolation on public.user_org_invites;
create policy tenant_isolation on public.user_org_invites
  for all to app_tenant
  using ("organizationId" = app.current_org_id())
  with check ("organizationId" = app.current_org_id());

drop policy if exists tenant_isolation on public.assessment_templates;
create policy tenant_isolation on public.assessment_templates
  for all to app_tenant
  using ("organizationId" = app.current_org_id() or "isDefault" = true)
  with check ("organizationId" = app.current_org_id());

-- -----------------------------------------------------------------------------
-- 4. Tenant policies — platform tables with snake_case "organization_id".
-- -----------------------------------------------------------------------------

drop policy if exists tenant_isolation on public.organization_profiles;
create policy tenant_isolation on public.organization_profiles
  for all to app_tenant
  using (organization_id = app.current_org_id())
  with check (organization_id = app.current_org_id());

drop policy if exists tenant_isolation on public.subscriptions;
create policy tenant_isolation on public.subscriptions
  for all to app_tenant
  using (organization_id = app.current_org_id())
  with check (organization_id = app.current_org_id());

drop policy if exists tenant_isolation on public.product_events;
create policy tenant_isolation on public.product_events
  for all to app_tenant
  using (organization_id = app.current_org_id())
  with check (organization_id = app.current_org_id());

-- -----------------------------------------------------------------------------
-- 5. Tenant policies — CHILD tables with no org column (reach org via parent).
--    EXISTS traversal is used for both read and write checks. Indexes added in
--    section 8 keep these fast.
-- -----------------------------------------------------------------------------

drop policy if exists tenant_isolation on public.assessment_team_members;
create policy tenant_isolation on public.assessment_team_members
  for all to app_tenant
  using (exists (
    select 1 from public.assessments a
    where a.id = assessment_team_members."assessmentId"
      and a."organizationId" = app.current_org_id()))
  with check (exists (
    select 1 from public.assessments a
    where a.id = assessment_team_members."assessmentId"
      and a."organizationId" = app.current_org_id()));

drop policy if exists tenant_isolation on public.question_responses;
create policy tenant_isolation on public.question_responses
  for all to app_tenant
  using (exists (
    select 1 from public.assessments a
    where a.id = question_responses."assessmentId"
      and a."organizationId" = app.current_org_id()))
  with check (exists (
    select 1 from public.assessments a
    where a.id = question_responses."assessmentId"
      and a."organizationId" = app.current_org_id()));

drop policy if exists tenant_isolation on public.non_conformities;
create policy tenant_isolation on public.non_conformities
  for all to app_tenant
  using (exists (
    select 1 from public.assessments a
    where a.id = non_conformities."assessmentId"
      and a."organizationId" = app.current_org_id()))
  with check (exists (
    select 1 from public.assessments a
    where a.id = non_conformities."assessmentId"
      and a."organizationId" = app.current_org_id()));

drop policy if exists tenant_isolation on public.corrective_actions;
create policy tenant_isolation on public.corrective_actions
  for all to app_tenant
  using (exists (
    select 1
    from public.non_conformities nc
    join public.assessments a on a.id = nc."assessmentId"
    where nc.id = corrective_actions."nonConformityId"
      and a."organizationId" = app.current_org_id()))
  with check (exists (
    select 1
    from public.non_conformities nc
    join public.assessments a on a.id = nc."assessmentId"
    where nc.id = corrective_actions."nonConformityId"
      and a."organizationId" = app.current_org_id()));

drop policy if exists tenant_isolation on public.evidence;
create policy tenant_isolation on public.evidence
  for all to app_tenant
  using (exists (
    select 1
    from public.question_responses qr
    join public.assessments a on a.id = qr."assessmentId"
    where qr.id = evidence."responseId"
      and a."organizationId" = app.current_org_id()))
  with check (exists (
    select 1
    from public.question_responses qr
    join public.assessments a on a.id = qr."assessmentId"
    where qr.id = evidence."responseId"
      and a."organizationId" = app.current_org_id()));

-- -----------------------------------------------------------------------------
-- 6. Global / reference tables (shared across all tenants) — READ-only for the
--    app role. Writes stay with the elevated (bypass) connection used for
--    seeding the ISO standard content.
-- -----------------------------------------------------------------------------

drop policy if exists read_all on public.iso_standard_sections;
create policy read_all on public.iso_standard_sections
  for select to app_tenant using (true);

drop policy if exists read_all on public.audit_questions;
create policy read_all on public.audit_questions
  for select to app_tenant using (true);

-- -----------------------------------------------------------------------------
-- 7. Public landing-page table: allow anonymous INSERT (waitlist signups) via
--    the anon key, nothing else. Reads/exports happen through the elevated
--    connection. (waitlist rows contain emails = personal data; keep them off
--    the tenant role.)
-- -----------------------------------------------------------------------------

drop policy if exists anon_can_join_waitlist on public.waitlist;
create policy anon_can_join_waitlist on public.waitlist
  for insert to anon with check (true);
grant insert on public.waitlist to anon;

-- -----------------------------------------------------------------------------
-- 8. Security fixes flagged by the Supabase linter.
-- -----------------------------------------------------------------------------

revoke execute on function public.rls_auto_enable() from anon, authenticated, public;
revoke select ("passwordHash", "refreshToken") on public.users from anon, authenticated;

-- -----------------------------------------------------------------------------
-- 9. Indexes supporting the child-table policy traversals.
-- -----------------------------------------------------------------------------

create index if not exists idx_qr_assessmentId
  on public.question_responses ("assessmentId");
create index if not exists idx_nc_assessmentId
  on public.non_conformities ("assessmentId");
create index if not exists idx_ca_nonConformityId
  on public.corrective_actions ("nonConformityId");
create index if not exists idx_evidence_responseId
  on public.evidence ("responseId");
create index if not exists idx_atm_assessmentId
  on public.assessment_team_members ("assessmentId");

commit;
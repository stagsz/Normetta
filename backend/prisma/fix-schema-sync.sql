  -- Schema sync: adds columns/tables introduced by the onboarding feature (PR #2)
  -- Run this once in Supabase Dashboard → SQL Editor

  -- New enums
  CREATE TYPE "PermissionLevel" AS ENUM ('ADMIN', 'MANAGER', 'AUDITOR', 'DEPT_HEAD', 'VIEWER');
  CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

  -- New columns on existing tables
  ALTER TABLE organizations ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
  ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "setupComplete" BOOLEAN NOT NULL DEFAULT false;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS "refreshToken" TEXT;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS "orgRoleId" TEXT;

  -- New tables (TEXT ids/fks to match Prisma's default String @id convention)
  CREATE TABLE IF NOT EXISTS divisions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "organizationId" TEXT NOT NULL REFERENCES organizations(id)
  );

  CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "organizationId" TEXT NOT NULL REFERENCES organizations(id),
    "divisionId" TEXT REFERENCES divisions(id)
  );

  CREATE TABLE IF NOT EXISTS org_roles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    "permissionLevel" "PermissionLevel" NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "organizationId" TEXT NOT NULL REFERENCES organizations(id)
  );

  ALTER TABLE users ADD CONSTRAINT "users_orgRoleId_fkey"
    FOREIGN KEY ("orgRoleId") REFERENCES org_roles(id);

  CREATE TABLE IF NOT EXISTS user_org_invites (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    status "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "userId" TEXT NOT NULL REFERENCES users(id),
    "organizationId" TEXT NOT NULL REFERENCES organizations(id)
  );

  -- Indexes
  CREATE INDEX IF NOT EXISTS "divisions_organizationId_idx" ON divisions("organizationId");
  CREATE INDEX IF NOT EXISTS "departments_organizationId_idx" ON departments("organizationId");
  CREATE INDEX IF NOT EXISTS "departments_divisionId_idx" ON departments("divisionId");
  CREATE INDEX IF NOT EXISTS "org_roles_organizationId_idx" ON org_roles("organizationId");
  CREATE INDEX IF NOT EXISTS "user_org_invites_userId_idx" ON user_org_invites("userId");
  CREATE INDEX IF NOT EXISTS "user_org_invites_organizationId_idx" ON user_org_invites("organizationId");

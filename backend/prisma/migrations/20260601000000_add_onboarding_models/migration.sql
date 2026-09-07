-- CreateEnum
CREATE TYPE "PermissionLevel" AS ENUM ('ADMIN', 'MANAGER', 'AUDITOR', 'DEPT_HEAD', 'VIEWER');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable Organization
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "slug" TEXT UNIQUE;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "setup_complete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable User
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "org_role_id" TEXT;

-- CreateTable
CREATE TABLE "divisions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organization_id" TEXT NOT NULL,

    CONSTRAINT "divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organization_id" TEXT NOT NULL,
    "division_id" TEXT,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "permission_level" "PermissionLevel" NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organization_id" TEXT NOT NULL,

    CONSTRAINT "org_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_org_invites" (
    "id" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,

    CONSTRAINT "user_org_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "divisions_organization_id_idx" ON "divisions"("organization_id");

-- CreateIndex
CREATE INDEX "departments_organization_id_idx" ON "departments"("organization_id");

-- CreateIndex
CREATE INDEX "departments_division_id_idx" ON "departments"("division_id");

-- CreateIndex
CREATE INDEX "org_roles_organization_id_idx" ON "org_roles"("organization_id");

-- CreateIndex
CREATE INDEX "user_org_invites_user_id_idx" ON "user_org_invites"("user_id");

-- CreateIndex
CREATE INDEX "user_org_invites_organization_id_idx" ON "user_org_invites"("organization_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_org_role_id_fkey" FOREIGN KEY ("org_role_id") REFERENCES "org_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "divisions" ADD CONSTRAINT "divisions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_roles" ADD CONSTRAINT "org_roles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_org_invites" ADD CONSTRAINT "user_org_invites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_org_invites" ADD CONSTRAINT "user_org_invites_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

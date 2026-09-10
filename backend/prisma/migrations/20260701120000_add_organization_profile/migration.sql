-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('MICRO', 'SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "QMSStatus" AS ENUM ('NONE', 'BUILDING', 'INFORMAL', 'DOCUMENTED');

-- CreateEnum
CREATE TYPE "CertificationStatus" AS ENUM ('NOT_CERTIFIED', 'IN_PROGRESS', 'CERTIFIED_SURVEILLANCE', 'CERTIFIED_RECERTIFYING');

-- CreateEnum
CREATE TYPE "StandardsKnowledgeLevel" AS ENUM ('NONE', 'BASIC', 'TRAINED', 'CERTIFIED_AUDITOR');

-- AlterTable Organization
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "industry" TEXT;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "country" TEXT;

-- CreateTable
CREATE TABLE "organization_profiles" (
    "id" TEXT NOT NULL,
    "company_size" "CompanySize",
    "qms_status" "QMSStatus",
    "certification_status" "CertificationStatus",
    "last_audit_summary" TEXT,
    "improvement_notes" TEXT,
    "standards_knowledge_level" "StandardsKnowledgeLevel",
    "hours_per_week" INTEGER,
    "ai_profile" JSONB,
    "interview_transcript" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "organization_id" TEXT NOT NULL,

    CONSTRAINT "organization_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_profiles_organization_id_key" ON "organization_profiles"("organization_id");

-- AddForeignKey
ALTER TABLE "organization_profiles" ADD CONSTRAINT "organization_profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

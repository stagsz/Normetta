import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { seedSections } from "./seed/sections";
import { seedQuestions } from "./seed/questions-v2";
import { seedTemplates } from "./seed/templates";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Generate consistent UUIDs for seeding (same seed = same UUIDs)
const DEFAULT_ORG_ID = "00000000-0000-4000-8000-000000000001";
const DEFAULT_TEMPLATE_ID = "00000000-0000-4000-8000-000000000002";
const SAMPLE_ASSESSMENT_ID = "00000000-0000-4000-8000-000000000003";
const SAMPLE_NCR_ID = "00000000-0000-4000-8000-000000000004";
const SAMPLE_ACTION_ID = "00000000-0000-4000-8000-000000000005";

/**
 * Main seed entry point for ISO 9001 Self-Assessment application.
 * Seeds:
 * 1. ISO 9001:2015 standard sections (from seed/sections.ts)
 * 2. Audit questions (from seed/questions.ts)
 * 3. Default organization and admin user
 * 4. Sample assessment with responses
 */
async function main() {
  console.log("Starting database seeding...\n");

  // 1. Seed ISO 9001:2015 sections
  await seedSections();

  // 2. Seed audit questions (must come after sections)
  await seedQuestions();

  // 3. Create default organization
  console.log("\nSeeding default organization and users...");

  const defaultOrg = await prisma.organization.upsert({
    where: { id: DEFAULT_ORG_ID },
    update: {
      name: "Default Organization",
    },
    create: {
      id: DEFAULT_ORG_ID,
      name: "Default Organization",
    },
  });
  console.log(`  + Organization: ${defaultOrg.name} (${defaultOrg.id})`);

  // 4. Create admin user (admin@greisz.se / admin123)
  const adminPasswordHash = await bcryptjs.hash("admin123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@greisz.se" },
    update: {
      passwordHash: adminPasswordHash,
      firstName: "System",
      lastName: "Administrator",
      role: "SYSTEM_ADMIN",
      organizationId: defaultOrg.id,
      isActive: true,
      emailDomain: "greisz.se",
    },
    create: {
      email: "admin@greisz.se",
      passwordHash: adminPasswordHash,
      firstName: "System",
      lastName: "Administrator",
      role: "SYSTEM_ADMIN",
      organizationId: defaultOrg.id,
      isActive: true,
      emailDomain: "greisz.se",
    },
  });
  console.log(`  + Admin user: ${adminUser.email} (role: ${adminUser.role})`);

  // 5. Create sample Quality Manager user
  const qmPasswordHash = await bcryptjs.hash("quality123", 10);

  const qualityManager = await prisma.user.upsert({
    where: { email: "quality.manager@greisz.se" },
    update: {
      passwordHash: qmPasswordHash,
      firstName: "Quality",
      lastName: "Manager",
      role: "QUALITY_MANAGER",
      organizationId: defaultOrg.id,
      isActive: true,
      emailDomain: "greisz.se",
    },
    create: {
      email: "quality.manager@greisz.se",
      passwordHash: qmPasswordHash,
      firstName: "Quality",
      lastName: "Manager",
      role: "QUALITY_MANAGER",
      organizationId: defaultOrg.id,
      isActive: true,
      emailDomain: "greisz.se",
    },
  });
  console.log(`  + Quality Manager: ${qualityManager.email} (role: ${qualityManager.role})`);

  // 6. Create sample Internal Auditor user
  const auditorPasswordHash = await bcryptjs.hash("auditor123", 10);

  const internalAuditor = await prisma.user.upsert({
    where: { email: "auditor@greisz.se" },
    update: {
      passwordHash: auditorPasswordHash,
      firstName: "Internal",
      lastName: "Auditor",
      role: "INTERNAL_AUDITOR",
      organizationId: defaultOrg.id,
      isActive: true,
      emailDomain: "greisz.se",
    },
    create: {
      email: "auditor@greisz.se",
      passwordHash: auditorPasswordHash,
      firstName: "Internal",
      lastName: "Auditor",
      role: "INTERNAL_AUDITOR",
      organizationId: defaultOrg.id,
      isActive: true,
      emailDomain: "greisz.se",
    },
  });
  console.log(`  + Internal Auditor: ${internalAuditor.email} (role: ${internalAuditor.role})`);

  // 7. Seed predefined assessment templates
  await seedTemplates(defaultOrg.id);

  // 8. Create sample assessment with some responses
  console.log("\nSeeding sample assessment...");

  const sampleAssessment = await prisma.assessment.upsert({
    where: { id: SAMPLE_ASSESSMENT_ID },
    update: {
      title: "Q1 2026 Internal Audit",
      description: "Quarterly internal audit for ISO 9001:2015 compliance assessment",
      status: "IN_PROGRESS",
      auditType: "INTERNAL",
      scope: "All departments and processes within the organization",
      objectives: "Verify QMS compliance, identify improvement opportunities, prepare for external certification audit",
      organizationId: defaultOrg.id,
      leadAuditorId: qualityManager.id,
      templateId: DEFAULT_TEMPLATE_ID,
      scheduledDate: new Date("2026-01-15"),
      dueDate: new Date("2026-02-28"),
    },
    create: {
      id: SAMPLE_ASSESSMENT_ID,
      title: "Q1 2026 Internal Audit",
      description: "Quarterly internal audit for ISO 9001:2015 compliance assessment",
      status: "IN_PROGRESS",
      auditType: "INTERNAL",
      scope: "All departments and processes within the organization",
      objectives: "Verify QMS compliance, identify improvement opportunities, prepare for external certification audit",
      organizationId: defaultOrg.id,
      leadAuditorId: qualityManager.id,
      templateId: DEFAULT_TEMPLATE_ID,
      scheduledDate: new Date("2026-01-15"),
      dueDate: new Date("2026-02-28"),
    },
  });
  console.log(`  + Assessment: ${sampleAssessment.title} (status: ${sampleAssessment.status})`);

  // 9. Add team members to the assessment
  const teamMember1 = await prisma.assessmentTeamMember.upsert({
    where: {
      assessmentId_userId: {
        assessmentId: sampleAssessment.id,
        userId: qualityManager.id,
      },
    },
    update: {
      role: "LEAD_AUDITOR",
    },
    create: {
      assessmentId: sampleAssessment.id,
      userId: qualityManager.id,
      role: "LEAD_AUDITOR",
    },
  });
  console.log(`  + Team member: ${qualityManager.email} (${teamMember1.role})`);

  const teamMember2 = await prisma.assessmentTeamMember.upsert({
    where: {
      assessmentId_userId: {
        assessmentId: sampleAssessment.id,
        userId: internalAuditor.id,
      },
    },
    update: {
      role: "AUDITOR",
    },
    create: {
      assessmentId: sampleAssessment.id,
      userId: internalAuditor.id,
      role: "AUDITOR",
    },
  });
  console.log(`  + Team member: ${internalAuditor.email} (${teamMember2.role})`);

  // 10. Create sample question responses
  console.log("\nSeeding sample question responses...");

  // Get some questions and their sections to create responses
  const questions = await prisma.auditQuestion.findMany({
    take: 10,
    orderBy: { questionNumber: "asc" },
    include: { section: true },
  });

  // Sample responses with varying scores
  const sampleResponses = [
    { score: 3, justification: "Comprehensive SWOT and PESTLE analysis documented and reviewed annually. Clear linkage to QMS objectives.", isDraft: false },
    { score: 3, justification: "Stakeholder register maintained with requirements for customers, regulators, suppliers, and employees. Reviewed quarterly.", isDraft: false },
    { score: 2, justification: "QMS scope is documented but some exclusions lack proper justification. Recommend updating the scope statement.", isDraft: false },
    { score: 3, justification: "Process maps with turtle diagrams for all key processes. Interactions clearly defined in the process manual.", isDraft: false },
    { score: 2, justification: "Top management is engaged but some communication gaps exist. Management review attendance inconsistent.", isDraft: false },
    { score: 3, justification: "Strong customer focus demonstrated through satisfaction surveys, complaint tracking, and regular customer meetings.", isDraft: false },
    { score: 2, justification: "Quality policy exists and is communicated but some employees unaware of specific objectives.", isDraft: true },
    { score: 1, justification: "Role definitions need improvement. Some job descriptions outdated and responsibilities unclear in cross-functional processes.", isDraft: true },
    { score: 3, justification: "Risk register maintained with FMEA methodology. Actions tracked and integrated into QMS planning.", isDraft: false },
    { score: 2, justification: "Quality objectives exist but not all are SMART. Some departments lack specific measurable targets.", isDraft: true },
  ];

  let responsesCreated = 0;
  for (let i = 0; i < questions.length && i < sampleResponses.length; i++) {
    const question = questions[i];
    const responseData = sampleResponses[i];

    await prisma.questionResponse.upsert({
      where: {
        assessmentId_questionId: {
          assessmentId: sampleAssessment.id,
          questionId: question.id,
        },
      },
      update: {
        score: responseData.score,
        justification: responseData.justification,
        isDraft: responseData.isDraft,
        userId: internalAuditor.id,
        sectionId: question.sectionId,
      },
      create: {
        assessmentId: sampleAssessment.id,
        questionId: question.id,
        score: responseData.score,
        justification: responseData.justification,
        isDraft: responseData.isDraft,
        userId: internalAuditor.id,
        sectionId: question.sectionId,
      },
    });
    responsesCreated++;
  }
  console.log(`  + Created ${responsesCreated} sample responses`);

  // 11. Calculate and update overall score
  const responses = await prisma.questionResponse.findMany({
    where: { assessmentId: sampleAssessment.id, isDraft: false },
    select: { score: true },
  });

  const completedResponses = responses.filter((r) => r.score !== null);
  if (completedResponses.length > 0) {
    const totalScore = completedResponses.reduce((sum, r) => sum + (r.score || 0), 0);
    const averageScore = totalScore / completedResponses.length;

    await prisma.assessment.update({
      where: { id: sampleAssessment.id },
      data: { overallScore: Math.round(averageScore * 100) / 100 },
    });
    console.log(`  + Updated overall score: ${(averageScore * 100 / 3).toFixed(1)}% (${averageScore.toFixed(2)}/3)`);
  }

  // 12. Create a sample non-conformity for the low-scoring response
  console.log("\nSeeding sample non-conformity...");

  const lowScoreResponse = await prisma.questionResponse.findFirst({
    where: {
      assessmentId: sampleAssessment.id,
      score: 1,
    },
    include: { question: true },
  });

  if (lowScoreResponse) {
    const nonConformity = await prisma.nonConformity.upsert({
      where: { id: SAMPLE_NCR_ID },
      update: {
        title: "Unclear organizational roles and responsibilities",
        description: "During the audit, it was identified that role definitions need improvement. Some job descriptions are outdated and responsibilities are unclear in cross-functional processes.",
        severity: "MAJOR",
        status: "OPEN",
        assessmentId: sampleAssessment.id,
        responseId: lowScoreResponse.id,
      },
      create: {
        id: SAMPLE_NCR_ID,
        title: "Unclear organizational roles and responsibilities",
        description: "During the audit, it was identified that role definitions need improvement. Some job descriptions are outdated and responsibilities are unclear in cross-functional processes.",
        severity: "MAJOR",
        status: "OPEN",
        assessmentId: sampleAssessment.id,
        responseId: lowScoreResponse.id,
      },
    });
    console.log(`  + Non-conformity: ${nonConformity.title} (${nonConformity.severity})`);

    // 13. Create a sample corrective action
    const correctiveAction = await prisma.correctiveAction.upsert({
      where: { id: SAMPLE_ACTION_ID },
      update: {
        description: "Review and update all job descriptions to clearly define QMS-related responsibilities. Create RACI matrix for cross-functional processes.",
        priority: "HIGH",
        status: "PENDING",
        targetDate: new Date("2026-03-15"),
        nonConformityId: nonConformity.id,
        assignedToId: qualityManager.id,
      },
      create: {
        id: SAMPLE_ACTION_ID,
        description: "Review and update all job descriptions to clearly define QMS-related responsibilities. Create RACI matrix for cross-functional processes.",
        priority: "HIGH",
        status: "PENDING",
        targetDate: new Date("2026-03-15"),
        nonConformityId: nonConformity.id,
        assignedToId: qualityManager.id,
      },
    });
    console.log(`  + Corrective action: ${correctiveAction.description.substring(0, 50)}... (${correctiveAction.priority})`);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("Seed completed successfully!");
  console.log("=".repeat(60));
  console.log("\nDefault credentials:");
  console.log("  Admin:           admin@example.com / admin123");
  console.log("  Quality Manager: quality.manager@example.com / quality123");
  console.log("  Internal Auditor: auditor@example.com / auditor123");
  console.log("\nNote: Change these passwords in production!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

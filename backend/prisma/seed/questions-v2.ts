import { PrismaClient } from "@prisma/client";
import { auditQuestions } from "./iso9001-seed-data-v2";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

/**
 * Seed Audit Questions with 0-5 scoring scale
 *
 * SCORING SCALE:
 * 0 = Not Applicable (N/A)
 * 1 = Non-compliant
 * 2 = Initial
 * 3 = Developing
 * 4 = Established
 * 5 = Optimizing
 */
export async function seedQuestions() {
  console.log("\nSeeding Audit Questions (0-5 scale)...");

  // Get section number to ID mapping
  const sections = await prisma.iSOStandardSection.findMany();
  const sectionMap = new Map<string, string>();
  sections.forEach((s) => {
    sectionMap.set(s.sectionNumber, s.id);
  });

  let questionCount = 0;

  for (const question of auditQuestions) {
    const sectionId = sectionMap.get(question.sectionNumber);

    if (!sectionId) {
      console.warn(`   ⚠️  Section not found for: ${question.sectionNumber}`);
      continue;
    }

    // Generate question number from section + index
    const questionNumber = `${question.sectionNumber}-${String(questionCount + 1).padStart(2, "0")}`;

    await prisma.auditQuestion.upsert({
      where: { questionNumber },
      update: {
        questionText: question.auditQuestion,
        guidance: question.standardText,
        score0Criteria: question.score0Criteria,
        score1Criteria: question.score1Criteria,
        score2Criteria: question.score2Criteria,
        score3Criteria: question.score3Criteria,
        score4Criteria: question.score4Criteria,
        score5Criteria: question.score5Criteria,
        standardReference: question.standardReference,
        sectionId: sectionId,
        order: questionCount + 1,
        isActive: true,
      },
      create: {
        questionNumber,
        questionText: question.auditQuestion,
        guidance: question.standardText,
        score0Criteria: question.score0Criteria,
        score1Criteria: question.score1Criteria,
        score2Criteria: question.score2Criteria,
        score3Criteria: question.score3Criteria,
        score4Criteria: question.score4Criteria,
        score5Criteria: question.score5Criteria,
        standardReference: question.standardReference,
        sectionId: sectionId,
        order: questionCount + 1,
        isActive: true,
      },
    });

    questionCount++;
  }

  console.log(`  ✅ Created ${questionCount} audit questions`);
  console.log(`\n  SCORING SCALE:`);
  console.log(`  0 = Not Applicable (N/A)`);
  console.log(`  1 = Non-compliant`);
  console.log(`  2 = Initial`);
  console.log(`  3 = Developing`);
  console.log(`  4 = Established`);
  console.log(`  5 = Optimizing`);
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Sample audit questions for ISO 9001:2015 (3-5 per major section)
// Each question links to a section, has clear score criteria, and guidance
interface QuestionInput {
  questionNumber: string;
  sectionNumber: string; // References ISOStandardSection.sectionNumber
  questionText: string;
  guidance: string;
  score1Criteria: string;
  score2Criteria: string;
  score3Criteria: string;
  standardReference: string;
  order: number;
}

const AUDIT_QUESTIONS: QuestionInput[] = [
  // Section 4: Context of the Organization
  {
    questionNumber: "4.1-01",
    sectionNumber: "4.1",
    questionText:
      "Has the organization determined external and internal issues relevant to its purpose and strategic direction?",
    guidance:
      "Review documented evidence of SWOT analysis, PESTLE analysis, or similar strategic planning outputs. Check for regular reviews and updates.",
    score1Criteria:
      "No documented analysis of external/internal issues exists, or the analysis is severely outdated (>3 years)",
    score2Criteria:
      "Some analysis exists but is incomplete, not regularly reviewed, or not clearly linked to QMS",
    score3Criteria:
      "Comprehensive analysis of external/internal issues is documented, regularly reviewed, and integrated into QMS planning",
    standardReference: "ISO 9001:2015 Clause 4.1",
    order: 1,
  },
  {
    questionNumber: "4.2-01",
    sectionNumber: "4.2",
    questionText:
      "Has the organization identified interested parties relevant to the QMS and their requirements?",
    guidance:
      "Look for a stakeholder register or interested parties analysis. Verify that requirements from key stakeholders (customers, regulators, suppliers) are identified.",
    score1Criteria:
      "No identification of interested parties or their requirements",
    score2Criteria:
      "Some interested parties identified but requirements are vague or incomplete",
    score3Criteria:
      "All relevant interested parties identified with clear, documented requirements that are monitored and reviewed",
    standardReference: "ISO 9001:2015 Clause 4.2",
    order: 1,
  },
  {
    questionNumber: "4.3-01",
    sectionNumber: "4.3",
    questionText:
      "Is the scope of the QMS clearly defined, documented, and available?",
    guidance:
      "Review the QMS scope statement. Verify it addresses products/services, organizational boundaries, and any exclusions with justification.",
    score1Criteria:
      "No documented QMS scope, or scope is unclear and does not reflect actual operations",
    score2Criteria:
      "Scope is documented but incomplete, missing justification for exclusions, or not readily available",
    score3Criteria:
      "Scope is clearly documented, includes all applicable requirements, justifies any exclusions, and is readily available",
    standardReference: "ISO 9001:2015 Clause 4.3",
    order: 1,
  },
  {
    questionNumber: "4.4-01",
    sectionNumber: "4.4",
    questionText:
      "Has the organization established processes needed for the QMS and determined their sequence and interaction?",
    guidance:
      "Review process maps, flowcharts, or turtle diagrams. Verify processes are identified with inputs, outputs, and interactions defined.",
    score1Criteria:
      "No process identification or mapping exists",
    score2Criteria:
      "Some processes identified but interactions are unclear or documentation is incomplete",
    score3Criteria:
      "All QMS processes are identified, documented with clear inputs/outputs, and interactions are well-defined",
    standardReference: "ISO 9001:2015 Clause 4.4",
    order: 1,
  },

  // Section 5: Leadership
  {
    questionNumber: "5.1.1-01",
    sectionNumber: "5.1.1",
    questionText:
      "Does top management demonstrate leadership and commitment to the QMS?",
    guidance:
      "Interview top management. Review evidence of accountability, resource allocation, communication of importance, and promotion of improvement.",
    score1Criteria:
      "No evidence of top management involvement or commitment to QMS",
    score2Criteria:
      "Some involvement but inconsistent engagement, limited visibility, or delegation without accountability",
    score3Criteria:
      "Top management actively demonstrates commitment through regular reviews, resource provision, and visible engagement",
    standardReference: "ISO 9001:2015 Clause 5.1.1",
    order: 1,
  },
  {
    questionNumber: "5.1.2-01",
    sectionNumber: "5.1.2",
    questionText:
      "Does top management ensure customer focus is maintained throughout the organization?",
    guidance:
      "Review customer satisfaction data, complaint handling, and how customer requirements flow into operations.",
    score1Criteria:
      "No systematic approach to understanding or meeting customer requirements",
    score2Criteria:
      "Customer requirements are considered but not consistently communicated or measured",
    score3Criteria:
      "Customer focus is embedded in culture with clear processes for determining, meeting, and measuring customer satisfaction",
    standardReference: "ISO 9001:2015 Clause 5.1.2",
    order: 1,
  },
  {
    questionNumber: "5.2.1-01",
    sectionNumber: "5.2.1",
    questionText:
      "Has a quality policy been established that is appropriate to the organization's context?",
    guidance:
      "Review the quality policy. Verify it is appropriate to purpose, provides framework for objectives, and includes commitment to requirements and improvement.",
    score1Criteria:
      "No quality policy exists or policy is generic and not relevant to the organization",
    score2Criteria:
      "Quality policy exists but is outdated, lacks specific commitments, or doesn't provide framework for objectives",
    score3Criteria:
      "Quality policy is current, specific to the organization, provides clear framework for objectives, and includes required commitments",
    standardReference: "ISO 9001:2015 Clause 5.2.1",
    order: 1,
  },
  {
    questionNumber: "5.3-01",
    sectionNumber: "5.3",
    questionText:
      "Are responsibilities and authorities for relevant roles assigned, communicated, and understood?",
    guidance:
      "Review organization charts, job descriptions, and role assignments. Interview personnel to verify understanding.",
    score1Criteria:
      "Roles and responsibilities are not defined or documented",
    score2Criteria:
      "Roles defined but not clearly communicated or personnel show limited understanding",
    score3Criteria:
      "Roles and responsibilities are clearly defined, documented, communicated, and understood at all levels",
    standardReference: "ISO 9001:2015 Clause 5.3",
    order: 1,
  },

  // Section 6: Planning
  {
    questionNumber: "6.1-01",
    sectionNumber: "6.1",
    questionText:
      "Has the organization determined risks and opportunities that need to be addressed?",
    guidance:
      "Review risk assessments, risk registers, and opportunity analyses. Verify actions are planned and integrated into QMS processes.",
    score1Criteria:
      "No risk and opportunity assessment performed",
    score2Criteria:
      "Some risks/opportunities identified but assessment is incomplete or actions not planned",
    score3Criteria:
      "Comprehensive risk and opportunity assessment with documented actions integrated into QMS processes",
    standardReference: "ISO 9001:2015 Clause 6.1",
    order: 1,
  },
  {
    questionNumber: "6.2-01",
    sectionNumber: "6.2",
    questionText:
      "Are quality objectives established at relevant functions, levels, and processes?",
    guidance:
      "Review quality objectives. Verify they are consistent with policy, measurable, monitored, communicated, and updated as appropriate.",
    score1Criteria:
      "No quality objectives established, or objectives are not measurable",
    score2Criteria:
      "Some objectives exist but are not comprehensive, not monitored, or not clearly linked to policy",
    score3Criteria:
      "Quality objectives are SMART (Specific, Measurable, Achievable, Relevant, Time-bound), monitored, and linked to policy",
    standardReference: "ISO 9001:2015 Clause 6.2",
    order: 1,
  },
  {
    questionNumber: "6.3-01",
    sectionNumber: "6.3",
    questionText:
      "Are changes to the QMS planned and carried out in a controlled manner?",
    guidance:
      "Review change management procedures and examples of recent QMS changes. Verify changes consider purpose, integrity, resources, and responsibilities.",
    score1Criteria:
      "No change management process exists or changes are made without planning",
    score2Criteria:
      "Change process exists but is not consistently followed or documented",
    score3Criteria:
      "Changes are systematically planned, documented, and implemented with consideration for all required factors",
    standardReference: "ISO 9001:2015 Clause 6.3",
    order: 1,
  },

  // Section 7: Support
  {
    questionNumber: "7.1.1-01",
    sectionNumber: "7.1.1",
    questionText:
      "Does the organization determine and provide resources needed for the QMS?",
    guidance:
      "Review resource planning, budgets, and evidence of resource provision. Consider internal capabilities and external provider needs.",
    score1Criteria:
      "No systematic approach to identifying or providing QMS resources",
    score2Criteria:
      "Resources are provided but planning is reactive or inconsistent",
    score3Criteria:
      "Systematic approach to identifying, planning, and providing resources with clear consideration of capabilities and constraints",
    standardReference: "ISO 9001:2015 Clause 7.1.1",
    order: 1,
  },
  {
    questionNumber: "7.2-01",
    sectionNumber: "7.2",
    questionText:
      "Has the organization determined necessary competencies and ensured personnel are competent?",
    guidance:
      "Review competency requirements, training records, qualifications, and evidence of competency evaluation.",
    score1Criteria:
      "No competency requirements defined or training records maintained",
    score2Criteria:
      "Competencies partially defined, training provided but gaps exist or evaluation is inconsistent",
    score3Criteria:
      "Competencies clearly defined for all relevant roles, personnel are competent, and records are maintained",
    standardReference: "ISO 9001:2015 Clause 7.2",
    order: 1,
  },
  {
    questionNumber: "7.4-01",
    sectionNumber: "7.4",
    questionText:
      "Has the organization determined internal and external communications relevant to the QMS?",
    guidance:
      "Review communication plans and procedures. Verify what, when, with whom, how, and who communicates is defined.",
    score1Criteria:
      "No defined communication processes for QMS-related information",
    score2Criteria:
      "Some communication defined but incomplete or inconsistently implemented",
    score3Criteria:
      "Comprehensive communication processes defined and implemented covering what, when, with whom, how, and who",
    standardReference: "ISO 9001:2015 Clause 7.4",
    order: 1,
  },
  {
    questionNumber: "7.5.1-01",
    sectionNumber: "7.5.1",
    questionText:
      "Does the QMS include required documented information?",
    guidance:
      "Review documented information required by the standard and determined necessary by the organization. Check for quality manual, procedures, and records.",
    score1Criteria:
      "Required documented information is missing or severely inadequate",
    score2Criteria:
      "Most documented information exists but some gaps or organization-specific needs not addressed",
    score3Criteria:
      "All required documented information exists and organization has determined additional documentation needed for effectiveness",
    standardReference: "ISO 9001:2015 Clause 7.5.1",
    order: 1,
  },

  // Section 8: Operation
  {
    questionNumber: "8.1-01",
    sectionNumber: "8.1",
    questionText:
      "Has the organization planned, implemented, and controlled processes for provision of products and services?",
    guidance:
      "Review operational planning outputs, process controls, and evidence of implementation. Verify criteria for processes and acceptance are established.",
    score1Criteria:
      "Operational processes are not planned or controlled",
    score2Criteria:
      "Some operational planning exists but controls are incomplete or inconsistently applied",
    score3Criteria:
      "Comprehensive operational planning with clear criteria, controls, and resources for all processes",
    standardReference: "ISO 9001:2015 Clause 8.1",
    order: 1,
  },
  {
    questionNumber: "8.2.1-01",
    sectionNumber: "8.2.1",
    questionText:
      "Does the organization effectively communicate with customers regarding products/services?",
    guidance:
      "Review customer communication processes covering information, enquiries, contracts, feedback, and property handling.",
    score1Criteria:
      "No systematic customer communication processes exist",
    score2Criteria:
      "Customer communication exists but is reactive or inconsistent across channels",
    score3Criteria:
      "Proactive, systematic customer communication covering all required aspects with clear responsibilities",
    standardReference: "ISO 9001:2015 Clause 8.2.1",
    order: 1,
  },
  {
    questionNumber: "8.4.1-01",
    sectionNumber: "8.4.1",
    questionText:
      "Does the organization ensure externally provided processes, products, and services conform to requirements?",
    guidance:
      "Review supplier evaluation, selection, monitoring, and control processes. Check for criteria and documented information.",
    score1Criteria:
      "No controls exist for external providers",
    score2Criteria:
      "Some controls exist but criteria for evaluation or monitoring are incomplete",
    score3Criteria:
      "Comprehensive external provider controls including evaluation, selection, monitoring, and re-evaluation processes",
    standardReference: "ISO 9001:2015 Clause 8.4.1",
    order: 1,
  },
  {
    questionNumber: "8.5.1-01",
    sectionNumber: "8.5.1",
    questionText:
      "Is production and service provision implemented under controlled conditions?",
    guidance:
      "Review controls for production/service including documented information, resources, monitoring, infrastructure, and competent personnel.",
    score1Criteria:
      "Production/service provision lacks necessary controls",
    score2Criteria:
      "Some controls implemented but gaps exist in monitoring, documentation, or resources",
    score3Criteria:
      "Comprehensive controlled conditions including all necessary documentation, monitoring, infrastructure, and competent personnel",
    standardReference: "ISO 9001:2015 Clause 8.5.1",
    order: 1,
  },
  {
    questionNumber: "8.7-01",
    sectionNumber: "8.7",
    questionText:
      "Are nonconforming outputs identified and controlled to prevent unintended use or delivery?",
    guidance:
      "Review nonconforming product procedures, identification methods, segregation, and documented information retained.",
    score1Criteria:
      "No process for identifying or controlling nonconforming outputs",
    score2Criteria:
      "Process exists but identification is inconsistent or controls are not always applied",
    score3Criteria:
      "Robust process for identification, segregation, and control of nonconforming outputs with clear documentation",
    standardReference: "ISO 9001:2015 Clause 8.7",
    order: 1,
  },

  // Section 9: Performance Evaluation
  {
    questionNumber: "9.1.1-01",
    sectionNumber: "9.1.1",
    questionText:
      "Has the organization determined what needs to be monitored and measured?",
    guidance:
      "Review monitoring and measurement plans. Verify methods, timing, and analysis requirements are defined.",
    score1Criteria:
      "No systematic approach to monitoring and measurement",
    score2Criteria:
      "Some monitoring defined but incomplete coverage or inconsistent methods",
    score3Criteria:
      "Comprehensive monitoring and measurement plan covering what, methods, when to monitor, and when to analyze",
    standardReference: "ISO 9001:2015 Clause 9.1.1",
    order: 1,
  },
  {
    questionNumber: "9.1.2-01",
    sectionNumber: "9.1.2",
    questionText:
      "Does the organization monitor customer perceptions of the degree to which their needs and expectations have been fulfilled?",
    guidance:
      "Review customer satisfaction measurement methods including surveys, feedback, complaints, and other indicators.",
    score1Criteria:
      "No customer satisfaction monitoring exists",
    score2Criteria:
      "Some monitoring exists but methods are limited or data not systematically analyzed",
    score3Criteria:
      "Comprehensive customer satisfaction monitoring with multiple methods, regular analysis, and action on results",
    standardReference: "ISO 9001:2015 Clause 9.1.2",
    order: 1,
  },
  {
    questionNumber: "9.2-01",
    sectionNumber: "9.2",
    questionText:
      "Does the organization conduct internal audits at planned intervals?",
    guidance:
      "Review audit program, schedules, auditor competence, audit reports, and corrective action follow-up.",
    score1Criteria:
      "No internal audit program exists or audits are not conducted",
    score2Criteria:
      "Audits conducted but program is incomplete, auditors lack competence, or follow-up is inadequate",
    score3Criteria:
      "Comprehensive audit program with competent auditors, planned intervals, and effective corrective action follow-up",
    standardReference: "ISO 9001:2015 Clause 9.2",
    order: 1,
  },
  {
    questionNumber: "9.3.1-01",
    sectionNumber: "9.3.1",
    questionText:
      "Does top management review the QMS at planned intervals?",
    guidance:
      "Review management review records, frequency, attendees, and completeness of inputs and outputs.",
    score1Criteria:
      "No management reviews conducted or records do not exist",
    score2Criteria:
      "Management reviews conducted but irregular, incomplete inputs/outputs, or limited top management involvement",
    score3Criteria:
      "Regular management reviews with top management involvement, complete inputs/outputs, and documented results",
    standardReference: "ISO 9001:2015 Clause 9.3.1",
    order: 1,
  },

  // Section 10: Improvement
  {
    questionNumber: "10.1-01",
    sectionNumber: "10.1",
    questionText:
      "Does the organization determine and select opportunities for improvement?",
    guidance:
      "Review improvement processes, innovation initiatives, and how opportunities are identified and prioritized.",
    score1Criteria:
      "No systematic approach to identifying improvement opportunities",
    score2Criteria:
      "Some improvement activities exist but are reactive or not systematically managed",
    score3Criteria:
      "Proactive, systematic approach to identifying, prioritizing, and implementing improvements",
    standardReference: "ISO 9001:2015 Clause 10.1",
    order: 1,
  },
  {
    questionNumber: "10.2-01",
    sectionNumber: "10.2",
    questionText:
      "When nonconformities occur, does the organization take appropriate corrective action?",
    guidance:
      "Review corrective action process including reaction, root cause analysis, action implementation, and effectiveness review.",
    score1Criteria:
      "No corrective action process exists or nonconformities are not addressed",
    score2Criteria:
      "Corrective actions taken but root cause analysis is weak or effectiveness not verified",
    score3Criteria:
      "Robust corrective action process with thorough root cause analysis, effective actions, and verification of effectiveness",
    standardReference: "ISO 9001:2015 Clause 10.2",
    order: 1,
  },
  {
    questionNumber: "10.3-01",
    sectionNumber: "10.3",
    questionText:
      "Does the organization continually improve the suitability, adequacy, and effectiveness of the QMS?",
    guidance:
      "Review evidence of continual improvement including trend analysis, improvement projects, and use of analysis outputs.",
    score1Criteria:
      "No evidence of continual improvement activities",
    score2Criteria:
      "Some improvement activities but not systematic or results not integrated into QMS",
    score3Criteria:
      "Systematic continual improvement with clear evidence of enhanced suitability, adequacy, and effectiveness of QMS",
    standardReference: "ISO 9001:2015 Clause 10.3",
    order: 1,
  },
];

export async function seedQuestions(): Promise<void> {
  console.log("\nSeeding audit questions...");

  // Build a map of section numbers to section IDs
  const sections = await prisma.iSOStandardSection.findMany({
    select: { id: true, sectionNumber: true },
  });

  const sectionMap = new Map(
    sections.map((s) => [s.sectionNumber, s.id])
  );

  let createdCount = 0;
  let updatedCount = 0;

  for (const question of AUDIT_QUESTIONS) {
    const sectionId = sectionMap.get(question.sectionNumber);

    if (!sectionId) {
      console.warn(
        `  ! Warning: Section ${question.sectionNumber} not found for question ${question.questionNumber}`
      );
      continue;
    }

    const result = await prisma.auditQuestion.upsert({
      where: { questionNumber: question.questionNumber },
      update: {
        questionText: question.questionText,
        guidance: question.guidance,
        score1Criteria: question.score1Criteria,
        score2Criteria: question.score2Criteria,
        score3Criteria: question.score3Criteria,
        standardReference: question.standardReference,
        order: question.order,
        sectionId: sectionId,
        isActive: true,
      },
      create: {
        questionNumber: question.questionNumber,
        questionText: question.questionText,
        guidance: question.guidance,
        score1Criteria: question.score1Criteria,
        score2Criteria: question.score2Criteria,
        score3Criteria: question.score3Criteria,
        standardReference: question.standardReference,
        order: question.order,
        sectionId: sectionId,
        isActive: true,
      },
    });

    // Check if it was created or updated by comparing createdAt timestamps
    const isNew =
      result.createdAt.getTime() === new Date(result.createdAt).getTime() &&
      Date.now() - result.createdAt.getTime() < 5000;

    if (isNew) {
      createdCount++;
      console.log(`  + Question ${result.questionNumber}: ${result.questionText.substring(0, 50)}...`);
    } else {
      updatedCount++;
      console.log(`  ~ Question ${result.questionNumber}: updated`);
    }
  }

  const totalCount = await prisma.auditQuestion.count();
  console.log(`\n✓ Seeded ${createdCount} new questions, updated ${updatedCount} existing`);
  console.log(`  Total questions in database: ${totalCount}`);
}

// Allow running directly
if (require.main === module) {
  seedQuestions()
    .catch((error) => {
      console.error("Error seeding questions:", error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

/**
 * Predefined assessment templates with section selections
 * Templates support two modes of section filtering:
 * 1. includedClauses: Select entire ISO 9001 clauses (e.g., ["4", "5", "8"])
 * 2. includedSections: Select specific section IDs for granular control
 *
 * If both are null, the template includes all sections (full assessment)
 */

interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  includedClauses?: string[] | null;
  includedSections?: string[] | null;
  estimatedSectionCount?: string; // For display purposes
}

// Predefined template IDs for consistent seeding
export const TEMPLATE_IDS = {
  FULL: "00000000-0000-4000-8000-000000000002",
  QUICK_CHECK: "00000000-0000-4000-8000-000000000010",
  LEADERSHIP: "00000000-0000-4000-8000-000000000011",
  OPERATIONS: "00000000-0000-4000-8000-000000000012",
  DOCUMENTATION: "00000000-0000-4000-8000-000000000013",
  STRATEGIC: "00000000-0000-4000-8000-000000000014",
};

const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  {
    id: TEMPLATE_IDS.FULL,
    name: "Full ISO 9001:2015 Assessment",
    description: "Comprehensive assessment covering all clauses (4-10) of ISO 9001:2015. Suitable for certification audits and complete QMS reviews.",
    isDefault: true,
    includedClauses: null, // null = include all sections
    includedSections: null,
    estimatedSectionCount: "73 sections",
  },
  {
    id: TEMPLATE_IDS.QUICK_CHECK,
    name: "Quick Check Assessment",
    description: "Focused assessment covering essential QMS requirements. Ideal for quarterly reviews and management meetings. Covers Context, Leadership, Planning, Support, Operations, Performance, and Improvement basics.",
    isDefault: false,
    includedClauses: ["4", "5", "6", "7", "8", "9", "10"], // All clauses but will be filtered to main sections only
    includedSections: null,
    estimatedSectionCount: "~20 sections",
  },
  {
    id: TEMPLATE_IDS.LEADERSHIP,
    name: "Leadership & Planning Focus",
    description: "Targeted assessment focusing on leadership commitment, quality policy, organizational roles, risk management, and quality objectives. Perfect for management reviews and strategic planning sessions.",
    isDefault: false,
    includedClauses: ["5", "6"], // Leadership and Planning
    includedSections: null,
    estimatedSectionCount: "~15 sections",
  },
  {
    id: TEMPLATE_IDS.OPERATIONS,
    name: "Operations & Delivery Focus",
    description: "Deep dive into operational processes including customer requirements, design and development, supplier management, production control, and product release. Ideal for process audits and production reviews.",
    isDefault: false,
    includedClauses: ["8"], // Operation
    includedSections: null,
    estimatedSectionCount: "~15 sections",
  },
  {
    id: TEMPLATE_IDS.DOCUMENTATION,
    name: "Documentation & Support Review",
    description: "Focused review of support processes including resources, competence, awareness, communication, and documented information. Perfect for documentation reviews and training assessments.",
    isDefault: false,
    includedClauses: ["7"], // Support
    includedSections: null,
    estimatedSectionCount: "~12 sections",
  },
  {
    id: TEMPLATE_IDS.STRATEGIC,
    name: "Strategic Planning Assessment",
    description: "Strategic-level assessment covering organizational context, stakeholder needs, QMS scope, risk management, quality objectives, and change planning. Suitable for annual strategic reviews.",
    isDefault: false,
    includedClauses: ["4", "6", "9", "10"], // Context, Planning, Performance Evaluation, Improvement
    includedSections: null,
    estimatedSectionCount: "~18 sections",
  },
];

/**
 * Seed predefined assessment templates
 */
export async function seedTemplates(organizationId: string): Promise<void> {
  console.log("\nSeeding assessment templates...");

  for (const templateDef of TEMPLATE_DEFINITIONS) {
    const template = await prisma.assessmentTemplate.upsert({
      where: { id: templateDef.id },
      update: {
        name: templateDef.name,
        description: templateDef.description,
        isDefault: templateDef.isDefault,
        includedClauses: templateDef.includedClauses ? JSON.stringify(templateDef.includedClauses) : null,
        includedSections: templateDef.includedSections ? JSON.stringify(templateDef.includedSections) : null,
        organizationId,
      },
      create: {
        id: templateDef.id,
        name: templateDef.name,
        description: templateDef.description,
        isDefault: templateDef.isDefault,
        includedClauses: templateDef.includedClauses ? JSON.stringify(templateDef.includedClauses) : null,
        includedSections: templateDef.includedSections ? JSON.stringify(templateDef.includedSections) : null,
        organizationId,
      },
    });

    console.log(
      `  + Template: ${template.name}${template.isDefault ? " (Default)" : ""} - ${templateDef.estimatedSectionCount}`
    );
  }

  const count = await prisma.assessmentTemplate.count({
    where: { organizationId },
  });
  console.log(`\n✓ Seeded ${count} assessment templates`);
}

// Allow running directly
if (require.main === module) {
  const DEFAULT_ORG_ID = "00000000-0000-4000-8000-000000000001";

  seedTemplates(DEFAULT_ORG_ID)
    .catch((error) => {
      console.error("Error seeding templates:", error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

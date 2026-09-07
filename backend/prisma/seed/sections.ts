import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// ISO 9001:2015 Standard Sections (Clauses 4-10)
// Clauses 0-3 are introductory and not auditable
const ISO_9001_SECTIONS = [
  {
    sectionNumber: "4",
    title: "Context of the Organization",
    description: "Requirements for understanding the organization and its context, needs and expectations of interested parties, and the scope of the QMS",
    order: 1,
    children: [
      {
        sectionNumber: "4.1",
        title: "Understanding the organization and its context",
        description: "Determine external and internal issues relevant to purpose and strategic direction that affect ability to achieve intended results of the QMS",
        order: 1,
      },
      {
        sectionNumber: "4.2",
        title: "Understanding the needs and expectations of interested parties",
        description: "Determine interested parties relevant to the QMS and their requirements",
        order: 2,
      },
      {
        sectionNumber: "4.3",
        title: "Determining the scope of the quality management system",
        description: "Determine the boundaries and applicability of the QMS to establish its scope",
        order: 3,
      },
      {
        sectionNumber: "4.4",
        title: "Quality management system and its processes",
        description: "Establish, implement, maintain and continually improve the QMS including the processes needed and their interactions",
        order: 4,
      },
    ],
  },
  {
    sectionNumber: "5",
    title: "Leadership",
    description: "Requirements for top management commitment, policy, and organizational roles, responsibilities and authorities",
    order: 2,
    children: [
      {
        sectionNumber: "5.1",
        title: "Leadership and commitment",
        description: "Top management demonstrates leadership and commitment with respect to the QMS",
        order: 1,
        children: [
          {
            sectionNumber: "5.1.1",
            title: "General",
            description: "Top management demonstrates leadership and commitment with respect to the QMS by taking accountability, ensuring policy and objectives are established, ensuring integration of QMS requirements into business processes, promoting process approach and risk-based thinking, ensuring resources are available, communicating importance of effective QMS, ensuring intended results are achieved, engaging and supporting persons, promoting improvement, and supporting other relevant management roles",
            order: 1,
          },
          {
            sectionNumber: "5.1.2",
            title: "Customer focus",
            description: "Top management demonstrates leadership and commitment with respect to customer focus by ensuring customer and applicable statutory and regulatory requirements are determined and met, risks and opportunities that can affect conformity of products and services and ability to enhance customer satisfaction are determined and addressed, and focus on enhancing customer satisfaction is maintained",
            order: 2,
          },
        ],
      },
      {
        sectionNumber: "5.2",
        title: "Policy",
        description: "Quality policy requirements",
        order: 2,
        children: [
          {
            sectionNumber: "5.2.1",
            title: "Establishing the quality policy",
            description: "Top management establishes, implements and maintains a quality policy that is appropriate to the purpose and context of the organization, provides a framework for setting quality objectives, includes a commitment to satisfy applicable requirements, and includes a commitment to continual improvement of the QMS",
            order: 1,
          },
          {
            sectionNumber: "5.2.2",
            title: "Communicating the quality policy",
            description: "The quality policy is available and maintained as documented information, communicated, understood and applied within the organization, and available to relevant interested parties as appropriate",
            order: 2,
          },
        ],
      },
      {
        sectionNumber: "5.3",
        title: "Organizational roles, responsibilities and authorities",
        description: "Top management ensures responsibilities and authorities for relevant roles are assigned, communicated and understood within the organization",
        order: 3,
      },
    ],
  },
  {
    sectionNumber: "6",
    title: "Planning",
    description: "Requirements for actions to address risks and opportunities, quality objectives and planning to achieve them, and planning of changes",
    order: 3,
    children: [
      {
        sectionNumber: "6.1",
        title: "Actions to address risks and opportunities",
        description: "Plan actions to address risks and opportunities to assure the QMS can achieve its intended results, enhance desirable effects, prevent or reduce undesired effects, and achieve improvement",
        order: 1,
      },
      {
        sectionNumber: "6.2",
        title: "Quality objectives and planning to achieve them",
        description: "Establish quality objectives at relevant functions, levels and processes needed for the QMS",
        order: 2,
      },
      {
        sectionNumber: "6.3",
        title: "Planning of changes",
        description: "When changes to the QMS are needed, they are carried out in a planned manner",
        order: 3,
      },
    ],
  },
  {
    sectionNumber: "7",
    title: "Support",
    description: "Requirements for resources, competence, awareness, communication, and documented information",
    order: 4,
    children: [
      {
        sectionNumber: "7.1",
        title: "Resources",
        description: "Determine and provide resources needed for establishment, implementation, maintenance and continual improvement of the QMS",
        order: 1,
        children: [
          {
            sectionNumber: "7.1.1",
            title: "General",
            description: "Determine and provide resources needed for the QMS considering capabilities and constraints on existing internal resources and what needs to be obtained from external providers",
            order: 1,
          },
          {
            sectionNumber: "7.1.2",
            title: "People",
            description: "Determine and provide persons necessary for effective implementation of the QMS and for operation and control of its processes",
            order: 2,
          },
          {
            sectionNumber: "7.1.3",
            title: "Infrastructure",
            description: "Determine, provide and maintain infrastructure necessary for operation of processes and to achieve conformity of products and services",
            order: 3,
          },
          {
            sectionNumber: "7.1.4",
            title: "Environment for the operation of processes",
            description: "Determine, provide and maintain the environment necessary for operation of processes and to achieve conformity of products and services",
            order: 4,
          },
          {
            sectionNumber: "7.1.5",
            title: "Monitoring and measuring resources",
            description: "Determine and provide resources needed to ensure valid and reliable results when monitoring or measuring is used to verify conformity of products and services to requirements",
            order: 5,
          },
          {
            sectionNumber: "7.1.6",
            title: "Organizational knowledge",
            description: "Determine knowledge necessary for operation of processes and to achieve conformity of products and services",
            order: 6,
          },
        ],
      },
      {
        sectionNumber: "7.2",
        title: "Competence",
        description: "Determine necessary competence of persons doing work under its control that affects the performance and effectiveness of the QMS",
        order: 2,
      },
      {
        sectionNumber: "7.3",
        title: "Awareness",
        description: "Ensure persons doing work under the organization's control are aware of the quality policy, relevant quality objectives, their contribution to the effectiveness of the QMS, and implications of not conforming with QMS requirements",
        order: 3,
      },
      {
        sectionNumber: "7.4",
        title: "Communication",
        description: "Determine internal and external communications relevant to the QMS",
        order: 4,
      },
      {
        sectionNumber: "7.5",
        title: "Documented information",
        description: "Include documented information required by the standard and determined by the organization as necessary for the effectiveness of the QMS",
        order: 5,
        children: [
          {
            sectionNumber: "7.5.1",
            title: "General",
            description: "QMS includes documented information required by the standard and determined by the organization as being necessary for the effectiveness of the QMS",
            order: 1,
          },
          {
            sectionNumber: "7.5.2",
            title: "Creating and updating",
            description: "When creating and updating documented information, ensure appropriate identification and description, format and media, and review and approval for suitability and adequacy",
            order: 2,
          },
          {
            sectionNumber: "7.5.3",
            title: "Control of documented information",
            description: "Documented information is controlled to ensure it is available and suitable for use where and when needed, and adequately protected",
            order: 3,
          },
        ],
      },
    ],
  },
  {
    sectionNumber: "8",
    title: "Operation",
    description: "Requirements for operational planning and control, requirements for products and services, design and development, control of externally provided processes, production and service provision, release, and control of nonconforming outputs",
    order: 5,
    children: [
      {
        sectionNumber: "8.1",
        title: "Operational planning and control",
        description: "Plan, implement and control the processes needed to meet the requirements for the provision of products and services and to implement the actions determined in Clause 6",
        order: 1,
      },
      {
        sectionNumber: "8.2",
        title: "Requirements for products and services",
        description: "Communication with customers and determination and review of requirements for products and services",
        order: 2,
        children: [
          {
            sectionNumber: "8.2.1",
            title: "Customer communication",
            description: "Communication with customers includes providing information relating to products and services, handling enquiries, contracts or orders including changes, obtaining customer feedback, handling or controlling customer property, and establishing specific requirements for contingency actions when relevant",
            order: 1,
          },
          {
            sectionNumber: "8.2.2",
            title: "Determining the requirements for products and services",
            description: "When determining requirements for products and services, ensure requirements for products and services are defined",
            order: 2,
          },
          {
            sectionNumber: "8.2.3",
            title: "Review of the requirements for products and services",
            description: "Ensure organization has the ability to meet requirements for products and services to be offered to customers",
            order: 3,
          },
          {
            sectionNumber: "8.2.4",
            title: "Changes to requirements for products and services",
            description: "When requirements for products and services are changed, ensure relevant documented information is amended and relevant persons are made aware of the changed requirements",
            order: 4,
          },
        ],
      },
      {
        sectionNumber: "8.3",
        title: "Design and development of products and services",
        description: "Establish, implement and maintain a design and development process appropriate to ensure subsequent provision of products and services",
        order: 3,
        children: [
          {
            sectionNumber: "8.3.1",
            title: "General",
            description: "Establish, implement and maintain a design and development process appropriate to ensure subsequent provision of products and services",
            order: 1,
          },
          {
            sectionNumber: "8.3.2",
            title: "Design and development planning",
            description: "In determining stages and controls for design and development, consider the nature, duration and complexity of design and development activities",
            order: 2,
          },
          {
            sectionNumber: "8.3.3",
            title: "Design and development inputs",
            description: "Determine requirements essential for specific types of products and services to be designed and developed",
            order: 3,
          },
          {
            sectionNumber: "8.3.4",
            title: "Design and development controls",
            description: "Apply controls to the design and development process to ensure results to be achieved are defined, reviews are conducted to evaluate ability to meet requirements, verification activities are conducted, and validation activities are conducted",
            order: 4,
          },
          {
            sectionNumber: "8.3.5",
            title: "Design and development outputs",
            description: "Ensure design and development outputs meet input requirements, are adequate for subsequent processes, include or reference monitoring and measuring requirements and acceptance criteria, and specify product and service characteristics",
            order: 5,
          },
          {
            sectionNumber: "8.3.6",
            title: "Design and development changes",
            description: "Identify, review and control changes made during or after design and development of products and services",
            order: 6,
          },
        ],
      },
      {
        sectionNumber: "8.4",
        title: "Control of externally provided processes, products and services",
        description: "Ensure externally provided processes, products and services conform to requirements",
        order: 4,
        children: [
          {
            sectionNumber: "8.4.1",
            title: "General",
            description: "Ensure externally provided processes, products and services conform to requirements",
            order: 1,
          },
          {
            sectionNumber: "8.4.2",
            title: "Type and extent of control",
            description: "Ensure externally provided processes, products and services do not adversely affect the organization's ability to consistently deliver conforming products and services to customers",
            order: 2,
          },
          {
            sectionNumber: "8.4.3",
            title: "Information for external providers",
            description: "Ensure adequacy of requirements prior to communication to external providers",
            order: 3,
          },
        ],
      },
      {
        sectionNumber: "8.5",
        title: "Production and service provision",
        description: "Implement production and service provision under controlled conditions",
        order: 5,
        children: [
          {
            sectionNumber: "8.5.1",
            title: "Control of production and service provision",
            description: "Implement production and service provision under controlled conditions",
            order: 1,
          },
          {
            sectionNumber: "8.5.2",
            title: "Identification and traceability",
            description: "Use suitable means to identify outputs when necessary to ensure conformity of products and services",
            order: 2,
          },
          {
            sectionNumber: "8.5.3",
            title: "Property belonging to customers or external providers",
            description: "Exercise care with property belonging to customers or external providers while under the organization's control or being used",
            order: 3,
          },
          {
            sectionNumber: "8.5.4",
            title: "Preservation",
            description: "Preserve outputs during production and service provision to ensure conformity to requirements",
            order: 4,
          },
          {
            sectionNumber: "8.5.5",
            title: "Post-delivery activities",
            description: "Meet requirements for post-delivery activities associated with products and services",
            order: 5,
          },
          {
            sectionNumber: "8.5.6",
            title: "Control of changes",
            description: "Review and control changes for production or service provision to ensure continuing conformity with requirements",
            order: 6,
          },
        ],
      },
      {
        sectionNumber: "8.6",
        title: "Release of products and services",
        description: "Implement planned arrangements at appropriate stages to verify product and service requirements have been met",
        order: 6,
      },
      {
        sectionNumber: "8.7",
        title: "Control of nonconforming outputs",
        description: "Ensure outputs that do not conform to their requirements are identified and controlled to prevent their unintended use or delivery",
        order: 7,
      },
    ],
  },
  {
    sectionNumber: "9",
    title: "Performance Evaluation",
    description: "Requirements for monitoring, measurement, analysis and evaluation, internal audit, and management review",
    order: 6,
    children: [
      {
        sectionNumber: "9.1",
        title: "Monitoring, measurement, analysis and evaluation",
        description: "Determine what needs to be monitored and measured, methods for monitoring, measurement, analysis and evaluation, when monitoring and measuring will be performed, and when results will be analyzed and evaluated",
        order: 1,
        children: [
          {
            sectionNumber: "9.1.1",
            title: "General",
            description: "Determine what needs to be monitored and measured, methods for monitoring, measurement, analysis and evaluation, when monitoring and measuring will be performed, and when results will be analyzed and evaluated",
            order: 1,
          },
          {
            sectionNumber: "9.1.2",
            title: "Customer satisfaction",
            description: "Monitor customers' perceptions of the degree to which their needs and expectations have been fulfilled",
            order: 2,
          },
          {
            sectionNumber: "9.1.3",
            title: "Analysis and evaluation",
            description: "Analyze and evaluate appropriate data and information arising from monitoring and measurement",
            order: 3,
          },
        ],
      },
      {
        sectionNumber: "9.2",
        title: "Internal audit",
        description: "Conduct internal audits at planned intervals to provide information on whether the QMS conforms to the organization's own requirements and to the requirements of the standard, and is effectively implemented and maintained",
        order: 2,
      },
      {
        sectionNumber: "9.3",
        title: "Management review",
        description: "Top management reviews the organization's QMS at planned intervals to ensure its continuing suitability, adequacy, effectiveness and alignment with the strategic direction of the organization",
        order: 3,
        children: [
          {
            sectionNumber: "9.3.1",
            title: "General",
            description: "Top management reviews the organization's QMS at planned intervals",
            order: 1,
          },
          {
            sectionNumber: "9.3.2",
            title: "Management review inputs",
            description: "Management review is planned and carried out taking into consideration status of actions from previous management reviews, changes in external and internal issues, information on QMS performance and effectiveness, adequacy of resources, effectiveness of actions taken to address risks and opportunities, and opportunities for improvement",
            order: 2,
          },
          {
            sectionNumber: "9.3.3",
            title: "Management review outputs",
            description: "Outputs of the management review include decisions and actions related to opportunities for improvement, any need for changes to the QMS, and resource needs",
            order: 3,
          },
        ],
      },
    ],
  },
  {
    sectionNumber: "10",
    title: "Improvement",
    description: "Requirements for continual improvement, nonconformity and corrective action",
    order: 7,
    children: [
      {
        sectionNumber: "10.1",
        title: "General",
        description: "Determine and select opportunities for improvement and implement necessary actions to meet customer requirements and enhance customer satisfaction",
        order: 1,
      },
      {
        sectionNumber: "10.2",
        title: "Nonconformity and corrective action",
        description: "When a nonconformity occurs, react to the nonconformity, evaluate the need for action to eliminate causes, implement any action needed, review the effectiveness of corrective action taken, and update risks and opportunities if necessary",
        order: 2,
      },
      {
        sectionNumber: "10.3",
        title: "Continual improvement",
        description: "Continually improve the suitability, adequacy and effectiveness of the QMS",
        order: 3,
      },
    ],
  },
];

interface SectionInput {
  sectionNumber: string;
  title: string;
  description?: string;
  order: number;
  children?: SectionInput[];
}

async function createSection(
  section: SectionInput,
  parentId: string | null = null
): Promise<void> {
  const created = await prisma.iSOStandardSection.upsert({
    where: { sectionNumber: section.sectionNumber },
    update: {
      title: section.title,
      description: section.description,
      order: section.order,
      parentId: parentId,
    },
    create: {
      sectionNumber: section.sectionNumber,
      title: section.title,
      description: section.description,
      order: section.order,
      parentId: parentId,
    },
  });

  console.log(`  ${parentId ? "  " : ""}+ Section ${created.sectionNumber}: ${created.title}`);

  if (section.children) {
    for (const child of section.children) {
      await createSection(child, created.id);
    }
  }
}

export async function seedSections(): Promise<void> {
  console.log("\nSeeding ISO 9001:2015 standard sections...");

  for (const section of ISO_9001_SECTIONS) {
    await createSection(section);
  }

  const count = await prisma.iSOStandardSection.count();
  console.log(`\n✓ Seeded ${count} ISO 9001:2015 sections`);
}

// Allow running directly
if (require.main === module) {
  seedSections()
    .catch((error) => {
      console.error("Error seeding sections:", error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

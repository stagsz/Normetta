import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function checkTemplates() {
  console.log('Checking templates in database...\n');

  const templates = await prisma.assessmentTemplate.findMany({
    orderBy: [
      { isDefault: 'desc' },
      { name: 'asc' },
    ],
  });

  console.log(`Found ${templates.length} templates:\n`);

  for (const template of templates) {
    console.log(`✓ ${template.name}`);
    console.log(`  ID: ${template.id}`);
    console.log(`  Default: ${template.isDefault}`);
    console.log(`  Description: ${template.description || 'None'}`);

    if (template.includedClauses) {
      const clauses = JSON.parse(template.includedClauses as string);
      console.log(`  Included Clauses: ${clauses.join(', ')}`);
    } else {
      console.log(`  Included Clauses: All (Full Assessment)`);
    }
    console.log('');
  }

  await prisma.$disconnect();
}

checkTemplates()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

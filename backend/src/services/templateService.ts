import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

interface TemplateData {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  includedClauses: string[] | null;
  includedSections: string[] | null;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
}

interface TemplateListResult {
  templates: TemplateData[];
  total: number;
}

export class TemplateService {
  /**
   * List templates for an organization
   * Returns all templates for the given organization
   */
  async list(organizationId: string): Promise<TemplateListResult> {
    const templatesRaw = await prisma.assessmentTemplate.findMany({
      where: {
        organizationId,
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        isDefault: true,
        includedClauses: true,
        includedSections: true,
        createdAt: true,
        updatedAt: true,
        organizationId: true,
      },
    });

    // Parse JSON fields
    const templates = templatesRaw.map((t: any) => ({
      ...t,
      includedClauses: t.includedClauses ? JSON.parse(t.includedClauses as string) : null,
      includedSections: t.includedSections ? JSON.parse(t.includedSections as string) : null,
    }));

    return {
      templates,
      total: templates.length,
    };
  }

  /**
   * Get a template by ID
   */
  async getById(id: string, organizationId: string): Promise<TemplateData> {
    const templateRaw = await prisma.assessmentTemplate.findFirst({
      where: {
        id,
        organizationId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isDefault: true,
        includedClauses: true,
        includedSections: true,
        createdAt: true,
        updatedAt: true,
        organizationId: true,
      },
    });

    if (!templateRaw) {
      throw new NotFoundError('Assessment Template', id);
    }

    // Parse JSON fields
    const template = {
      ...templateRaw,
      includedClauses: templateRaw.includedClauses ? JSON.parse(templateRaw.includedClauses as string) : null,
      includedSections: templateRaw.includedSections ? JSON.parse(templateRaw.includedSections as string) : null,
    };

    return template;
  }
}

export const templateService = new TemplateService();

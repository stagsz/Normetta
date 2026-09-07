import { prisma } from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';

interface CreateQuestionData {
  questionNumber: string;
  questionText: string;
  sectionId: string;
  guidance?: string;
  score1Criteria?: string;
  score2Criteria?: string;
  score3Criteria?: string;
  standardReference?: string;
  isActive?: boolean;
  order?: number;
}

interface UpdateQuestionData {
  questionText?: string;
  sectionId?: string;
  guidance?: string;
  score1Criteria?: string;
  score2Criteria?: string;
  score3Criteria?: string;
  standardReference?: string;
  isActive?: boolean;
  order?: number;
}

interface QuestionFilters {
  sectionId?: string;
  isActive?: boolean;
  searchTerm?: string;
}

interface SectionWithChildren {
  id: string;
  sectionNumber: string;
  title: string;
  description: string | null;
  order: number;
  parentId: string | null;
  createdAt: Date;
  children: SectionWithChildren[];
  _count: {
    questions: number;
  };
}

export class StandardsService {
  /**
   * Get all sections as a hierarchical tree structure
   * Optionally filter by template selection
   */
  async getSections(options?: {
    includedClauses?: string[] | null;
    includedSections?: string[] | null;
  }): Promise<SectionWithChildren[]> {
    const sections = await prisma.iSOStandardSection.findMany({
      orderBy: [{ order: 'asc' }, { sectionNumber: 'asc' }],
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    // Filter sections based on template selection
    let filteredSections = sections;

    if (options?.includedSections) {
      // Filter by specific section IDs
      const sectionIdSet = new Set(options.includedSections);
      filteredSections = sections.filter((s: any) => sectionIdSet.has(s.id));
    } else if (options?.includedClauses) {
      // Filter by clause numbers (e.g., ["4", "5", "8"])
      filteredSections = this.filterByClauseNumbers(sections, options.includedClauses);
    }

    // Build tree structure from filtered list
    return this.buildSectionTree(filteredSections);
  }

  /**
   * Get a section by ID with its children and questions
   */
  async getSectionById(id: string) {
    const section = await prisma.iSOStandardSection.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            sectionNumber: true,
            title: true,
          },
        },
        children: {
          orderBy: [{ order: 'asc' }, { sectionNumber: 'asc' }],
          select: {
            id: true,
            sectionNumber: true,
            title: true,
            description: true,
            order: true,
          },
        },
        questions: {
          where: { isActive: true },
          orderBy: [{ order: 'asc' }, { questionNumber: 'asc' }],
          select: {
            id: true,
            questionNumber: true,
            questionText: true,
            guidance: true,
            score1Criteria: true,
            score2Criteria: true,
            score3Criteria: true,
            standardReference: true,
            order: true,
          },
        },
        _count: {
          select: {
            questions: true,
            children: true,
          },
        },
      },
    });

    if (!section) {
      throw new NotFoundError('ISO Standard Section', id);
    }

    return section;
  }

  /**
   * Get questions with optional filtering
   */
  async getQuestions(filters: QuestionFilters = {}) {
    const where: Record<string, unknown> = {};

    if (filters.sectionId) {
      where.sectionId = filters.sectionId;
    }

    if (typeof filters.isActive === 'boolean') {
      where.isActive = filters.isActive;
    }

    if (filters.searchTerm) {
      where.OR = [
        { questionText: { contains: filters.searchTerm } },
        { questionNumber: { contains: filters.searchTerm } },
        { guidance: { contains: filters.searchTerm } },
      ];
    }

    const questions = await prisma.auditQuestion.findMany({
      where,
      orderBy: [{ order: 'asc' }, { questionNumber: 'asc' }],
      include: {
        section: {
          select: {
            id: true,
            sectionNumber: true,
            title: true,
          },
        },
      },
    });

    return questions;
  }

  /**
   * Get a single question by ID
   */
  async getQuestionById(id: string) {
    const question = await prisma.auditQuestion.findUnique({
      where: { id },
      include: {
        section: {
          select: {
            id: true,
            sectionNumber: true,
            title: true,
            description: true,
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundError('Audit Question', id);
    }

    return question;
  }

  /**
   * Create a new audit question
   */
  async createQuestion(data: CreateQuestionData) {
    // Validate section exists
    const section = await prisma.iSOStandardSection.findUnique({
      where: { id: data.sectionId },
    });

    if (!section) {
      throw new NotFoundError('ISO Standard Section', data.sectionId);
    }

    // Check for duplicate question number
    const existing = await prisma.auditQuestion.findUnique({
      where: { questionNumber: data.questionNumber },
    });

    if (existing) {
      throw new ValidationError(`Question number '${data.questionNumber}' already exists`);
    }

    const question = await prisma.auditQuestion.create({
      data: {
        questionNumber: data.questionNumber,
        questionText: data.questionText,
        sectionId: data.sectionId,
        guidance: data.guidance,
        score1Criteria: data.score1Criteria,
        score2Criteria: data.score2Criteria,
        score3Criteria: data.score3Criteria,
        standardReference: data.standardReference,
        isActive: data.isActive ?? true,
        order: data.order ?? 0,
      },
      include: {
        section: {
          select: {
            id: true,
            sectionNumber: true,
            title: true,
          },
        },
      },
    });

    return question;
  }

  /**
   * Update an existing audit question
   */
  async updateQuestion(id: string, data: UpdateQuestionData) {
    const question = await prisma.auditQuestion.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundError('Audit Question', id);
    }

    // Validate new section if changing
    if (data.sectionId && data.sectionId !== question.sectionId) {
      const section = await prisma.iSOStandardSection.findUnique({
        where: { id: data.sectionId },
      });

      if (!section) {
        throw new NotFoundError('ISO Standard Section', data.sectionId);
      }
    }

    const updated = await prisma.auditQuestion.update({
      where: { id },
      data,
      include: {
        section: {
          select: {
            id: true,
            sectionNumber: true,
            title: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Filter sections by clause numbers
   * Includes all sections that start with the given clause numbers and their children
   */
  private filterByClauseNumbers(
    sections: Array<{
      id: string;
      sectionNumber: string;
      title: string;
      description: string | null;
      order: number;
      parentId: string | null;
      createdAt: Date;
      _count: { questions: number };
    }>,
    clauseNumbers: string[]
  ) {
    // Build a map of section IDs to include
    const includeIds = new Set<string>();
    const sectionMap = new Map(sections.map(s => [s.id, s]));

    // First, find all sections matching the clause numbers
    for (const section of sections) {
      const matchesClause = clauseNumbers.some(clause => {
        // Match exact clause or subsections (e.g., "5" matches "5", "5.1", "5.1.1", etc.)
        return (
          section.sectionNumber === clause ||
          section.sectionNumber.startsWith(clause + '.')
        );
      });

      if (matchesClause) {
        includeIds.add(section.id);

        // Also include all parents to maintain tree structure
        let current = section;
        while (current.parentId) {
          includeIds.add(current.parentId);
          current = sectionMap.get(current.parentId)!;
          if (!current) break;
        }

        // Include all children
        this.addAllChildren(section.id, sections, includeIds);
      }
    }

    return sections.filter(s => includeIds.has(s.id));
  }

  /**
   * Recursively add all children of a section to the include set
   */
  private addAllChildren(
    sectionId: string,
    sections: Array<{ id: string; parentId: string | null }>,
    includeIds: Set<string>
  ): void {
    const children = sections.filter(s => s.parentId === sectionId);
    for (const child of children) {
      includeIds.add(child.id);
      this.addAllChildren(child.id, sections, includeIds);
    }
  }

  /**
   * Build a tree structure from flat section list
   */
  private buildSectionTree(
    sections: Array<{
      id: string;
      sectionNumber: string;
      title: string;
      description: string | null;
      order: number;
      parentId: string | null;
      createdAt: Date;
      _count: { questions: number };
    }>
  ): SectionWithChildren[] {
    const sectionMap = new Map<string, SectionWithChildren>();
    const rootSections: SectionWithChildren[] = [];

    // First pass: create all nodes
    for (const section of sections) {
      sectionMap.set(section.id, {
        ...section,
        children: [],
      });
    }

    // Second pass: build tree
    for (const section of sections) {
      const node = sectionMap.get(section.id)!;
      if (section.parentId) {
        const parent = sectionMap.get(section.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          // Orphaned section (parent not found), add to root
          rootSections.push(node);
        }
      } else {
        rootSections.push(node);
      }
    }

    return rootSections;
  }
}

export const standardsService = new StandardsService();

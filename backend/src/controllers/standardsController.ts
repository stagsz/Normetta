import { Request, Response } from 'express';
import { z } from 'zod';
import { standardsService } from '../services/standardsService';
import { csvImportService } from '../services/csvImportService';
import { withValidation, commonSchemas } from '../proxy/validationProxy';
import { ValidationError } from '../utils/errors';
import { prisma } from '../config/database';

// -----------------------------------------------------------------------------
// Validation Schemas
// -----------------------------------------------------------------------------

export const standardsSchemas = {
  // Query params for sections list
  sectionsQuery: z.object({
    assessmentId: z.string().uuid('Invalid assessment ID format').optional(),
    templateId: z.string().uuid('Invalid template ID format').optional(),
  }),

  // Query params for questions list
  questionsQuery: z.object({
    sectionId: z.string().uuid('Invalid section ID format').optional(),
    isActive: z.coerce.boolean().optional(),
    q: z.string().min(1).max(100).optional(),
  }),

  // Create question body
  createQuestion: z.object({
    questionNumber: z.string().min(1, 'Question number is required').max(50),
    questionText: z.string().min(1, 'Question text is required').max(2000),
    sectionId: z.string().uuid('Invalid section ID format'),
    guidance: z.string().max(5000).optional(),
    score1Criteria: z.string().max(2000).optional(),
    score2Criteria: z.string().max(2000).optional(),
    score3Criteria: z.string().max(2000).optional(),
    standardReference: z.string().max(255).optional(),
    isActive: z.boolean().default(true),
    order: z.number().int().min(0).default(0),
  }),

  // Update question body
  updateQuestion: z.object({
    questionText: z.string().min(1).max(2000).optional(),
    sectionId: z.string().uuid('Invalid section ID format').optional(),
    guidance: z.string().max(5000).optional(),
    score1Criteria: z.string().max(2000).optional(),
    score2Criteria: z.string().max(2000).optional(),
    score3Criteria: z.string().max(2000).optional(),
    standardReference: z.string().max(255).optional(),
    isActive: z.boolean().optional(),
    order: z.number().int().min(0).optional(),
  }),
};

// -----------------------------------------------------------------------------
// Controller
// -----------------------------------------------------------------------------

export class StandardsController {
  /**
   * GET /api/standards/sections
   * Returns all sections as a hierarchical tree structure
   * Optional query params:
   *   - assessmentId: Filter by assessment's template selection
   *   - templateId: Filter by template's section selection
   */
  getSections = withValidation(
    { query: standardsSchemas.sectionsQuery },
    async (req: Request, res: Response): Promise<void> => {
      const { assessmentId, templateId } = req.query as {
        assessmentId?: string;
        templateId?: string;
      };

      let filterOptions: {
        includedClauses?: string[] | null;
        includedSections?: string[] | null;
      } | undefined;

      // Fetch template selection if assessmentId or templateId provided
      if (assessmentId) {
        const assessment = await prisma.assessment.findUnique({
          where: { id: assessmentId },
          include: {
            template: {
              select: {
                includedClauses: true,
                includedSections: true,
              },
            },
          },
        });

        if (assessment?.template) {
          filterOptions = {
            includedClauses: assessment.template.includedClauses
              ? JSON.parse(assessment.template.includedClauses as string)
              : null,
            includedSections: assessment.template.includedSections
              ? JSON.parse(assessment.template.includedSections as string)
              : null,
          };
        }
      } else if (templateId) {
        const template = await prisma.assessmentTemplate.findUnique({
          where: { id: templateId },
          select: {
            includedClauses: true,
            includedSections: true,
          },
        });

        if (template) {
          filterOptions = {
            includedClauses: template.includedClauses
              ? JSON.parse(template.includedClauses as string)
              : null,
            includedSections: template.includedSections
              ? JSON.parse(template.includedSections as string)
              : null,
          };
        }
      }

      const sections = await standardsService.getSections(filterOptions);

      res.json({
        success: true,
        data: sections,
      });
    }
  );

  /**
   * GET /api/standards/sections/:id
   * Returns a single section with its children and questions
   */
  getSectionById = withValidation(
    { params: commonSchemas.uuidParam },
    async (req: Request, res: Response): Promise<void> => {
      const section = await standardsService.getSectionById(req.params.id);

      res.json({
        success: true,
        data: section,
      });
    }
  );

  /**
   * GET /api/standards/questions
   * Returns questions with optional filtering
   */
  getQuestions = withValidation(
    { query: standardsSchemas.questionsQuery },
    async (req: Request, res: Response): Promise<void> => {
      const { sectionId, isActive, q } = req.query as {
        sectionId?: string;
        isActive?: boolean;
        q?: string;
      };

      const questions = await standardsService.getQuestions({
        sectionId,
        isActive,
        searchTerm: q,
      });

      res.json({
        success: true,
        data: questions,
        count: questions.length,
      });
    }
  );

  /**
   * GET /api/standards/questions/:id
   * Returns a single question by ID
   */
  getQuestionById = withValidation(
    { params: commonSchemas.uuidParam },
    async (req: Request, res: Response): Promise<void> => {
      const question = await standardsService.getQuestionById(req.params.id);

      res.json({
        success: true,
        data: question,
      });
    }
  );

  /**
   * POST /api/standards/questions
   * Creates a new audit question
   */
  createQuestion = withValidation(
    { body: standardsSchemas.createQuestion },
    async (req: Request, res: Response): Promise<void> => {
      const question = await standardsService.createQuestion(req.body);

      res.status(201).json({
        success: true,
        data: question,
      });
    }
  );

  /**
   * PUT /api/standards/questions/:id
   * Updates an existing audit question
   */
  updateQuestion = withValidation(
    {
      params: commonSchemas.uuidParam,
      body: standardsSchemas.updateQuestion,
    },
    async (req: Request, res: Response): Promise<void> => {
      const question = await standardsService.updateQuestion(
        req.params.id,
        req.body
      );

      res.json({
        success: true,
        data: question,
      });
    }
  );

  /**
   * POST /api/standards/import
   * Import questions from CSV file
   * Accepts multipart/form-data with 'file' field or JSON with 'csvContent' field
   */
  importCSV = async (req: Request, res: Response): Promise<void> => {
    let csvContent: string;

    // Check if file was uploaded via multer
    if (req.file) {
      csvContent = req.file.buffer.toString('utf-8');
    } else if (req.body.csvContent && typeof req.body.csvContent === 'string') {
      // Accept CSV content directly in request body
      csvContent = req.body.csvContent;
    } else {
      throw new ValidationError('No CSV file or content provided. Upload a file or provide csvContent in request body.');
    }

    const result = await csvImportService.importFromContent(csvContent);

    res.status(result.success ? 200 : 400).json({
      success: result.success,
      data: {
        sectionsCreated: result.sectionsCreated,
        sectionsUpdated: result.sectionsUpdated,
        questionsCreated: result.questionsCreated,
        questionsUpdated: result.questionsUpdated,
      },
      errors: result.errors.length > 0 ? result.errors : undefined,
      warnings: result.warnings.length > 0 ? result.warnings : undefined,
    });
  };
}

export const standardsController = new StandardsController();

import { Request, Response } from 'express';
import { z } from 'zod';
import { evidenceService } from '../services/evidenceService';
import { withValidation } from '../proxy/validationProxy';
import { EvidenceType } from '../types/enums';

// -----------------------------------------------------------------------------
// Validation Schemas
// -----------------------------------------------------------------------------

const responseIdParam = z.object({
  id: z.string().uuid('Invalid response ID format'),
});

const evidenceIdParam = z.object({
  id: z.string().uuid('Invalid evidence ID format'),
});

const evidenceListQuery = z.object({
  type: z.enum(['DOCUMENT', 'IMAGE', 'LINK']).optional(),
});

const uploadEvidenceBody = z.object({
  description: z.string().max(1000).optional(),
});

// -----------------------------------------------------------------------------
// Controller
// -----------------------------------------------------------------------------

export class EvidenceController {
  /**
   * POST /api/responses/:id/evidence
   * Upload a file as evidence for a response
   * Note: File handling is done by multer middleware (configured in API-13)
   */
  upload = withValidation(
    {
      params: responseIdParam,
      body: uploadEvidenceBody,
    },
    async (req: Request, res: Response): Promise<void> => {
      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
        return;
      }

      // Get assessment ID from the response to generate proper file path
      const evidence = await evidenceService.uploadFile(
        req.params.id,
        req.user!.organizationId,
        req.user!.userId,
        req.user!.role,
        {
          fileName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype,
          description: req.body.description,
        }
      );

      res.status(201).json({
        success: true,
        data: evidence,
      });
    }
  );

  /**
   * GET /api/responses/:id/evidence
   * List all evidence for a response
   */
  listByResponse = withValidation(
    {
      params: responseIdParam,
      query: evidenceListQuery,
    },
    async (req: Request, res: Response): Promise<void> => {
      const { type } = req.query as { type?: EvidenceType };

      const evidenceList = await evidenceService.listByResponse(
        req.params.id,
        req.user!.organizationId,
        { type }
      );

      res.json({
        success: true,
        data: evidenceList,
        count: evidenceList.length,
      });
    }
  );

  /**
   * GET /api/evidence/:id
   * Get a single evidence record by ID
   */
  getById = withValidation(
    {
      params: evidenceIdParam,
    },
    async (req: Request, res: Response): Promise<void> => {
      const evidence = await evidenceService.getById(
        req.params.id,
        req.user!.organizationId
      );

      res.json({
        success: true,
        data: evidence,
      });
    }
  );

  /**
   * GET /api/evidence/:id/download
   * Download an evidence file
   */
  download = withValidation(
    {
      params: evidenceIdParam,
    },
    async (req: Request, res: Response): Promise<void> => {
      const { filePath, fileName, mimeType } = await evidenceService.getFilePath(
        req.params.id,
        req.user!.organizationId
      );

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
      res.sendFile(filePath);
    }
  );

  /**
   * DELETE /api/evidence/:id
   * Delete an evidence file and its record
   */
  delete = withValidation(
    {
      params: evidenceIdParam,
    },
    async (req: Request, res: Response): Promise<void> => {
      const result = await evidenceService.deleteFile(
        req.params.id,
        req.user!.organizationId,
        req.user!.userId,
        req.user!.role
      );

      res.json({
        success: true,
        message: 'Evidence deleted successfully',
        deletedId: result.deletedId,
      });
    }
  );
}

export const evidenceController = new EvidenceController();

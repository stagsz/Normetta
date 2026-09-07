import { Request, Response } from 'express';
import { assessmentService } from '../services/assessmentService';
import { reportService } from '../services/reportService';

export class AssessmentController {
  /**
   * POST /api/assessments
   */
  async create(req: Request, res: Response): Promise<void> {
    const assessment = await assessmentService.create(
      req.user!.organizationId,
      req.user!.userId,
      req.body
    );

    res.status(201).json({
      success: true,
      data: assessment,
    });
  }

  /**
   * GET /api/assessments
   */
  async list(req: Request, res: Response): Promise<void> {
    const { page, pageSize, sortBy, sortOrder, status, startDate, endDate, leadAuditorId, q } = req.query;

    const result = await assessmentService.list(
      req.user!.organizationId,
      {
        // After validation, status is already an array (transformed by Zod schema)
        status: status as any,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        leadAuditorId: leadAuditorId as string,
        searchTerm: q as string,
      },
      {
        page: Number(page) || 1,
        pageSize: Number(pageSize) || 20,
        sortBy: sortBy as string,
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
      }
    );

    res.json({
      success: true,
      ...result,
    });
  }

  /**
   * GET /api/assessments/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    const assessment = await assessmentService.getById(
      req.params.id,
      req.user!.organizationId
    );

    res.json({
      success: true,
      data: assessment,
    });
  }

  /**
   * PUT /api/assessments/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    const assessment = await assessmentService.update(
      req.params.id,
      req.user!.organizationId,
      req.user!.userId,
      req.user!.role,
      req.body
    );

    res.json({
      success: true,
      data: assessment,
    });
  }

  /**
   * DELETE /api/assessments/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    await assessmentService.delete(
      req.params.id,
      req.user!.organizationId,
      req.user!.userId,
      req.user!.role
    );

    res.json({
      success: true,
      message: 'Assessment archived successfully',
    });
  }

  /**
   * POST /api/assessments/:id/calculate-scores
   */
  async calculateScores(req: Request, res: Response): Promise<void> {
    const scores = await assessmentService.calculateScores(req.params.id);

    res.json({
      success: true,
      data: scores,
    });
  }

  /**
   * POST /api/assessments/:id/clone
   */
  async clone(req: Request, res: Response): Promise<void> {
    const { title } = req.body;

    const cloned = await assessmentService.clone(
      req.params.id,
      req.user!.organizationId,
      req.user!.userId,
      title
    );

    res.status(201).json({
      success: true,
      data: cloned,
    });
  }

  /**
   * GET /api/assessments/export
   * Export assessments list to CSV
   */
  async exportCsv(req: Request, res: Response): Promise<void> {
    const csv = await assessmentService.exportToCsv(req.user!.organizationId);

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `assessments-export-${timestamp}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf8'));

    res.send(csv);
  }

  /**
   * GET /api/assessments/:id/report
   * Generate and download PDF report for an assessment
   */
  async generateReport(req: Request, res: Response): Promise<void> {
    const assessmentId = req.params.id;
    const { organizationId, userId, role } = req.user!;

    // Generate the PDF report
    const pdfBuffer = await reportService.generateAssessmentReport(
      assessmentId,
      organizationId,
      userId,
      role
    );

    // Get the assessment to create a proper filename
    const assessment = await assessmentService.getById(assessmentId, organizationId);
    const filename = reportService.getReportFilename(assessment.title, 'pdf');

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send the PDF buffer
    res.send(pdfBuffer);
  }

  /**
   * GET /api/assessments/:id/report/powerpoint
   * Generate and download PowerPoint report for an assessment
   */
  async generatePowerPointReport(req: Request, res: Response): Promise<void> {
    const assessmentId = req.params.id;
    const { organizationId, userId, role } = req.user!;

    // Generate the PowerPoint report
    const pptxBuffer = await reportService.generateAssessmentPowerPoint(
      assessmentId,
      organizationId,
      userId,
      role
    );

    // Get the assessment to create a proper filename
    const assessment = await assessmentService.getById(assessmentId, organizationId);
    const filename = reportService.getReportFilename(assessment.title, 'pptx');

    // Set response headers for PowerPoint download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pptxBuffer.length);

    // Send the PowerPoint buffer
    res.send(pptxBuffer);
  }
}

export const assessmentController = new AssessmentController();

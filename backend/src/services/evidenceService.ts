import fs from 'fs';
import path from 'path';
import { prisma } from '../config/database';
import { config } from '../config';
import { NotFoundError, ValidationError, AuthorizationError } from '../utils/errors';
import { EvidenceType, UserRole } from '../types/enums';

interface UploadFileData {
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  description?: string;
}

interface EvidenceFilters {
  type?: EvidenceType;
}

export class EvidenceService {
  /**
   * Upload a file and create an evidence record for a response
   */
  async uploadFile(
    responseId: string,
    organizationId: string,
    userId: string,
    userRole: UserRole,
    data: UploadFileData
  ) {
    // Verify response exists and user has permission
    const response = await prisma.questionResponse.findUnique({
      where: { id: responseId },
      include: {
        assessment: {
          select: {
            id: true,
            organizationId: true,
            status: true,
            leadAuditorId: true,
            teamMembers: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!response) {
      throw new NotFoundError('Question Response', responseId);
    }

    // Verify organization access
    if (response.assessment.organizationId !== organizationId) {
      throw new AuthorizationError('You do not have access to this response');
    }

    // Check if user can upload evidence
    const canUpload = this.canManageEvidence(response.assessment, userId, userRole);
    if (!canUpload) {
      throw new AuthorizationError('You do not have permission to upload evidence for this response');
    }

    // Validate assessment status allows modifications
    if (['COMPLETED', 'ARCHIVED'].includes(response.assessment.status)) {
      throw new ValidationError('Cannot upload evidence for a completed or archived assessment');
    }

    // Validate file size
    if (data.fileSize > config.upload.maxFileSize) {
      throw new ValidationError(`File size exceeds maximum allowed size of ${config.upload.maxFileSize / 1024 / 1024}MB`);
    }

    // Validate mime type
    if (!(config.upload.allowedMimeTypes as readonly string[]).includes(data.mimeType)) {
      throw new ValidationError(`File type ${data.mimeType} is not allowed`);
    }

    // Determine evidence type from mime type
    const evidenceType = this.getEvidenceTypeFromMimeType(data.mimeType);

    // Create evidence record
    const evidence = await prisma.evidence.create({
      data: {
        responseId,
        uploadedById: userId,
        type: evidenceType,
        fileName: data.fileName,
        filePath: data.filePath,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        description: data.description || null,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return evidence;
  }

  /**
   * List all evidence for a response
   */
  async listByResponse(
    responseId: string,
    organizationId: string,
    filters: EvidenceFilters = {}
  ) {
    // Verify response exists and organization has access
    const response = await prisma.questionResponse.findUnique({
      where: { id: responseId },
      include: {
        assessment: {
          select: {
            organizationId: true,
          },
        },
      },
    });

    if (!response) {
      throw new NotFoundError('Question Response', responseId);
    }

    if (response.assessment.organizationId !== organizationId) {
      throw new AuthorizationError('You do not have access to this response');
    }

    const where: Record<string, unknown> = {
      responseId,
    };

    if (filters.type) {
      where.type = filters.type;
    }

    const evidenceList = await prisma.evidence.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return evidenceList;
  }

  /**
   * Get a single evidence record by ID
   */
  async getById(
    evidenceId: string,
    organizationId: string
  ) {
    const evidence = await prisma.evidence.findUnique({
      where: { id: evidenceId },
      include: {
        response: {
          include: {
            assessment: {
              select: {
                id: true,
                organizationId: true,
                title: true,
              },
            },
            question: {
              select: {
                id: true,
                questionNumber: true,
                questionText: true,
              },
            },
          },
        },
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!evidence) {
      throw new NotFoundError('Evidence', evidenceId);
    }

    // Verify organization access
    if (evidence.response.assessment.organizationId !== organizationId) {
      throw new AuthorizationError('You do not have access to this evidence');
    }

    return evidence;
  }

  /**
   * Delete an evidence file and its database record
   */
  async deleteFile(
    evidenceId: string,
    organizationId: string,
    userId: string,
    userRole: UserRole
  ) {
    // Get evidence with full context
    const evidence = await prisma.evidence.findUnique({
      where: { id: evidenceId },
      include: {
        response: {
          include: {
            assessment: {
              select: {
                id: true,
                organizationId: true,
                status: true,
                leadAuditorId: true,
                teamMembers: {
                  select: { userId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!evidence) {
      throw new NotFoundError('Evidence', evidenceId);
    }

    // Verify organization access
    if (evidence.response.assessment.organizationId !== organizationId) {
      throw new AuthorizationError('You do not have access to this evidence');
    }

    // Check if user can delete evidence
    const canDelete = this.canManageEvidence(evidence.response.assessment, userId, userRole);
    if (!canDelete) {
      throw new AuthorizationError('You do not have permission to delete this evidence');
    }

    // Validate assessment status allows modifications
    if (['COMPLETED', 'ARCHIVED'].includes(evidence.response.assessment.status)) {
      throw new ValidationError('Cannot delete evidence from a completed or archived assessment');
    }

    // Delete the physical file if it exists
    const fullPath = path.resolve(evidence.filePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (error) {
        console.error(`Failed to delete file at ${fullPath}:`, error);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete database record
    await prisma.evidence.delete({
      where: { id: evidenceId },
    });

    return { success: true, deletedId: evidenceId };
  }

  /**
   * Get the file path for downloading
   */
  async getFilePath(
    evidenceId: string,
    organizationId: string
  ): Promise<{ filePath: string; fileName: string; mimeType: string }> {
    const evidence = await this.getById(evidenceId, organizationId);

    const fullPath = path.resolve(evidence.filePath);
    if (!fs.existsSync(fullPath)) {
      throw new NotFoundError('Evidence file');
    }

    return {
      filePath: fullPath,
      fileName: evidence.fileName,
      mimeType: evidence.mimeType,
    };
  }

  /**
   * Determine evidence type from MIME type
   */
  private getEvidenceTypeFromMimeType(mimeType: string): EvidenceType {
    if (mimeType.startsWith('image/')) {
      return EvidenceType.IMAGE;
    }
    // All other allowed types are documents
    return EvidenceType.DOCUMENT;
  }

  /**
   * Check if user can manage evidence (upload/delete) for an assessment
   */
  private canManageEvidence(
    assessment: {
      leadAuditorId: string;
      teamMembers: { userId: string }[];
    },
    userId: string,
    userRole: UserRole
  ): boolean {
    // System admins and quality managers can always manage evidence
    if (userRole === UserRole.SYSTEM_ADMIN || userRole === UserRole.QUALITY_MANAGER) {
      return true;
    }

    // Lead auditor can manage evidence
    if (assessment.leadAuditorId === userId) {
      return true;
    }

    // Team members can manage evidence
    const isTeamMember = assessment.teamMembers.some((tm) => tm.userId === userId);
    if (isTeamMember && userRole === UserRole.INTERNAL_AUDITOR) {
      return true;
    }

    return false;
  }

  /**
   * Ensure upload directory exists
   */
  static ensureUploadDirectory(): void {
    const uploadDir = path.resolve(config.upload.uploadDir);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }

  /**
   * Generate a unique file path for upload
   */
  static generateFilePath(assessmentId: string, originalFilename: string): string {
    const uploadDir = path.resolve(config.upload.uploadDir);
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(originalFilename);
    const baseName = path.basename(originalFilename, ext);
    const safeBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50);

    // Organize by assessment ID
    const assessmentDir = path.join(uploadDir, assessmentId);
    if (!fs.existsSync(assessmentDir)) {
      fs.mkdirSync(assessmentDir, { recursive: true });
    }

    return path.join(assessmentDir, `${safeBaseName}_${timestamp}_${randomSuffix}${ext}`);
  }
}

export const evidenceService = new EvidenceService();

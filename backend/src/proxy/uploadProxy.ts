import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { config } from '../config';
import { ValidationError } from '../utils/errors';

// Allowed MIME types for evidence uploads
const ALLOWED_MIME_TYPES = [
  // PDF
  'application/pdf',
  // Word documents
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Excel spreadsheets
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Images
  'image/png',
  'image/jpeg',
  'image/jpg',
];

// Allowed file extensions
const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.png',
  '.jpg',
  '.jpeg',
];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Ensure upload directory exists
 */
function ensureUploadDirectory(): void {
  const uploadDir = path.resolve(config.upload.uploadDir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

/**
 * Generate a safe filename with timestamp and random suffix
 */
function generateSafeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, ext);
  // Sanitize filename: replace non-alphanumeric chars with underscore
  const safeBaseName = baseName
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .substring(0, 50);
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${safeBaseName}_${timestamp}_${randomSuffix}${ext}`;
}

/**
 * Configure disk storage for evidence uploads
 */
const evidenceStorage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    ensureUploadDirectory();
    const uploadDir = path.resolve(config.upload.uploadDir);
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const safeFilename = generateSafeFilename(file.originalname);
    cb(null, safeFilename);
  },
});

/**
 * File filter to validate allowed file types
 */
function evidenceFileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  const ext = path.extname(file.originalname).toLowerCase();

  // Check extension
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    cb(
      new ValidationError(
        `File type '${ext}' is not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`
      )
    );
    return;
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(
      new ValidationError(
        `MIME type '${file.mimetype}' is not allowed. Please upload PDF, Word, Excel, PNG, or JPEG files.`
      )
    );
    return;
  }

  cb(null, true);
}

/**
 * Multer middleware for evidence file uploads
 * - 10MB limit
 * - Allowed formats: PDF, DOCX, XLSX, PNG, JPG
 * - Disk storage with sanitized filenames
 */
export const evidenceUpload = multer({
  storage: evidenceStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: evidenceFileFilter,
});

/**
 * Middleware for single evidence file upload
 * Expects field name 'file'
 */
export const uploadEvidence = evidenceUpload.single('file');

/**
 * Error handler for multer errors
 * Can be used as error middleware after routes
 */
export function handleMulterError(
  err: Error,
  _req: Request,
  res: { status: (code: number) => { json: (body: unknown) => void } },
  next: (err?: Error) => void
): void {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      });
      return;
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        success: false,
        error: 'Unexpected field name. Use "file" for uploads.',
      });
      return;
    }
    res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`,
    });
    return;
  }

  if (err instanceof ValidationError) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
    return;
  }

  next(err);
}

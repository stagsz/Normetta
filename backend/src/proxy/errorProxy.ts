import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config';

/**
 * Error Handling Proxy
 * Wraps route handlers to catch and format errors consistently
 */
export function withErrorHandling<T extends (req: Request, res: Response, next: NextFunction) => Promise<void> | void>(
  handler: T
): T {
  const errorHandledHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await Promise.resolve(handler(req, res, next));
    } catch (error) {
      next(error);
    }
  };

  return errorHandledHandler as T;
}

/**
 * Global Error Handler
 * Express error handling middleware
 */
export function globalErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the error
  console.error('[AUDITFLOW_ERR]', error.constructor?.name, error.message);
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.userId,
  });

  // Handle multer errors (file upload)
  if (error instanceof multer.MulterError) {
    let message = 'File upload error';
    if (error.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large. Maximum size is 10MB';
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected field name. Use "file" for uploads';
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files uploaded';
    }
    res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message,
      },
    });
    return;
  }

  // Handle known errors
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(config.isDevelopment && error.details && { details: error.details }),
      },
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal server error occurred',
    },
  });
}

/**
 * Not Found Handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}

/**
 * Async Handler Wrapper
 * Convenience wrapper for async route handlers
 */
export function asyncHandler<T extends (req: Request, res: Response, next: NextFunction) => Promise<unknown>>(
  handler: T
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

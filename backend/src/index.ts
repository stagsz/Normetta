/// <reference path="./types/express.d.ts" />
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './utils/logger';
import { globalErrorHandler, notFoundHandler } from './proxy/errorProxy';
import routes from './routes';
import { tenantContext } from './middleware';

const app = express();

// Trust Vercel's reverse proxy for correct IP detection
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors(config.cors));

app.use(tenantContext);

// Rate limiting (disabled in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.use(
    rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later',
        },
      },
    })
  );
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// API routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start server
async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(): Promise<void> {
  logger.info('Shutting down...');
  await disconnectDatabase();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Only start server if not in test environment and running as main module
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  startServer();
}

export default app;

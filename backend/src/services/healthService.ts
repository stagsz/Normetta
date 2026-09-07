import { prisma } from '../config/database';
import { logger } from '../utils/logger';

// Read version from package.json at runtime
const packageJson = require('../../package.json');

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  database: 'connected' | 'disconnected';
  uptime: number;
}

export interface ReadinessStatus {
  status: 'ready' | 'not_ready';
  timestamp: string;
  checks: {
    database: boolean;
  };
}

class HealthService {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Check if database is connected and responding
   */
  async checkDatabaseConnection(): Promise<boolean> {
    try {
      // Execute a simple query to verify database connectivity
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Get basic health status (liveness check)
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const isDatabaseConnected = await this.checkDatabaseConnection();

    return {
      status: isDatabaseConnected ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      version: packageJson.version,
      database: isDatabaseConnected ? 'connected' : 'disconnected',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  /**
   * Get readiness status for Kubernetes readiness probes
   * Returns ready only if all dependencies are available
   */
  async getReadinessStatus(): Promise<ReadinessStatus> {
    const isDatabaseReady = await this.checkDatabaseConnection();

    return {
      status: isDatabaseReady ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: isDatabaseReady,
      },
    };
  }
}

export const healthService = new HealthService();

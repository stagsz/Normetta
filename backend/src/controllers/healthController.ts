import { Request, Response } from 'express';
import { healthService } from '../services/healthService';

export class HealthController {
  /**
   * GET /api/health
   * Basic health check endpoint (liveness probe)
   * Returns: { status: 'ok', timestamp, version, database: 'connected', uptime }
   * Returns HTTP 503 if database is unreachable
   */
  getHealth = async (_req: Request, res: Response): Promise<void> => {
    const healthStatus = await healthService.getHealthStatus();

    if (healthStatus.status === 'error') {
      res.status(503).json(healthStatus);
      return;
    }

    res.json(healthStatus);
  };

  /**
   * GET /api/health/ready
   * Readiness probe endpoint for Kubernetes
   * Returns: { status: 'ready', timestamp, checks: { database: boolean } }
   * Returns HTTP 503 if not ready to serve traffic
   */
  getReadiness = async (_req: Request, res: Response): Promise<void> => {
    const readinessStatus = await healthService.getReadinessStatus();

    if (readinessStatus.status === 'not_ready') {
      res.status(503).json(readinessStatus);
      return;
    }

    res.json(readinessStatus);
  };
}

export const healthController = new HealthController();

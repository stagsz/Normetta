import { Router } from 'express';
import { healthController } from '../controllers/healthController';

const router = Router();

// GET /api/health - Basic health check (liveness probe)
router.get('/', healthController.getHealth);

// GET /api/health/ready - Readiness probe for Kubernetes
router.get('/ready', healthController.getReadiness);

export default router;

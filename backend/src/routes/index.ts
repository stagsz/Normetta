import { Router } from 'express';
import authRoutes from './authRoutes';
import assessmentRoutes from './assessmentRoutes';
import standardsRoutes from './standardsRoutes';
import dashboardRoutes from './dashboardRoutes';
import userRoutes from './userRoutes';
import templateRoutes from './templateRoutes';
import healthRoutes from './healthRoutes';
import { evidenceRouter, responseEvidenceRouter } from './evidenceRoutes';
import { nonConformityRouter, assessmentNCRRouter } from './nonConformityRoutes';
import { actionRouter, ncrActionRouter } from './correctiveActionRoutes';
import onboardingRoutes from './onboardingRoutes';
import organizationProfileRoutes from './organizationProfileRoutes';
import orgInviteRoutes from './orgInviteRoutes';
import betaInviteRoutes from './betaInviteRoutes';

const router = Router();

// Health check routes
router.use('/health', healthRoutes);

// API routes
router.use('/auth', authRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/standards', standardsRoutes);
router.use('/evidence', evidenceRouter);
router.use('/responses/:id/evidence', responseEvidenceRouter);
router.use('/non-conformities', nonConformityRouter);
router.use('/assessments/:id/non-conformities', assessmentNCRRouter);
router.use('/actions', actionRouter);
router.use('/non-conformities/:id/actions', ncrActionRouter);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);
router.use('/templates', templateRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/organization-profile', organizationProfileRoutes);
router.use('/org', orgInviteRoutes);
router.use('/', betaInviteRoutes);

export default router;

import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../index';
import { prisma } from '../config/database';
import { config } from '../config';
import { UserRole } from '../types/enums';
import bcrypt from 'bcryptjs';

/**
 * Creates a test user in the database
 */
export async function createTestUser(
  overrides: Partial<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    organizationId: string;
  }> = {}
): Promise<{ id: string; email: string; password: string; role: UserRole }> {
  const defaultPassword = 'testpass123';
  const passwordHash = await bcrypt.hash(overrides.password || defaultPassword, 10);

  // Ensure we have an organization
  let orgId = overrides.organizationId;
  if (!orgId) {
    const org = await prisma.organization.findFirst();
    if (!org) {
      const newOrg = await prisma.organization.create({
        data: { name: 'Test Organization' },
      });
      orgId = newOrg.id;
    } else {
      orgId = org.id;
    }
  }

  const user = await prisma.user.create({
    data: {
      email: overrides.email || `test-${Date.now()}@example.com`,
      passwordHash,
      firstName: overrides.firstName || 'Test',
      lastName: overrides.lastName || 'User',
      role: overrides.role || UserRole.INTERNAL_AUDITOR,
      isActive: overrides.isActive ?? true,
      organizationId: orgId,
    },
  });

  return {
    id: user.id,
    email: user.email,
    password: overrides.password || defaultPassword,
    role: user.role as UserRole,
  };
}

/**
 * Generates a valid JWT token for testing
 */
export function generateTestToken(
  userId: string,
  role: UserRole = UserRole.INTERNAL_AUDITOR,
  organizationId?: string
): string {
  return jwt.sign(
    {
      userId,
      role,
      organizationId: organizationId || 'test-org-id',
    },
    config.jwt.secret,
    { expiresIn: '1h' }
  );
}

/**
 * Creates a supertest agent with authentication
 */
export function authenticatedRequest(token: string) {
  return {
    get: (url: string) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string) => request(app).post(url).set('Authorization', `Bearer ${token}`),
    put: (url: string) => request(app).put(url).set('Authorization', `Bearer ${token}`),
    delete: (url: string) => request(app).delete(url).set('Authorization', `Bearer ${token}`),
    patch: (url: string) => request(app).patch(url).set('Authorization', `Bearer ${token}`),
  };
}

/**
 * Clean up test data from the database
 * Call this in afterEach or afterAll to prevent test data accumulation
 */
export async function cleanupTestData(): Promise<void> {
  // Delete in order respecting foreign key constraints
  await prisma.correctiveAction.deleteMany({});
  await prisma.nonConformity.deleteMany({});
  await prisma.evidence.deleteMany({});
  await prisma.questionResponse.deleteMany({});
  await prisma.assessmentTeamMember.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.assessmentTemplate.deleteMany({});
  await prisma.auditQuestion.deleteMany({});
  await prisma.iSOStandardSection.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});
}

/**
 * Export the app for direct use in tests
 */
export { app };

/**
 * Export request for direct supertest usage
 */
export { request };

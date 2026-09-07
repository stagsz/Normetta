import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../index';
import { prisma } from '../config/database';
import { config } from '../config';
import {
  createTestUser,
  cleanupTestData,
  authenticatedRequest,
} from './helpers';
import { UserRole } from '../types/enums';

describe('Auth API', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const testUser = await createTestUser({
        email: 'login-test@example.com',
        password: 'ValidPass123',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'ValidPass123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('expiresIn');
      expect(response.body.data.user).toHaveProperty('email', testUser.email);
      expect(response.body.data.user).not.toHaveProperty('passwordHash');
    });

    it('should return 401 with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid credentials');
    });

    it('should return 401 with invalid password', async () => {
      const testUser = await createTestUser({
        email: 'wrong-pass@example.com',
        password: 'CorrectPass123',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPass123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid credentials');
    });

    it('should return 401 for deactivated user', async () => {
      const testUser = await createTestUser({
        email: 'inactive@example.com',
        password: 'ValidPass123',
        isActive: false,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'ValidPass123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('deactivated');
    });

    it('should return 400 with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'anypassword',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'not-an-email',
          password: 'anypassword',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should update lastLoginAt on successful login', async () => {
      const testUser = await createTestUser({
        email: 'lastlogin-test@example.com',
        password: 'ValidPass123',
      });

      const userBefore = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'ValidPass123',
        });

      const userAfter = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      expect(userAfter?.lastLoginAt).not.toEqual(userBefore?.lastLoginAt);
      expect(userAfter?.lastLoginAt).not.toBeNull();
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      // Create an organization first
      const org = await prisma.organization.create({
        data: { name: 'Test Org' },
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'SecurePass123',
          firstName: 'New',
          lastName: 'User',
          organizationId: org.id,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('email', 'newuser@example.com');
      expect(response.body.data).toHaveProperty('firstName', 'New');
      expect(response.body.data).toHaveProperty('lastName', 'User');
      expect(response.body.data).not.toHaveProperty('passwordHash');
    });

    it('should return 400 for duplicate email', async () => {
      const existingUser = await createTestUser({
        email: 'existing@example.com',
      });

      // Get the organization
      const user = await prisma.user.findUnique({
        where: { id: existingUser.id },
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'AnotherPass123',
          firstName: 'Another',
          lastName: 'User',
          organizationId: user?.organizationId,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('already registered');
    });

    it('should return 400 with password less than 8 characters', async () => {
      const org = await prisma.organization.create({
        data: { name: 'Test Org' },
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'shortpass@example.com',
          password: 'short',
          firstName: 'Test',
          lastName: 'User',
          organizationId: org.id,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent organization', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'noorg@example.com',
          password: 'ValidPass123',
          firstName: 'No',
          lastName: 'Org',
          organizationId: '00000000-0000-0000-0000-000000000000',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully with valid refresh token', async () => {
      const testUser = await createTestUser({
        email: 'refresh-test@example.com',
        password: 'ValidPass123',
      });

      // Login first to get tokens
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'ValidPass123',
        });

      const { refreshToken } = loginResponse.body.data;

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('expiresIn');
    });

    it('should return 401 with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid refresh token');
    });

    it('should return 401 with expired refresh token', async () => {
      const testUser = await createTestUser({
        email: 'expired-refresh@example.com',
      });

      // Create an expired token
      const expiredToken = jwt.sign(
        {
          userId: testUser.id,
          email: testUser.email,
          role: testUser.role,
          organizationId: 'test-org-id',
        },
        config.jwt.refreshSecret,
        { expiresIn: '-1s' } // Already expired
      );

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: expiredToken });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 when user no longer exists', async () => {
      const testUser = await createTestUser({
        email: 'deleted-user@example.com',
      });

      // Login to get a valid refresh token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'testpass123',
        });

      const { refreshToken } = loginResponse.body.data;

      // Delete the user
      await prisma.user.delete({ where: { id: testUser.id } });

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 when user is deactivated after login', async () => {
      const testUser = await createTestUser({
        email: 'deactivated-after@example.com',
        password: 'ValidPass123',
      });

      // Login to get a valid refresh token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'ValidPass123',
        });

      const { refreshToken } = loginResponse.body.data;

      // Deactivate the user
      await prisma.user.update({
        where: { id: testUser.id },
        data: { isActive: false },
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password successfully', async () => {
      const testUser = await createTestUser({
        email: 'change-pass@example.com',
        password: 'OldPassword123',
      });

      // Login to get access token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'OldPassword123',
        });

      const { accessToken } = loginResponse.body.data;

      const response = await authenticatedRequest(accessToken)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'OldPassword123',
          newPassword: 'NewPassword456',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password changed');

      // Verify new password works
      const newLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'NewPassword456',
        });

      expect(newLoginResponse.status).toBe(200);
    });

    it('should return 401 with incorrect current password', async () => {
      const testUser = await createTestUser({
        email: 'wrong-current@example.com',
        password: 'CorrectPassword123',
      });

      // Login to get access token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'CorrectPassword123',
        });

      const { accessToken } = loginResponse.body.data;

      const response = await authenticatedRequest(accessToken)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'WrongPassword123',
          newPassword: 'NewPassword456',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('incorrect');
    });

    it('should return 400 with new password less than 8 characters', async () => {
      const testUser = await createTestUser({
        email: 'short-new@example.com',
        password: 'ValidPassword123',
      });

      // Login to get access token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'ValidPassword123',
        });

      const { accessToken } = loginResponse.body.data;

      const response = await authenticatedRequest(accessToken)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'ValidPassword123',
          newPassword: 'short',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'OldPassword123',
          newPassword: 'NewPassword456',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 with missing currentPassword', async () => {
      const testUser = await createTestUser({
        email: 'missing-current@example.com',
        password: 'ValidPassword123',
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'ValidPassword123',
        });

      const { accessToken } = loginResponse.body.data;

      const response = await authenticatedRequest(accessToken)
        .post('/api/auth/change-password')
        .send({
          newPassword: 'NewPassword456',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user information', async () => {
      const testUser = await createTestUser({
        email: 'me-test@example.com',
        password: 'ValidPass123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.QUALITY_MANAGER,
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'ValidPass123',
        });

      const { accessToken } = loginResponse.body.data;

      const response = await authenticatedRequest(accessToken)
        .get('/api/auth/me');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userId', testUser.id);
      expect(response.body.data).toHaveProperty('email', testUser.email);
      expect(response.body.data).toHaveProperty('role', UserRole.QUALITY_MANAGER);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const response = await authenticatedRequest('invalid-token')
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 with expired token', async () => {
      const testUser = await createTestUser({
        email: 'expired-token@example.com',
      });

      // Create an expired token
      const expiredToken = jwt.sign(
        {
          userId: testUser.id,
          email: testUser.email,
          role: testUser.role,
          organizationId: 'test-org-id',
        },
        config.jwt.secret,
        { expiresIn: '-1s' } // Already expired
      );

      const response = await authenticatedRequest(expiredToken)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});

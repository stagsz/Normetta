import request from 'supertest';
import app from '../index';
import { prisma } from '../config/database';
import '@testing-library/jest-dom';

const VALID_PAYLOAD = {
  firstName: 'Alice',
  lastName: 'Admin',
  email: 'alice@testcorp.com',
  password: 'password123',
  company: { name: 'Test Corp', slug: 'test-corp' },
  divisions: [{ name: 'Engineering' }],
  departments: [{ name: 'Backend', divisionIndex: 0 }],
  roles: [{ name: 'Quality Manager', permissionLevel: 'MANAGER' }],
};

async function cleanup() {
  await prisma.userOrgInvite.deleteMany();
  await prisma.user.deleteMany({ where: { email: { contains: 'testcorp' } } });
  await prisma.orgRole.deleteMany();
  await prisma.department.deleteMany();
  await prisma.division.deleteMany();
  await prisma.organization.deleteMany({ where: { slug: { not: null } } });
}

beforeEach(cleanup);
afterAll(cleanup);

describe('POST /api/onboarding/setup', () => {
  it('creates org, user, and sub-records; returns tokens', async () => {
    const res = await request(app).post('/api/onboarding/setup').send(VALID_PAYLOAD);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('orgSlug', 'test-corp');

    const org = await prisma.organization.findUnique({ where: { slug: 'test-corp' } });
    expect(org).not.toBeNull();
    expect(org!.setupComplete).toBe(true);

    const divisions = await prisma.division.findMany({ where: { organizationId: org!.id } });
    expect(divisions).toHaveLength(1);
    expect(divisions[0].name).toBe('Engineering');

    const departments = await prisma.department.findMany({ where: { organizationId: org!.id } });
    expect(departments).toHaveLength(1);
    expect(departments[0].divisionId).toBe(divisions[0].id);
  });

  it('returns 409 when slug is taken', async () => {
    await request(app).post('/api/onboarding/setup').send(VALID_PAYLOAD);
    const res = await request(app)
      .post('/api/onboarding/setup')
      .send({ ...VALID_PAYLOAD, email: 'other@testcorp.com' });
    expect(res.status).toBe(409);
  });

  it('returns 409 when email is taken', async () => {
    await request(app).post('/api/onboarding/setup').send(VALID_PAYLOAD);
    const res = await request(app)
      .post('/api/onboarding/setup')
      .send({ ...VALID_PAYLOAD, company: { name: 'Other Corp', slug: 'other-corp' } });
    expect(res.status).toBe(409);
  });
});

describe('GET /api/onboarding/check-slug/:slug', () => {
  it('returns available: true for an unused slug', async () => {
    const res = await request(app).get('/api/onboarding/check-slug/unused-slug-xyz');
    expect(res.status).toBe(200);
    expect(res.body.data.available).toBe(true);
  });

  it('returns available: false for a taken slug', async () => {
    await request(app).post('/api/onboarding/setup').send(VALID_PAYLOAD);
    const res = await request(app).get('/api/onboarding/check-slug/test-corp');
    expect(res.status).toBe(200);
    expect(res.body.data.available).toBe(false);
  });
});

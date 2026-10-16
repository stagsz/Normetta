import { prisma } from '../config/database';
import {
  createTestUser,
  cleanupTestData,
  authenticatedRequest,
  generateTestToken,
} from './helpers';
import { UserRole, Severity, NCRStatus } from '../types/enums';

describe('Non-Conformity API - severity filter', () => {
  let orgId: string;
  let assessmentId: string;
  let otherAssessmentId: string;
  let token: string;

  // Seeded per org: MINOR x1, MAJOR x2 (one OPEN, one RESOLVED), CRITICAL x2 (one OPEN, one IN_PROGRESS)
  const seed: Array<{ severity: Severity; status: NCRStatus }> = [
    { severity: Severity.MINOR, status: NCRStatus.OPEN },
    { severity: Severity.MAJOR, status: NCRStatus.OPEN },
    { severity: Severity.MAJOR, status: NCRStatus.RESOLVED },
    { severity: Severity.CRITICAL, status: NCRStatus.OPEN },
    { severity: Severity.CRITICAL, status: NCRStatus.IN_PROGRESS },
  ];

  async function seedOrg(name: string, email: string) {
    const org = await prisma.organization.create({ data: { name } });
    const user = await createTestUser({
      email,
      role: UserRole.QUALITY_MANAGER,
      organizationId: org.id,
    });
    const assessment = await prisma.assessment.create({
      data: { title: `${name} Assessment`, organizationId: org.id, leadAuditorId: user.id },
    });
    await prisma.nonConformity.createMany({
      data: seed.map((s, i) => ({
        title: `${name} NCR ${i}`,
        description: 'Seeded for severity filter tests',
        severity: s.severity,
        status: s.status,
        assessmentId: assessment.id,
      })),
    });
    return { org, user, assessment };
  }

  beforeAll(async () => {
    await cleanupTestData();

    const main = await seedOrg('NCR Filter Org', 'ncr-filter@test.com');
    orgId = main.org.id;
    assessmentId = main.assessment.id;
    token = generateTestToken(main.user.id, UserRole.QUALITY_MANAGER, orgId);

    // Second assessment in the same org, so the per-assessment route has something to exclude
    const extra = await prisma.assessment.create({
      data: { title: 'Second Assessment', organizationId: orgId, leadAuditorId: main.user.id },
    });
    otherAssessmentId = extra.id;
    await prisma.nonConformity.create({
      data: {
        title: 'Second assessment MINOR',
        description: 'Should not appear in first assessment results',
        severity: Severity.MINOR,
        assessmentId: otherAssessmentId,
      },
    });

    await seedOrg('NCR Other Org', 'ncr-other@test.com');
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  it('returns only MAJOR NCRs with a matching pagination total', async () => {
    const res = await authenticatedRequest(token).get('/api/non-conformities?severity=MAJOR');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data.every((n: any) => n.severity === 'MAJOR')).toBe(true);
    expect(res.body.pagination.total).toBe(2);
  });

  it('returns all severities when no severity filter is given', async () => {
    const res = await authenticatedRequest(token).get('/api/non-conformities');

    expect(res.status).toBe(200);
    const severities = new Set(res.body.data.map((n: any) => n.severity));
    expect(severities).toEqual(new Set(['MINOR', 'MAJOR', 'CRITICAL']));
    // 5 seeded on the first assessment + 1 on the second, all in this org
    expect(res.body.pagination.total).toBe(6);
  });

  it.each(['minor', 'BOGUS'])('rejects invalid severity "%s" with 400', async (value) => {
    const res = await authenticatedRequest(token).get(`/api/non-conformities?severity=${value}`);

    expect(res.status).toBe(400);
    expect(res.body.data).toBeUndefined();
  });

  it('combines severity and status filters', async () => {
    const res = await authenticatedRequest(token).get(
      '/api/non-conformities?severity=CRITICAL&status=OPEN'
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].severity).toBe('CRITICAL');
    expect(res.body.data[0].status).toBe('OPEN');
  });

  it('filters by severity on the per-assessment route', async () => {
    const res = await authenticatedRequest(token).get(
      `/api/assessments/${assessmentId}/non-conformities?severity=MINOR`
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].severity).toBe('MINOR');
    expect(res.body.data[0].assessmentId ?? assessmentId).toBe(assessmentId);
  });

  it('never returns NCRs from another organization', async () => {
    for (const severity of ['', 'MINOR', 'MAJOR', 'CRITICAL']) {
      const qs = severity ? `?severity=${severity}` : '';
      const res = await authenticatedRequest(token).get(`/api/non-conformities${qs}`);

      expect(res.status).toBe(200);
      expect(res.body.data.some((n: any) => n.title.startsWith('NCR Other Org'))).toBe(false);
    }
  });
});

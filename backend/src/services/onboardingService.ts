import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { config } from '../config';
import { ConflictError } from '../utils/errors';
import { UserRole } from '../types/enums';
import { deriveAssessmentScope } from './assessmentScopeService';

interface ReadinessProfileData {
  companySize?: 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE';
  qmsStatus?: 'NONE' | 'BUILDING' | 'INFORMAL' | 'DOCUMENTED';
  certificationStatus?: 'NOT_CERTIFIED' | 'IN_PROGRESS' | 'CERTIFIED_SURVEILLANCE' | 'CERTIFIED_RECERTIFYING';
  lastAuditSummary?: string;
  improvementNotes?: string;
  standardsKnowledgeLevel?: 'NONE' | 'BASIC' | 'TRAINED' | 'CERTIFIED_AUDITOR';
  hoursPerWeek?: number;
}

interface SetupOrgData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  company: { name: string; slug: string; industry?: string; country?: string };
  profile?: ReadinessProfileData;
  divisions: { name: string }[];
  departments: { name: string; divisionIndex?: number }[];
  roles: { name: string; permissionLevel: 'MANAGER' | 'AUDITOR' | 'DEPT_HEAD' | 'VIEWER' }[];
}

// Seeds a new org's starter assessment templates. Every org gets the full
// assessment; orgs whose readiness profile suggests starting narrower also
// get a recommended scoped template marked as the default (editable by the
// user on the create-assessment screen — never silently auto-applied).
async function seedStarterTemplates(
  tx: Prisma.TransactionClient,
  organizationId: string,
  profile?: ReadinessProfileData
): Promise<void> {
  const recommended = deriveAssessmentScope(profile);

  await tx.assessmentTemplate.create({
    data: {
      name: 'Full ISO 9001:2015 Assessment',
      description: 'Comprehensive assessment covering all clauses (4-10) of ISO 9001:2015.',
      isDefault: !recommended,
      includedClauses: Prisma.JsonNull,
      organizationId,
    },
  });

  if (recommended) {
    await tx.assessmentTemplate.create({
      data: {
        name: recommended.name,
        description: recommended.description,
        isDefault: true,
        includedClauses: JSON.stringify(recommended.includedClauses),
        organizationId,
      },
    });
  }
}

export class OnboardingService {
  async setupOrganization(data: SetupOrgData) {
    const [existingEmail, existingSlug] = await Promise.all([
      prisma.user.findUnique({ where: { email: data.email } }),
      prisma.organization.findUnique({ where: { slug: data.company.slug } }),
    ]);
    if (existingEmail) throw new ConflictError('Email already registered');
    if (existingSlug) throw new ConflictError('Company URL is already taken');

    const passwordHash = await bcrypt.hash(data.password, 12);

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const org = await tx.organization.create({
        data: {
          name: data.company.name,
          slug: data.company.slug,
          industry: data.company.industry,
          country: data.company.country,
          setupComplete: true,
        },
      });

      await tx.organizationProfile.create({
        data: { organizationId: org.id, ...data.profile },
      });

      await seedStarterTemplates(tx, org.id, data.profile);

      const divisionIds: string[] = [];
      for (const div of data.divisions) {
        const created = await tx.division.create({ data: { name: div.name, organizationId: org.id } });
        divisionIds.push(created.id);
      }

      for (const dept of data.departments) {
        await tx.department.create({
          data: {
            name: dept.name,
            organizationId: org.id,
            divisionId: dept.divisionIndex !== undefined ? (divisionIds[dept.divisionIndex] ?? null) : null,
          },
        });
      }

      const adminRole = await tx.orgRole.create({
        data: { name: 'Admin', permissionLevel: 'ADMIN', isDefault: false, organizationId: org.id },
      });

      for (const role of data.roles) {
        await tx.orgRole.create({
          data: { name: role.name, permissionLevel: role.permissionLevel, isDefault: true, organizationId: org.id },
        });
      }

      const domain = data.email.split('@')[1]?.toLowerCase();
      const user = await tx.user.create({
        data: {
          email: data.email,
          emailDomain: domain ?? '',
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: UserRole.SYSTEM_ADMIN,
          organizationId: org.id,
          orgRoleId: adminRole.id,
        },
      });

      const payload = { userId: user.id, email: user.email, role: user.role, organizationId: org.id };
      const accessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] });
      const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'] });

      await tx.user.update({ where: { id: user.id }, data: { refreshToken } });

      return {
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
        accessToken,
        refreshToken,
        expiresIn: 3600,
        orgSlug: org.slug,
        inviteUrl: `/join/${org.slug}`,
      };
    });
  }

  async checkSlugAvailable(slug: string): Promise<boolean> {
    const org = await prisma.organization.findUnique({ where: { slug } });
    return org === null;
  }

  // Setup org structure for an already-authenticated user
  async setupOrgForExistingUser(
    userId: string,
    data: {
      company: { name: string; slug: string; industry?: string; country?: string };
      profile?: ReadinessProfileData;
      divisions: { name: string }[];
      departments: { name: string; divisionIndex?: number }[];
      roles: { name: string; permissionLevel: 'MANAGER' | 'AUDITOR' | 'DEPT_HEAD' | 'VIEWER' }[];
    }
  ) {
    const existingSlug = await prisma.organization.findUnique({ where: { slug: data.company.slug } });
    if (existingSlug) throw new ConflictError('Company URL is already taken');

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const org = await tx.organization.create({
        data: {
          name: data.company.name,
          slug: data.company.slug,
          industry: data.company.industry,
          country: data.company.country,
          setupComplete: true,
        },
      });

      await tx.organizationProfile.create({
        data: { organizationId: org.id, ...data.profile },
      });

      await seedStarterTemplates(tx, org.id, data.profile);

      const divisionIds: string[] = [];
      for (const div of data.divisions) {
        const created = await tx.division.create({ data: { name: div.name, organizationId: org.id } });
        divisionIds.push(created.id);
      }

      for (const dept of data.departments) {
        await tx.department.create({
          data: {
            name: dept.name,
            organizationId: org.id,
            divisionId: dept.divisionIndex !== undefined ? (divisionIds[dept.divisionIndex] ?? null) : null,
          },
        });
      }

      const adminRole = await tx.orgRole.create({
        data: { name: 'Admin', permissionLevel: 'ADMIN', isDefault: false, organizationId: org.id },
      });

      for (const role of data.roles) {
        await tx.orgRole.create({
          data: { name: role.name, permissionLevel: role.permissionLevel, isDefault: true, organizationId: org.id },
        });
      }

      // Move the existing user to the new org as SYSTEM_ADMIN
      await tx.user.update({
        where: { id: userId },
        data: {
          organizationId: org.id,
          role: UserRole.SYSTEM_ADMIN,
          orgRoleId: adminRole.id,
        },
      });

      return { orgSlug: org.slug, inviteUrl: `/join/${org.slug}` };
    });
  }
}

export const onboardingService = new OnboardingService();

import { create } from 'zustand';

export type PermissionLevel = 'MANAGER' | 'AUDITOR' | 'DEPT_HEAD' | 'VIEWER';

interface PersonalData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface CompanyData {
  name: string;
  slug: string;
  industry?: string;
  country?: string;
}

export type CompanySize = 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE';
export type QMSStatus = 'NONE' | 'BUILDING' | 'INFORMAL' | 'DOCUMENTED';
export type CertificationStatus =
  | 'NOT_CERTIFIED'
  | 'IN_PROGRESS'
  | 'CERTIFIED_SURVEILLANCE'
  | 'CERTIFIED_RECERTIFYING';
export type StandardsKnowledgeLevel = 'NONE' | 'BASIC' | 'TRAINED' | 'CERTIFIED_AUDITOR';

interface ReadinessProfileData {
  companySize?: CompanySize;
  qmsStatus?: QMSStatus;
  certificationStatus?: CertificationStatus;
  lastAuditSummary?: string;
  improvementNotes?: string;
  standardsKnowledgeLevel?: StandardsKnowledgeLevel;
  hoursPerWeek?: number;
}

interface Division {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  divisionId?: string;
}

interface OrgRole {
  id: string;
  name: string;
  permissionLevel: PermissionLevel;
}

interface OnboardingState {
  step: number;
  personal: PersonalData;
  company: CompanyData;
  profile: ReadinessProfileData;
  divisions: Division[];
  departments: Department[];
  roles: OrgRole[];
  inviteUrl: string;
  betaInviteCode: string | null;
  betaInviteValidated: boolean;

  setStep: (step: number) => void;
  setPersonal: (data: PersonalData) => void;
  setCompany: (data: CompanyData) => void;
  setProfile: (data: ReadinessProfileData) => void;
  addDivision: (name: string) => void;
  removeDivision: (id: string) => void;
  addDepartment: (name: string, divisionId?: string) => void;
  removeDepartment: (id: string) => void;
  updateDepartment: (id: string, patch: Partial<Department>) => void;
  addRole: (name: string, permissionLevel: PermissionLevel) => void;
  removeRole: (id: string) => void;
  updateRole: (id: string, patch: Partial<OrgRole>) => void;
  setInviteUrl: (url: string) => void;
  setBetaInviteCode: (code: string | null) => void;
  setBetaInviteValidated: (validated: boolean) => void;
  reset: () => void;
}

const defaultPersonal: PersonalData = { firstName: '', lastName: '', email: '', password: '' };
const defaultCompany: CompanyData = { name: '', slug: '' };
const defaultProfile: ReadinessProfileData = {};

let _idCounter = 0;
const uid = () => `local-${++_idCounter}`;

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 1,
  personal: defaultPersonal,
  company: defaultCompany,
  profile: defaultProfile,
  divisions: [],
  departments: [],
  roles: [],
  inviteUrl: '',
  betaInviteCode: null,
  betaInviteValidated: false,

  setStep: (step) => set({ step }),
  setPersonal: (personal) => set({ personal }),
  setCompany: (company) => set({ company }),
  setProfile: (profile) => set({ profile }),

  addDivision: (name) => set((s) => ({ divisions: [...s.divisions, { id: uid(), name }] })),
  removeDivision: (id) => set((s) => ({
    divisions: s.divisions.filter((d) => d.id !== id),
    departments: s.departments.map((dept) => dept.divisionId === id ? { ...dept, divisionId: undefined } : dept),
  })),

  addDepartment: (name, divisionId) => set((s) => ({ departments: [...s.departments, { id: uid(), name, divisionId }] })),
  removeDepartment: (id) => set((s) => ({ departments: s.departments.filter((d) => d.id !== id) })),
  updateDepartment: (id, patch) => set((s) => ({ departments: s.departments.map((d) => d.id === id ? { ...d, ...patch } : d) })),

  addRole: (name, permissionLevel) => set((s) => ({ roles: [...s.roles, { id: uid(), name, permissionLevel }] })),
  removeRole: (id) => set((s) => ({ roles: s.roles.filter((r) => r.id !== id) })),
  updateRole: (id, patch) => set((s) => ({ roles: s.roles.map((r) => r.id === id ? { ...r, ...patch } : r) })),

  setInviteUrl: (inviteUrl) => set({ inviteUrl }),
  setBetaInviteCode: (betaInviteCode) => set({ betaInviteCode }),
  setBetaInviteValidated: (betaInviteValidated) => set({ betaInviteValidated }),
  reset: () => set({ step: 1, personal: defaultPersonal, company: defaultCompany, profile: defaultProfile, divisions: [], departments: [], roles: [], inviteUrl: '', betaInviteCode: null, betaInviteValidated: false }),
}));

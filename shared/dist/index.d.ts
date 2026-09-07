export declare enum UserRole {
    SYSTEM_ADMIN = "SYSTEM_ADMIN",
    QUALITY_MANAGER = "QUALITY_MANAGER",
    INTERNAL_AUDITOR = "INTERNAL_AUDITOR",
    DEPARTMENT_HEAD = "DEPARTMENT_HEAD",
    VIEWER = "VIEWER"
}
export declare enum ComplianceScore {
    NON_COMPLIANT = 1,
    PARTIALLY_COMPLIANT = 2,
    FULLY_COMPLIANT = 3
}
export declare enum AssessmentStatus {
    DRAFT = "DRAFT",
    IN_PROGRESS = "IN_PROGRESS",
    UNDER_REVIEW = "UNDER_REVIEW",
    COMPLETED = "COMPLETED",
    ARCHIVED = "ARCHIVED"
}
export declare enum ActionStatus {
    OPEN = "OPEN",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    VERIFIED = "VERIFIED",
    CLOSED = "CLOSED"
}
export declare enum ActionPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare enum ISOSection {
    CONTEXT = "4",
    LEADERSHIP = "5",
    PLANNING = "6",
    SUPPORT = "7",
    OPERATION = "8",
    PERFORMANCE = "9",
    IMPROVEMENT = "10"
}
export declare enum EvidenceType {
    DOCUMENT = "DOCUMENT",
    IMAGE = "IMAGE",
    URL = "URL",
    VIDEO = "VIDEO"
}
export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface AuditableEntity extends BaseEntity {
    createdBy: string;
    updatedBy: string;
}
export interface Organization extends BaseEntity {
    name: string;
    description?: string;
    industry?: string;
    size?: string;
    logoUrl?: string;
    settings: OrganizationSettings;
}
export interface OrganizationSettings {
    autoSaveInterval: number;
    defaultAssessmentTemplate?: string;
    notificationPreferences: NotificationPreferences;
    complianceThresholds: ComplianceThresholds;
}
export interface NotificationPreferences {
    emailNotifications: boolean;
    slackWebhook?: string;
    teamsWebhook?: string;
    reminderDays: number[];
}
export interface ComplianceThresholds {
    critical: number;
    warning: number;
    target: number;
}
export interface User extends BaseEntity {
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    organizationId: string;
    department?: string;
    isActive: boolean;
    lastLoginAt?: Date;
    profileImageUrl?: string;
}
export interface UserWithOrganization extends User {
    organization: Organization;
}
export interface ISOStandardSection extends BaseEntity {
    sectionNumber: string;
    title: string;
    description: string;
    parentSectionId?: string;
    order: number;
    weight: number;
    isCritical: boolean;
}
export interface AuditQuestion extends BaseEntity {
    sectionId: string;
    questionNumber: string;
    questionText: string;
    guidance?: string;
    scoreCriteria: ScoreCriteria;
    subPoints?: SubPoint[];
    order: number;
    isRequired: boolean;
    referenceDocuments?: string[];
}
export interface ScoreCriteria {
    score1: string;
    score2: string;
    score3: string;
}
export interface SubPoint {
    id: string;
    text: string;
    order: number;
}
export interface Assessment extends AuditableEntity {
    organizationId: string;
    title: string;
    description?: string;
    status: AssessmentStatus;
    templateId?: string;
    leadAuditorId: string;
    teamMemberIds: string[];
    scheduledDate?: Date;
    completedDate?: Date;
    dueDate?: Date;
    overallScore?: number;
    sectionScores: SectionScore[];
    metadata: AssessmentMetadata;
}
export interface AssessmentMetadata {
    auditType: 'INTERNAL' | 'EXTERNAL' | 'SURVEILLANCE' | 'CERTIFICATION';
    scope?: string;
    objectives?: string[];
    auditCriteria?: string;
    previousAssessmentId?: string;
}
export interface SectionScore {
    sectionId: string;
    sectionNumber: string;
    sectionTitle: string;
    score: number;
    maxPossibleScore: number;
    actualScore: number;
    questionsAnswered: number;
    totalQuestions: number;
}
export interface QuestionResponse extends AuditableEntity {
    assessmentId: string;
    questionId: string;
    sectionId: string;
    score?: ComplianceScore;
    justification?: string;
    verifiedSubPoints?: string[];
    actionProposal?: string;
    conclusion?: string;
    evidenceIds: string[];
    isDraft: boolean;
}
export interface Evidence extends AuditableEntity {
    questionResponseId: string;
    type: EvidenceType;
    name: string;
    description?: string;
    url?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    version: number;
    previousVersionId?: string;
    tags?: string[];
}
export interface NonConformity extends AuditableEntity {
    assessmentId: string;
    questionResponseId: string;
    sectionNumber: string;
    title: string;
    description: string;
    severity: 'MINOR' | 'MAJOR' | 'CRITICAL';
    category: string;
    status: ActionStatus;
    dueDate?: Date;
    closedDate?: Date;
}
export interface CorrectiveAction extends AuditableEntity {
    nonConformityId: string;
    title: string;
    description: string;
    priority: ActionPriority;
    status: ActionStatus;
    assigneeId: string;
    reviewerId?: string;
    dueDate?: Date;
    completedDate?: Date;
    verifiedDate?: Date;
    rootCauseAnalysis?: RootCauseAnalysis;
    effectiveness?: ActionEffectiveness;
}
export interface RootCauseAnalysis {
    method: 'FIVE_WHYS' | 'FISHBONE' | 'PARETO' | 'OTHER';
    findings: string;
    rootCause: string;
    contributingFactors?: string[];
}
export interface ActionEffectiveness {
    isEffective: boolean;
    verificationMethod: string;
    verificationDate: Date;
    verifiedBy: string;
    notes?: string;
}
export interface AuditReport {
    assessment: Assessment;
    organization: Organization;
    leadAuditor: User;
    teamMembers: User[];
    executiveSummary: ExecutiveSummary;
    sectionDetails: SectionDetail[];
    nonConformities: NonConformity[];
    correctiveActions: CorrectiveAction[];
    recommendations: string[];
    generatedAt: Date;
    generatedBy: string;
}
export interface ExecutiveSummary {
    overallScore: number;
    complianceStatus: 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT';
    criticalFindings: number;
    majorFindings: number;
    minorFindings: number;
    openActions: number;
    keyStrengths: string[];
    areasForImprovement: string[];
}
export interface SectionDetail {
    section: ISOStandardSection;
    score: number;
    responses: QuestionResponse[];
    findings: string[];
    recommendations: string[];
}
export interface DashboardData {
    currentAssessment?: AssessmentSummary;
    complianceOverview: ComplianceOverview;
    recentAssessments: AssessmentSummary[];
    upcomingAudits: ScheduledAudit[];
    actionItems: ActionItemSummary[];
    trendData: TrendDataPoint[];
}
export interface AssessmentSummary {
    id: string;
    title: string;
    status: AssessmentStatus;
    overallScore?: number;
    completedDate?: Date;
    dueDate?: Date;
    progress: number;
}
export interface ComplianceOverview {
    overallScore: number;
    sectionScores: {
        section: string;
        sectionNumber: string;
        score: number;
    }[];
    trend: 'UP' | 'DOWN' | 'STABLE';
    changeFromPrevious?: number;
}
export interface ScheduledAudit {
    id: string;
    title: string;
    scheduledDate: Date;
    type: string;
    leadAuditor: string;
}
export interface ActionItemSummary {
    id: string;
    title: string;
    priority: ActionPriority;
    status: ActionStatus;
    dueDate?: Date;
    assignee: string;
    sectionNumber: string;
}
export interface TrendDataPoint {
    date: Date;
    overallScore: number;
    sectionScores: Record<string, number>;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
}
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
}
export interface CSVImportRow {
    standardReference: string;
    standardText: string;
    auditQuestion: string;
    score1Criteria: string;
    score2Criteria: string;
    score3Criteria: string;
    referenceDocuments?: string;
    guidance?: string;
}
export interface CSVImportResult {
    success: boolean;
    sectionsCreated: number;
    questionsCreated: number;
    errors: CSVImportError[];
}
export interface CSVImportError {
    row: number;
    field: string;
    message: string;
}
export interface AuthTokenPayload {
    userId: string;
    email: string;
    role: UserRole;
    organizationId: string;
    iat: number;
    exp: number;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface AssessmentFilters {
    status?: AssessmentStatus[];
    startDate?: Date;
    endDate?: Date;
    leadAuditorId?: string;
    searchTerm?: string;
}
export interface ActionFilters {
    status?: ActionStatus[];
    priority?: ActionPriority[];
    assigneeId?: string;
    dueDateFrom?: Date;
    dueDateTo?: Date;
    sectionNumber?: string;
}
//# sourceMappingURL=index.d.ts.map
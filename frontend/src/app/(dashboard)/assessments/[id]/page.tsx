'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  AlertCircle,
  Users,
  Calendar,
  Target,
  ClipboardList,
  PlayCircle,
} from 'lucide-react';
import { useAssessment, useDeleteAssessment } from '@/hooks/useAssessments';
import { useAuthStore } from '@/lib/store';
import { assessmentsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressBar, CircularProgress } from '@/components/ui/progress-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { DeleteConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { SectionNavigator } from '@/components/assessments/section-navigator';
import { SectionScoreSummary } from '@/components/assessments/section-score-summary';
import { SectionProgressIndicator } from '@/components/assessments/section-progress-indicator';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-[var(--surface-sunken)] text-[var(--text-body)]',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-green-50 text-green-700',
  ARCHIVED: 'bg-[var(--surface-sunken)] text-[var(--text-muted)]',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  IN_PROGRESS: 'In Progress',
  UNDER_REVIEW: 'Under Review',
  COMPLETED: 'Completed',
  ARCHIVED: 'Archived',
};

const auditTypeLabels: Record<string, string> = {
  INTERNAL: 'Internal Audit',
  EXTERNAL: 'External Audit',
  SURVEILLANCE: 'Surveillance Audit',
  CERTIFICATION: 'Certification Audit',
};

// Roles that can edit assessments
const EDIT_ROLES = ['SYSTEM_ADMIN', 'QUALITY_MANAGER', 'INTERNAL_AUDITOR'];
// Roles that can delete assessments
const DELETE_ROLES = ['SYSTEM_ADMIN', 'QUALITY_MANAGER'];
// Roles that can generate reports
const REPORT_ROLES = ['SYSTEM_ADMIN', 'QUALITY_MANAGER', 'INTERNAL_AUDITOR'];
// Roles that can conduct audits
const AUDIT_ROLES = ['SYSTEM_ADMIN', 'QUALITY_MANAGER', 'INTERNAL_AUDITOR'];

function AssessmentDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton width={40} height={40} variant="circular" />
        <div className="space-y-2">
          <Skeleton width={300} height={28} />
          <Skeleton width={200} height={20} />
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton width={150} height={24} />
            </CardHeader>
            <CardContent>
              <Skeleton width="100%" height={100} />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton width={120} height={24} />
            </CardHeader>
            <CardContent>
              <Skeleton width={120} height={120} variant="circular" className="mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const assessmentId = (params?.id ?? '') as string;
  const { data, isLoading, isError } = useAssessment(assessmentId);
  const deleteAssessment = useDeleteAssessment();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const assessment = data?.data;

  // Role-based permissions
  const userRole = user?.role || '';
  const isLeadAuditor = assessment?.leadAuditorId === user?.id;
  const isTeamMember = assessment?.teamMembers?.some(
    (member: { user: { id: string } }) => member.user.id === user?.id
  );
  const canEdit =
    EDIT_ROLES.includes(userRole) ||
    isLeadAuditor;
  const canDelete = DELETE_ROLES.includes(userRole);
  const canGenerateReport =
    REPORT_ROLES.includes(userRole) &&
    (assessment?.status === 'COMPLETED' || assessment?.status === 'UNDER_REVIEW');
  const canAudit =
    (AUDIT_ROLES.includes(userRole) || isLeadAuditor || isTeamMember) &&
    (assessment?.status === 'DRAFT' || assessment?.status === 'IN_PROGRESS');

  const handleDelete = async () => {
    try {
      await deleteAssessment.mutateAsync(assessmentId);
      toast.success('Assessment deleted successfully');
      router.push('/assessments');
    } catch {
      toast.error('Failed to delete assessment');
    }
  };

  const handleGenerateReport = async () => {
    if (isGeneratingReport) return;

    setIsGeneratingReport(true);
    try {
      const response = await assessmentsApi.downloadReport(assessmentId);

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/pdf' });

      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename from assessment title
      const sanitizedTitle = (assessment?.title || 'assessment')
        .replace(/[^a-zA-Z0-9-_]/g, '_')
        .substring(0, 50);
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `${sanitizedTitle}_report_${timestamp}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      window.URL.revokeObjectURL(url);

      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (isLoading) {
    return <AssessmentDetailSkeleton />;
  }

  if (isError || !assessment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/assessments">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-[var(--text-strong)]">Assessment Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <p className="text-[var(--text-body)] font-medium">Failed to load assessment</p>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              The assessment may have been deleted or you don't have permission to view it.
            </p>
            <Link href="/assessments">
              <Button className="mt-4">Back to Assessments</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate progress based on responses
  const totalQuestions = assessment.responses?.length || 0;
  const answeredQuestions =
    assessment.responses?.filter((r: { score: number | null }) => r.score !== null).length || 0;
  const progressPercentage =
    totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/assessments">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--text-strong)]">{assessment.title}</h1>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  statusColors[assessment.status] || 'bg-[var(--surface-sunken)] text-[var(--text-body)]'
                }`}
              >
                {statusLabels[assessment.status] || assessment.status}
              </span>
            </div>
            <p className="text-[var(--text-muted)] mt-1">
              {auditTypeLabels[assessment.auditType] || assessment.auditType}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-14 sm:ml-0">
          {canAudit && (
            <Link href={`/assessments/${assessmentId}/audit`}>
              <Button>
                <PlayCircle className="mr-2 h-4 w-4" />
                {progressPercentage > 0 ? 'Continue Audit' : 'Start Audit'}
              </Button>
            </Link>
          )}
          {canEdit && assessment.status !== 'COMPLETED' && assessment.status !== 'ARCHIVED' && (
            <Link href={`/assessments/${assessmentId}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          )}
          {canGenerateReport && (
            <Button
              variant="outline"
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              loading={isGeneratingReport}
            >
              <FileText className="mr-2 h-4 w-4" />
              {isGeneratingReport ? 'Generating...' : 'Generate Report'}
            </Button>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleteAssessment.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        itemName={assessment.title}
        itemType="assessment"
        isLoading={deleteAssessment.isPending}
        canBeUndone={true}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-[var(--brand-strong)]" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--text-muted)] whitespace-pre-wrap">
                {assessment.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          {/* Details Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dates */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-[var(--text-subtle)] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[var(--text-body)]">Scheduled Date</p>
                      <p className="text-[var(--text-muted)]">
                        {assessment.scheduledDate
                          ? format(new Date(assessment.scheduledDate), 'MMMM d, yyyy')
                          : 'Not scheduled'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-[var(--text-subtle)] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[var(--text-body)]">Due Date</p>
                      <p className="text-[var(--text-muted)]">
                        {assessment.dueDate
                          ? format(new Date(assessment.dueDate), 'MMMM d, yyyy')
                          : 'No due date'}
                      </p>
                    </div>
                  </div>
                  {assessment.completedDate && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-[var(--text-body)]">Completed Date</p>
                        <p className="text-[var(--text-muted)]">
                          {format(new Date(assessment.completedDate), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scope */}
                {assessment.scope && (
                  <div>
                    <p className="text-sm font-medium text-[var(--text-body)] mb-1">Scope</p>
                    <p className="text-[var(--text-muted)]">{assessment.scope}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section Score Summary */}
          {assessment.responses && assessment.responses.length > 0 && (
            <SectionScoreSummary
              responses={assessment.responses.map((r: {
                id: string;
                score: number | null;
                section: { id: string; sectionNumber: string; title: string } | null;
              }) => ({
                id: r.id,
                score: r.score,
                section: r.section,
              }))}
            />
          )}

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[var(--brand-strong)]" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Lead Auditor */}
                <div className="flex items-center justify-between p-3 bg-[var(--brand-soft)] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[var(--brand-soft)] flex items-center justify-center">
                      <span className="text-[var(--brand)] font-medium">
                        {assessment.leadAuditor.firstName[0]}
                        {assessment.leadAuditor.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-strong)]">
                        {assessment.leadAuditor.firstName} {assessment.leadAuditor.lastName}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">{(assessment.leadAuditor as any).email}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-[var(--brand-soft)] text-[var(--brand)] rounded">
                    Lead Auditor
                  </span>
                </div>

                {/* Other Team Members */}
                {assessment.teamMembers?.map(
                  (member: {
                    id: string;
                    role: string;
                    user: { id: string; firstName: string; lastName: string; email: string };
                  }) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-[var(--surface-sunken)] rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[var(--stone-200)] flex items-center justify-center">
                          <span className="text-[var(--text-muted)] font-medium">
                            {member.user.firstName[0]}
                            {member.user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-strong)]">
                            {member.user.firstName} {member.user.lastName}
                          </p>
                          <p className="text-sm text-[var(--text-muted)]">{member.user.email}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-[var(--stone-200)] text-[var(--text-body)] rounded">
                        {member.role.replace('_', ' ')}
                      </span>
                    </div>
                  )
                )}

                {(!assessment.teamMembers || assessment.teamMembers.length === 0) && (
                  <p className="text-[var(--text-muted)] text-sm">No additional team members assigned.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Progress & Stats */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {assessment.status === 'COMPLETED' ? (
                <>
                  <CircularProgress
                    value={assessment.overallScore || 0}
                    colorScheme="compliance"
                    size={160}
                    strokeWidth={12}
                  />
                  <p className="mt-4 text-[var(--text-muted)] text-center">Compliance Score</p>
                </>
              ) : (
                <>
                  <CircularProgress value={progressPercentage} size={160} strokeWidth={12} />
                  <div className="mt-4 w-full">
                    <SectionProgressIndicator
                      answered={answeredQuestions}
                      total={totalQuestions}
                      size="md"
                      showProgressBar={true}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Responses</span>
                <span className="font-medium">{assessment.responses?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Non-Conformities</span>
                <span className="font-medium text-red-600">
                  {assessment.nonConformities?.length || 0}
                </span>
              </div>
              {assessment.template && (
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)]">Template</span>
                  <span className="font-medium">{assessment.template.name}</span>
                </div>
              )}
              <div className="pt-2 border-t">
                <p className="text-sm text-[var(--text-muted)]">
                  Created {format(new Date(assessment.createdAt), 'MMM d, yyyy')}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  Updated {format(new Date(assessment.updatedAt), 'MMM d, yyyy')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section Navigator */}
          {assessment.status !== 'DRAFT' && assessment.responses && (
            <SectionNavigator
              responses={assessment.responses.map((r: {
                id: string;
                score: number | null;
                section: { id: string; sectionNumber: string; title: string } | null;
              }) => ({
                id: r.id,
                score: r.score,
                section: r.section,
              }))}
            />
          )}
        </div>
      </div>
    </div>
  );
}

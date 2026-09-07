'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  FileText,
  Calendar,
  Hash,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import {
  useNonConformity,
  useUpdateNonConformity,
} from '@/hooks/useNonConformities';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { NCRStatusWorkflow } from '@/components/ncr/NCRStatusWorkflow';
import { CorrectiveActionList } from '@/components/ncr/CorrectiveActionList';
import { CorrectiveActionFormModal } from '@/components/ncr/CorrectiveActionFormModal';
import { VerificationFormModal } from '@/components/ncr/VerificationFormModal';
import { RootCauseAgentModal } from '@/components/ncr/RootCauseAgentModal';
import { CorrectiveAction } from '@/hooks/useCorrectiveActions';
import { RootCauseWhyStep } from '@/lib/api';

const statusColors: Record<string, string> = {
  OPEN: 'bg-red-50 text-red-700',
  IN_PROGRESS: 'bg-amber-50 text-amber-700',
  RESOLVED: 'bg-blue-50 text-blue-700',
  CLOSED: 'bg-green-50 text-green-700',
};

const statusLabels: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const severityColors: Record<string, string> = {
  MINOR: 'bg-amber-50 text-amber-700 border-amber-300',
  MAJOR: 'bg-orange-100 text-orange-700 border-orange-300',
  CRITICAL: 'bg-red-50 text-red-700 border-red-300',
};

const severityIcons: Record<string, React.ReactNode> = {
  MINOR: <AlertCircle className="h-5 w-5" />,
  MAJOR: <AlertTriangle className="h-5 w-5" />,
  CRITICAL: <AlertCircle className="h-5 w-5" />,
};

const rootCauseMethodOptions = [
  { value: '5_WHYS', label: '5 Whys' },
  { value: 'FISHBONE', label: 'Fishbone (Ishikawa) Diagram' },
  { value: 'FMEA', label: 'FMEA' },
  { value: 'PARETO', label: 'Pareto Analysis' },
  { value: 'OTHER', label: 'Other' },
];

// Roles that can edit NCRs
const EDIT_ROLES = ['SYSTEM_ADMIN', 'QUALITY_MANAGER', 'INTERNAL_AUDITOR'];

function NCRDetailSkeleton() {
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
          <Card>
            <CardHeader>
              <Skeleton width={150} height={24} />
            </CardHeader>
            <CardContent>
              <Skeleton width="100%" height={150} />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton width={120} height={24} />
            </CardHeader>
            <CardContent>
              <Skeleton width="100%" height={120} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface RootCauseFormProps {
  rootCause: string;
  rootCauseMethod: string;
  onSave: (rootCause: string, rootCauseMethod: string) => void;
  onCancel: () => void;
  isSaving: boolean;
}

function RootCauseForm({ rootCause, rootCauseMethod, onSave, onCancel, isSaving }: RootCauseFormProps) {
  const [localRootCause, setLocalRootCause] = useState(rootCause);
  const [localMethod, setLocalMethod] = useState(rootCauseMethod);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="rootCauseMethod" className="block text-sm font-medium text-[var(--text-body)] mb-1">
          Root Cause Analysis Method
        </label>
        <select
          id="rootCauseMethod"
          value={localMethod}
          onChange={(e) => setLocalMethod(e.target.value)}
          className="w-full rounded-md border border-[var(--border-default)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
        >
          <option value="">Select a method...</option>
          {rootCauseMethodOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="rootCause" className="block text-sm font-medium text-[var(--text-body)] mb-1">
          Root Cause Description
        </label>
        <textarea
          id="rootCause"
          value={localRootCause}
          onChange={(e) => setLocalRootCause(e.target.value)}
          rows={4}
          placeholder="Describe the root cause of this non-conformity..."
          className="w-full rounded-md border border-[var(--border-default)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={() => onSave(localRootCause, localMethod)} loading={isSaving}>
          Save Root Cause
        </Button>
      </div>
    </div>
  );
}

export default function NonConformityDetailPage() {
  const params = useParams();
  const { user } = useAuthStore();
  const [isEditingRootCause, setIsEditingRootCause] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionToVerify, setActionToVerify] = useState<CorrectiveAction | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiPrefill, setAiPrefill] = useState<{ rootCause: string; method: string } | null>(null);

  const ncrId = (params?.id ?? '') as string;
  const { data, isLoading, isError } = useNonConformity(ncrId);
  const updateNCR = useUpdateNonConformity();

  const ncr = data?.data;

  // Role-based permissions
  const userRole = user?.role || '';
  const canEdit = EDIT_ROLES.includes(userRole) && ncr?.status !== 'CLOSED';

  const handleSaveRootCause = async (rootCause: string, rootCauseMethod: string) => {
    try {
      await updateNCR.mutateAsync({
        id: ncrId,
        data: {
          rootCause: rootCause || null,
          rootCauseMethod: rootCauseMethod || null,
        },
      });
      toast.success('Root cause saved successfully');
      setIsEditingRootCause(false);
      setAiPrefill(null);
    } catch {
      toast.error('Failed to save root cause');
    }
  };

  const handleAcceptAIRootCause = (rootCause: string, _whyChain: RootCauseWhyStep[]) => {
    setAiPrefill({ rootCause, method: '5_WHYS' });
    setIsEditingRootCause(true);
  };

  if (isLoading) {
    return <NCRDetailSkeleton />;
  }

  if (isError || !ncr) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/non-conformities">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-[var(--text-strong)]">Non-Conformity Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <p className="text-[var(--text-body)] font-medium">Failed to load non-conformity</p>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              The non-conformity may have been deleted or you don't have permission to view it.
            </p>
            <Link href="/non-conformities">
              <Button className="mt-4">Back to Non-Conformities</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const methodLabel = rootCauseMethodOptions.find((m) => m.value === ncr.rootCauseMethod)?.label || ncr.rootCauseMethod;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/non-conformities">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-[var(--text-strong)]">{ncr.title}</h1>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  statusColors[ncr.status] || 'bg-[var(--surface-sunken)] text-[var(--text-body)]'
                }`}
              >
                {statusLabels[ncr.status] || ncr.status}
              </span>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full border flex items-center gap-1 ${
                  severityColors[ncr.severity] || 'bg-[var(--surface-sunken)] text-[var(--text-body)]'
                }`}
              >
                {severityIcons[ncr.severity]}
                {ncr.severity}
              </span>
            </div>
            <p className="text-[var(--text-muted)] mt-1">
              Identified: {format(new Date(ncr.identifiedDate), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Status Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Status Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <NCRStatusWorkflow
            ncrId={ncrId}
            currentStatus={ncr.status as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'}
            requirements={{
              hasCorrectiveActions: (ncr.correctiveActions?.length || 0) > 0,
              allActionsCompleted: ncr.correctiveActions?.every(
                (a: { status: string }) => a.status === 'COMPLETED' || a.status === 'VERIFIED'
              ) ?? false,
              allActionsVerified: ncr.correctiveActions?.every(
                (a: { status: string }) => a.status === 'VERIFIED'
              ) ?? false,
              hasRootCause: !!ncr.rootCause && ncr.rootCause.trim().length > 0,
            }}
            canEdit={canEdit}
          />
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--brand-strong)]" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--text-muted)] whitespace-pre-wrap">
                {ncr.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          {/* Root Cause Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-[var(--brand-strong)]" />
                Root Cause Analysis
              </CardTitle>
              {canEdit && !isEditingRootCause && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowAIChat(true)}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI 5 Whys
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsEditingRootCause(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {ncr.rootCause ? 'Edit' : 'Add Root Cause'}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isEditingRootCause ? (
                <RootCauseForm
                  key={aiPrefill ? 'ai-prefill' : 'existing'}
                  rootCause={aiPrefill?.rootCause ?? ncr.rootCause ?? ''}
                  rootCauseMethod={aiPrefill?.method ?? ncr.rootCauseMethod ?? ''}
                  onSave={handleSaveRootCause}
                  onCancel={() => {
                    setIsEditingRootCause(false);
                    setAiPrefill(null);
                  }}
                  isSaving={updateNCR.isPending}
                />
              ) : ncr.rootCause ? (
                <div className="space-y-4">
                  {ncr.rootCauseMethod && (
                    <div>
                      <p className="text-sm font-medium text-[var(--text-muted)]">Analysis Method</p>
                      <p className="text-[var(--text-body)]">{methodLabel}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-[var(--text-muted)]">Root Cause</p>
                    <p className="text-[var(--text-body)] whitespace-pre-wrap">{ncr.rootCause}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <HelpCircle className="mx-auto h-10 w-10 text-[var(--text-subtle)] mb-2" />
                  <p className="text-[var(--text-muted)]">No root cause analysis documented yet.</p>
                  {canEdit && (
                    <Button
                      variant="outline"
                      className="mt-3"
                      onClick={() => setIsEditingRootCause(true)}
                    >
                      Document Root Cause
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Linked Question/Response */}
          {ncr.response && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-[var(--brand-strong)]" />
                  Linked Assessment Response
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Section Info */}
                {ncr.response.section && (
                  <div className="bg-[var(--surface-sunken)] rounded-xl p-4">
                    <p className="text-sm font-medium text-[var(--text-muted)] mb-1">ISO Section</p>
                    <p className="text-[var(--text-strong)] font-medium">
                      {ncr.response.section.sectionNumber} - {ncr.response.section.title}
                    </p>
                  </div>
                )}

                {/* Question Info */}
                <div className="border-l-4 border-red-400 pl-4">
                  <p className="text-sm font-medium text-[var(--text-muted)] mb-1">
                    Question {ncr.response.question.questionNumber}
                  </p>
                  <p className="text-[var(--text-body)]">{ncr.response.question.questionText}</p>
                  {(ncr.response.question as any).standardReference && (
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      Reference: {(ncr.response.question as any).standardReference}
                    </p>
                  )}
                </div>

                {/* Response Score & Justification */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-muted)] mb-1">Score</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700">
                      {(ncr.response as any).score} - Non-Compliant
                    </span>
                  </div>
                  {(ncr.response as any).justification && (
                    <div>
                      <p className="text-sm font-medium text-[var(--text-muted)] mb-1">Justification</p>
                      <p className="text-[var(--text-muted)] text-sm">{(ncr.response as any).justification}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Corrective Actions List */}
          <CorrectiveActionList
            ncrId={ncrId}
            ncrStatus={ncr.status}
            canEdit={canEdit}
            onAddAction={() => setShowActionModal(true)}
            onVerifyAction={(action) => setActionToVerify(action)}
          />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Assessment Context */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-[var(--text-muted)] mb-1">Assessment</p>
                <Link
                  href={`/assessments/${ncr.assessment.id}`}
                  className="flex items-center gap-1 text-[var(--brand-strong)] hover:text-[var(--brand)] font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  {ncr.assessment.title}
                </Link>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-muted)] mb-1">Assessment Status</p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    ncr.assessment.status === 'COMPLETED'
                      ? 'bg-green-50 text-green-700'
                      : ncr.assessment.status === 'IN_PROGRESS'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-[var(--surface-sunken)] text-[var(--text-body)]'
                  }`}
                >
                  {ncr.assessment.status.replace('_', ' ')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[var(--brand-strong)]" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Identified</span>
                <span className="text-[var(--text-strong)] font-medium">
                  {format(new Date(ncr.identifiedDate), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Created</span>
                <span className="text-[var(--text-strong)] font-medium">
                  {format(new Date(ncr.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Last Updated</span>
                <span className="text-[var(--text-strong)] font-medium">
                  {format(new Date(ncr.updatedAt), 'MMM d, yyyy')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Corrective Actions</span>
                <span className="font-medium">{ncr.correctiveActions?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Actions Completed</span>
                <span className="font-medium text-blue-600">
                  {ncr.correctiveActions?.filter((a: { status: string }) =>
                    a.status === 'COMPLETED' || a.status === 'VERIFIED'
                  ).length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Actions Verified</span>
                <span className="font-medium text-green-600">
                  {ncr.correctiveActions?.filter((a: { status: string }) =>
                    a.status === 'VERIFIED'
                  ).length || 0}
                </span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-[var(--text-muted)]">
                  {ncr.rootCause ? 'Root cause documented' : 'Root cause not documented'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Corrective Action Form Modal */}
      <CorrectiveActionFormModal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        ncrId={ncrId}
      />

      {/* Verification Form Modal */}
      <VerificationFormModal
        isOpen={actionToVerify !== null}
        onClose={() => setActionToVerify(null)}
        action={actionToVerify}
      />

      {/* AI 5 Whys Root Cause Agent Modal */}
      <RootCauseAgentModal
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        ncrId={ncrId}
        onAccept={handleAcceptAIRootCause}
      />
    </div>
  );
}

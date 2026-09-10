'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Lock,
  AlertCircle,
  PlayCircle,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTransitionNCRStatus } from '@/hooks/useNonConformities';

// NCR status types
type NCRStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

// Valid transitions for each status
const VALID_TRANSITIONS: Record<NCRStatus, NCRStatus[]> = {
  OPEN: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED', 'OPEN'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [], // Terminal state
};

// Labels for each status
const STATUS_LABELS: Record<NCRStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

// Icons for each status
const STATUS_ICONS: Record<NCRStatus, React.ReactNode> = {
  OPEN: <AlertCircle className="h-4 w-4" />,
  IN_PROGRESS: <PlayCircle className="h-4 w-4" />,
  RESOLVED: <ClipboardCheck className="h-4 w-4" />,
  CLOSED: <Lock className="h-4 w-4" />,
};

// Descriptions for each transition
const TRANSITION_DESCRIPTIONS: Record<string, string> = {
  'OPEN->IN_PROGRESS': 'Start working on this non-conformity',
  'IN_PROGRESS->RESOLVED': 'Mark as resolved after completing all corrective actions',
  'IN_PROGRESS->OPEN': 'Return to open status',
  'RESOLVED->CLOSED': 'Close this non-conformity (requires verified actions and root cause)',
  'RESOLVED->IN_PROGRESS': 'Reopen for additional work',
};

// Requirements for specific transitions
interface TransitionRequirements {
  hasCorrectiveActions: boolean;
  allActionsCompleted: boolean;
  allActionsVerified: boolean;
  hasRootCause: boolean;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentStatus: NCRStatus;
  newStatus: NCRStatus;
  isLoading: boolean;
  validationError?: string | null;
}

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  newStatus,
  isLoading,
  validationError,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const transitionKey = `${currentStatus}->${newStatus}`;
  const description = TRANSITION_DESCRIPTIONS[transitionKey] || 'Change the NCR status';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative bg-[var(--surface-card)] rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-[var(--text-strong)] mb-2">
          Confirm Status Change
        </h3>
        <p className="text-[var(--text-muted)] mb-4">
          Are you sure you want to change the status from{' '}
          <span className="font-medium">{STATUS_LABELS[currentStatus]}</span> to{' '}
          <span className="font-medium">{STATUS_LABELS[newStatus]}</span>?
        </p>
        <p className="text-sm text-[var(--text-muted)] mb-4 bg-[var(--surface-sunken)] rounded-md p-3">
          {description}
        </p>

        {validationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {validationError}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            loading={isLoading}
            disabled={!!validationError}
          >
            Confirm Change
          </Button>
        </div>
      </div>
    </div>
  );
}

interface NCRStatusWorkflowProps {
  ncrId: string;
  currentStatus: NCRStatus;
  requirements: TransitionRequirements;
  canEdit: boolean;
}

export function NCRStatusWorkflow({
  ncrId,
  currentStatus,
  requirements,
  canEdit,
}: NCRStatusWorkflowProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    targetStatus: NCRStatus | null;
  }>({ isOpen: false, targetStatus: null });

  const transitionMutation = useTransitionNCRStatus();

  const validTransitions = VALID_TRANSITIONS[currentStatus];

  // Validate transition requirements
  const getValidationError = (targetStatus: NCRStatus): string | null => {
    if (targetStatus === 'RESOLVED') {
      if (!requirements.hasCorrectiveActions) {
        return 'Cannot resolve: At least one corrective action is required.';
      }
      if (!requirements.allActionsCompleted) {
        return 'Cannot resolve: All corrective actions must be completed first.';
      }
    }

    if (targetStatus === 'CLOSED') {
      if (!requirements.hasRootCause) {
        return 'Cannot close: Root cause must be documented.';
      }
      if (!requirements.allActionsVerified) {
        return 'Cannot close: All corrective actions must be verified.';
      }
    }

    return null;
  };

  const handleTransitionClick = (targetStatus: NCRStatus) => {
    setConfirmDialog({ isOpen: true, targetStatus });
  };

  const handleConfirm = async () => {
    if (!confirmDialog.targetStatus) return;

    try {
      await transitionMutation.mutateAsync({
        id: ncrId,
        status: confirmDialog.targetStatus,
      });
      toast.success(`Status changed to ${STATUS_LABELS[confirmDialog.targetStatus]}`);
      setConfirmDialog({ isOpen: false, targetStatus: null });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to change status';
      // Check if it's an API error with a response
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
      ) {
        toast.error((error as { response: { data: { message: string } } }).response.data.message);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleClose = () => {
    setConfirmDialog({ isOpen: false, targetStatus: null });
  };

  // If the NCR is closed (terminal state), show a message
  if (currentStatus === 'CLOSED') {
    return (
      <div className="flex items-center gap-2 text-[var(--text-muted)]">
        <Lock className="h-4 w-4" />
        <span className="text-sm">This NCR is closed and cannot be modified.</span>
      </div>
    );
  }

  // If user can't edit, don't show the buttons
  if (!canEdit) {
    return null;
  }

  // If no valid transitions, show nothing
  if (validTransitions.length === 0) {
    return null;
  }

  // Determine the forward and backward transitions
  const forwardTransition = validTransitions.find(
    (s) =>
      (currentStatus === 'OPEN' && s === 'IN_PROGRESS') ||
      (currentStatus === 'IN_PROGRESS' && s === 'RESOLVED') ||
      (currentStatus === 'RESOLVED' && s === 'CLOSED')
  );

  const backwardTransition = validTransitions.find(
    (s) =>
      (currentStatus === 'IN_PROGRESS' && s === 'OPEN') ||
      (currentStatus === 'RESOLVED' && s === 'IN_PROGRESS')
  );

  return (
    <div className="space-y-4">
      {/* Status workflow visualization */}
      <div className="flex items-center justify-center gap-1 text-sm">
        {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as NCRStatus[]).map(
          (status, index) => (
            <div key={status} className="flex items-center gap-1">
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded ${
                  status === currentStatus
                    ? 'bg-[var(--brand-soft)] text-[var(--brand)] font-medium'
                    : 'text-[var(--text-subtle)]'
                }`}
              >
                {STATUS_ICONS[status]}
                <span className="hidden sm:inline">{STATUS_LABELS[status]}</span>
              </div>
              {index < 3 && (
                <ArrowRight className="h-4 w-4 text-[var(--text-subtle)]" />
              )}
            </div>
          )
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        {/* Backward transition button */}
        {backwardTransition && (
          <Button
            variant="outline"
            onClick={() => handleTransitionClick(backwardTransition)}
            disabled={transitionMutation.isPending}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {STATUS_LABELS[backwardTransition]}
          </Button>
        )}

        {/* Forward transition button */}
        {forwardTransition && (
          <Button
            onClick={() => handleTransitionClick(forwardTransition)}
            disabled={transitionMutation.isPending}
          >
            {forwardTransition === 'CLOSED' ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Close NCR
              </>
            ) : (
              <>
                Move to {STATUS_LABELS[forwardTransition]}
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Requirements hint for forward transitions */}
      {forwardTransition && (
        <div className="text-center">
          {forwardTransition === 'RESOLVED' && (
            <div className="text-xs text-[var(--text-muted)] space-y-1">
              <p>Requirements to resolve:</p>
              <ul className="space-y-0.5">
                <li className={requirements.hasCorrectiveActions ? 'text-green-600' : 'text-red-500'}>
                  {requirements.hasCorrectiveActions ? '✓' : '✗'} At least one corrective action
                </li>
                <li className={requirements.allActionsCompleted ? 'text-green-600' : 'text-red-500'}>
                  {requirements.allActionsCompleted ? '✓' : '✗'} All actions completed
                </li>
              </ul>
            </div>
          )}
          {forwardTransition === 'CLOSED' && (
            <div className="text-xs text-[var(--text-muted)] space-y-1">
              <p>Requirements to close:</p>
              <ul className="space-y-0.5">
                <li className={requirements.hasRootCause ? 'text-green-600' : 'text-red-500'}>
                  {requirements.hasRootCause ? '✓' : '✗'} Root cause documented
                </li>
                <li className={requirements.allActionsVerified ? 'text-green-600' : 'text-red-500'}>
                  {requirements.allActionsVerified ? '✓' : '✗'} All actions verified
                </li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Confirmation dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        currentStatus={currentStatus}
        newStatus={confirmDialog.targetStatus as NCRStatus}
        isLoading={transitionMutation.isPending}
        validationError={
          confirmDialog.targetStatus
            ? getValidationError(confirmDialog.targetStatus)
            : null
        }
      />
    </div>
  );
}

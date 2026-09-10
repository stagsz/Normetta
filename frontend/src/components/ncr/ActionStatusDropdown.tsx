'use client';

import { useState } from 'react';
import { ChevronDown, Check, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateActionStatus } from '@/hooks/useCorrectiveActions';

type ActionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';

// Valid status transitions matching backend rules
const VALID_TRANSITIONS: Record<ActionStatus, ActionStatus[]> = {
  PENDING: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED', 'PENDING'],
  COMPLETED: ['VERIFIED', 'IN_PROGRESS'],
  VERIFIED: [], // Terminal state
};

const statusConfig: Record<ActionStatus, {
  label: string;
  color: string;
  bgColor: string;
  hoverBgColor: string;
}> = {
  PENDING: {
    label: 'Pending',
    color: 'text-[var(--text-body)]',
    bgColor: 'bg-[var(--surface-sunken)]',
    hoverBgColor: 'hover:bg-[var(--stone-200)]',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    hoverBgColor: 'hover:bg-amber-200',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    hoverBgColor: 'hover:bg-blue-200',
  },
  VERIFIED: {
    label: 'Verified',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    hoverBgColor: 'hover:bg-green-200',
  },
};

interface ActionStatusDropdownProps {
  actionId: string;
  currentStatus: ActionStatus;
  canEdit: boolean;
  onVerifyClick?: () => void;
}

export function ActionStatusDropdown({
  actionId,
  currentStatus,
  canEdit,
  onVerifyClick,
}: ActionStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const updateStatus = useUpdateActionStatus();

  const config = statusConfig[currentStatus];
  const allowedTransitions = VALID_TRANSITIONS[currentStatus];
  const isTerminal = allowedTransitions.length === 0;
  const canTransition = canEdit && !isTerminal;

  const handleStatusChange = async (newStatus: ActionStatus) => {
    // For VERIFIED status, open the verification modal instead
    if (newStatus === 'VERIFIED' && onVerifyClick) {
      setIsOpen(false);
      onVerifyClick();
      return;
    }

    try {
      await updateStatus.mutateAsync({ id: actionId, status: newStatus });
      toast.success(`Status updated to ${statusConfig[newStatus].label}`);
      setIsOpen(false);
    } catch {
      toast.error('Failed to update status');
    }
  };

  // If terminal state or not editable, just show the badge
  if (!canTransition) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${config.bgColor} ${config.color}`}
      >
        {config.label}
        {isTerminal && <Check className="ml-1 h-3 w-3" />}
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        disabled={updateStatus.isPending}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${config.bgColor} ${config.color} ${config.hoverBgColor} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--brand)]`}
      >
        {updateStatus.isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : null}
        {config.label}
        <ChevronDown className="h-3 w-3" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute left-0 top-full mt-1 z-20 bg-[var(--surface-card)] rounded-md shadow-[var(--shadow-lg)] border border-[var(--border-subtle)] py-1 min-w-[160px]">
            <div className="px-3 py-1.5 border-b border-[var(--border-subtle)]">
              <p className="text-xs text-[var(--text-muted)]">Change status to:</p>
            </div>

            {allowedTransitions.map((status) => {
              const targetConfig = statusConfig[status];
              return (
                <button
                  key={status}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(status);
                  }}
                  disabled={updateStatus.isPending}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--surface-sunken)] disabled:opacity-50"
                >
                  <ArrowRight className="h-3 w-3 text-[var(--text-subtle)]" />
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${targetConfig.bgColor} ${targetConfig.color}`}
                  >
                    {targetConfig.label}
                  </span>
                </button>
              );
            })}

            {allowedTransitions.length === 0 && (
              <div className="px-3 py-2 text-xs text-[var(--text-muted)]">
                No transitions available
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

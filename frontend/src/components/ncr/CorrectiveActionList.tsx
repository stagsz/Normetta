'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useCorrectiveActionsByNCR,
  CorrectiveAction,
} from '@/hooks/useCorrectiveActions';
import { ActionStatusDropdown } from './ActionStatusDropdown';

const statusColors: Record<string, string> = {
  PENDING: 'bg-[var(--surface-sunken)] text-[var(--text-body)]',
  IN_PROGRESS: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-blue-50 text-blue-700',
  VERIFIED: 'bg-green-50 text-green-700',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  VERIFIED: 'Verified',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-[var(--surface-sunken)] text-[var(--text-muted)]',
  MEDIUM: 'bg-amber-50 text-amber-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-50 text-red-700',
};

interface CorrectiveActionListProps {
  ncrId: string;
  ncrStatus: string;
  canEdit: boolean;
  onAddAction: () => void;
  onVerifyAction?: (action: CorrectiveAction) => void;
}

function ActionRow({ action, isExpanded, onToggle, canEdit, onVerifyClick }: {
  action: CorrectiveAction;
  isExpanded: boolean;
  onToggle: () => void;
  canEdit: boolean;
  onVerifyClick: (action: CorrectiveAction) => void;
}) {
  const isOverdue = action.targetDate &&
    new Date(action.targetDate) < new Date() &&
    action.status !== 'COMPLETED' &&
    action.status !== 'VERIFIED';

  return (
    <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
      {/* Main Row */}
      <div
        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--surface-sunken)] ${
          isExpanded ? 'bg-[var(--surface-sunken)]' : ''
        }`}
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0 pr-4">
          <p className="font-medium text-[var(--text-strong)] truncate">{action.description}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm">
            {/* Status Dropdown */}
            <ActionStatusDropdown
              actionId={action.id}
              currentStatus={action.status}
              canEdit={canEdit}
              onVerifyClick={() => onVerifyClick(action)}
            />

            {/* Priority Badge */}
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                priorityColors[action.priority] || 'bg-[var(--surface-sunken)] text-[var(--text-body)]'
              }`}
            >
              {action.priority}
            </span>

            {/* Assignee */}
            {action.assignedTo && (
              <span className="flex items-center gap-1 text-[var(--text-muted)]">
                <User className="h-3 w-3" />
                {action.assignedTo.firstName} {action.assignedTo.lastName}
              </span>
            )}

            {/* Target Date */}
            {action.targetDate && (
              <span
                className={`flex items-center gap-1 ${
                  isOverdue ? 'text-red-600 font-medium' : 'text-[var(--text-muted)]'
                }`}
              >
                <Calendar className="h-3 w-3" />
                {format(new Date(action.targetDate), 'MMM d, yyyy')}
                {isOverdue && (
                  <span className="text-xs">(Overdue)</span>
                )}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-[var(--text-subtle)]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[var(--text-subtle)]" />
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-[var(--border-subtle)] bg-[var(--surface-sunken)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[var(--text-muted)] font-medium mb-1">Description</p>
              <p className="text-[var(--text-body)]">{action.description}</p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[var(--text-muted)] font-medium mb-1">Status</p>
                <ActionStatusDropdown
                  actionId={action.id}
                  currentStatus={action.status}
                  canEdit={canEdit}
                  onVerifyClick={() => onVerifyClick(action)}
                />
              </div>

              <div>
                <p className="text-[var(--text-muted)] font-medium mb-1">Priority</p>
                <span
                  className={`inline-flex px-2 py-1 rounded text-sm font-medium ${
                    priorityColors[action.priority] || 'bg-[var(--surface-sunken)] text-[var(--text-body)]'
                  }`}
                >
                  {action.priority}
                </span>
              </div>

              {canEdit && action.status === 'COMPLETED' && (
                <div>
                  <Button
                    size="sm"
                    onClick={() => onVerifyClick(action)}
                    className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                  >
                    Verify Corrective Action
                  </Button>
                </div>
              )}
            </div>

            {action.assignedTo && (
              <div>
                <p className="text-[var(--text-muted)] font-medium mb-1">Assigned To</p>
                <p className="text-[var(--text-body)]">
                  {action.assignedTo.firstName} {action.assignedTo.lastName}
                </p>
                <p className="text-[var(--text-muted)] text-xs">{action.assignedTo.email}</p>
              </div>
            )}

            {action.targetDate && (
              <div>
                <p className="text-[var(--text-muted)] font-medium mb-1">Target Date</p>
                <p className={isOverdue ? 'text-red-600 font-medium' : 'text-[var(--text-body)]'}>
                  {format(new Date(action.targetDate), 'MMMM d, yyyy')}
                  {isOverdue && ' (Overdue)'}
                </p>
              </div>
            )}

            {action.completedDate && (
              <div>
                <p className="text-[var(--text-muted)] font-medium mb-1">Completed Date</p>
                <p className="text-[var(--text-body)]">
                  {format(new Date(action.completedDate), 'MMMM d, yyyy')}
                </p>
              </div>
            )}

            {action.verifiedBy && (
              <div>
                <p className="text-[var(--text-muted)] font-medium mb-1">Verified By</p>
                <p className="text-[var(--text-body)]">
                  {action.verifiedBy.firstName} {action.verifiedBy.lastName}
                </p>
                {action.verifiedDate && (
                  <p className="text-[var(--text-muted)] text-xs">
                    on {format(new Date(action.verifiedDate), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            )}

            {action.effectivenessNotes && (
              <div className="md:col-span-2">
                <p className="text-[var(--text-muted)] font-medium mb-1">Effectiveness Notes</p>
                <p className="text-[var(--text-body)]">{action.effectivenessNotes}</p>
              </div>
            )}

            <div className="text-xs text-[var(--text-subtle)] md:col-span-2">
              Created: {format(new Date(action.createdAt), 'MMM d, yyyy')} |
              Updated: {format(new Date(action.updatedAt), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-[var(--border-subtle)] rounded-xl p-4">
          <Skeleton width="60%" height={20} className="mb-2" />
          <div className="flex gap-2">
            <Skeleton width={80} height={20} />
            <Skeleton width={60} height={20} />
            <Skeleton width={120} height={20} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ canEdit, onAddAction, ncrStatus }: {
  canEdit: boolean;
  onAddAction: () => void;
  ncrStatus: string;
}) {
  const isClosed = ncrStatus === 'CLOSED';

  return (
    <div className="text-center py-8">
      <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--text-subtle)] mb-3" />
      <p className="text-[var(--text-muted)] font-medium">No corrective actions yet</p>
      <p className="text-[var(--text-subtle)] text-sm mt-1">
        {isClosed
          ? 'This non-conformity is closed.'
          : 'Add corrective actions to address this non-conformity.'
        }
      </p>
      {canEdit && !isClosed && (
        <Button onClick={onAddAction} className="mt-4">
          <Plus className="h-4 w-4 mr-2" />
          Add Corrective Action
        </Button>
      )}
    </div>
  );
}

export function CorrectiveActionList({
  ncrId,
  ncrStatus,
  canEdit,
  onAddAction,
  onVerifyAction,
}: CorrectiveActionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useCorrectiveActionsByNCR(ncrId);

  const actions = data?.data || [];
  const isClosed = ncrStatus === 'CLOSED';

  const handleToggle = (actionId: string) => {
    setExpandedId(expandedId === actionId ? null : actionId);
  };

  const handleVerifyClick = (action: CorrectiveAction) => {
    if (onVerifyAction) {
      onVerifyAction(action);
    }
  };

  // Summary statistics
  const stats = {
    total: actions.length,
    pending: actions.filter((a) => a.status === 'PENDING').length,
    inProgress: actions.filter((a) => a.status === 'IN_PROGRESS').length,
    completed: actions.filter((a) => a.status === 'COMPLETED').length,
    verified: actions.filter((a) => a.status === 'VERIFIED').length,
    overdue: actions.filter(
      (a) =>
        a.targetDate &&
        new Date(a.targetDate) < new Date() &&
        a.status !== 'COMPLETED' &&
        a.status !== 'VERIFIED'
    ).length,
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-[var(--brand-strong)]" />
          Corrective Actions ({stats.total})
        </CardTitle>
        {canEdit && !isClosed && actions.length > 0 && (
          <Button onClick={onAddAction} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Action
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-[var(--text-subtle)]" />
              <span className="text-[var(--text-muted)]">
                {stats.pending} pending, {stats.inProgress} in progress
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              <span className="text-[var(--text-muted)]">
                {stats.completed} completed, {stats.verified} verified
              </span>
            </div>
            {stats.overdue > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-600 font-medium">
                  {stats.overdue} overdue
                </span>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && <ActionListSkeleton />}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-3" />
            <p className="text-[var(--text-muted)] font-medium">Failed to load corrective actions</p>
            <Button onClick={() => refetch()} variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && actions.length === 0 && (
          <EmptyState
            canEdit={canEdit}
            onAddAction={onAddAction}
            ncrStatus={ncrStatus}
          />
        )}

        {/* Actions List */}
        {!isLoading && !isError && actions.length > 0 && (
          <div className="space-y-3">
            {actions.map((action) => (
              <ActionRow
                key={action.id}
                action={action}
                isExpanded={expandedId === action.id}
                onToggle={() => handleToggle(action.id)}
                canEdit={canEdit && !isClosed}
                onVerifyClick={handleVerifyClick}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

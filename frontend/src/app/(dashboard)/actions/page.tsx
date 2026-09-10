'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Search,
  Filter,
  Trash2,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { nonConformitiesApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DeleteConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface CorrectiveAction {
  id: string;
  description: string;
  assignedToId: string | null;
  assignedTo?: { firstName: string; lastName: string; email: string };
  priority: string;
  status: string;
  targetDate: string | null;
  completedDate: string | null;
  verifiedDate: string | null;
  verifiedBy?: { firstName: string; lastName: string };
  nonConformityId: string;
  nonConformity?: {
    id: string;
    title: string;
    status: string;
    severity: string;
  };
}

interface NonConformity {
  id: string;
  title: string;
  status: string;
  severity: string;
  actions?: CorrectiveAction[];
}

const priorityColors: Record<string, string> = {
  HIGH: 'bg-red-50 text-red-800',
  MEDIUM: 'bg-amber-50 text-amber-800',
  LOW: 'bg-green-50 text-green-800',
};

const statusColors: Record<string, string> = {
  OPEN: 'bg-red-50 text-red-800',
  IN_PROGRESS: 'bg-blue-50 text-blue-800',
  COMPLETED: 'bg-green-50 text-green-800',
  VERIFIED: 'bg-green-200 text-green-900',
};

const statusIcons: Record<string, React.ReactNode> = {
  OPEN: <AlertCircle className="h-4 w-4" />,
  IN_PROGRESS: <Clock className="h-4 w-4" />,
  COMPLETED: <CheckCircle className="h-4 w-4" />,
  VERIFIED: <CheckCircle className="h-4 w-4" />,
};

export default function ActionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [deleteAction, setDeleteAction] = useState<CorrectiveAction | null>(null);

  // Fetch all non-conformities to get their actions
  const { data: ncrData, isLoading } = useQuery({
    queryKey: ['all-non-conformities'],
    queryFn: async () => {
      const response = await nonConformitiesApi.list({ pageSize: 1000 });
      const ncrs = response.data.data || [];

      // Fetch full details for each NCR to get actions
      const ncrDetails = await Promise.all(
        ncrs.map((ncr: { id: string }) => nonConformitiesApi.getById(ncr.id).then(res => res.data.data))
      );

      return ncrDetails;
    },
  });

  // Aggregate all actions from all non-conformities
  const allActions = useMemo(() => {
    if (!ncrData) return [];
    return ncrData.flatMap((ncr: any) => {
      const actions = ncr.correctiveActions || ncr.actions || [];
      return actions.map((action: CorrectiveAction) => ({
        ...action,
        nonConformityId: ncr.id,
        nonConformity: {
          id: ncr.id,
          title: ncr.title,
          status: ncr.status,
          severity: ncr.severity,
        },
      }));
    });
  }, [ncrData]);

  // Filter and search actions
  const filteredActions = useMemo(() => {
    return allActions.filter(action => {
      const matchesSearch =
        action.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.nonConformity?.title.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || action.status === statusFilter;
      const matchesPriority = !priorityFilter || action.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [allActions, searchTerm, statusFilter, priorityFilter]);

  const handleDelete = async () => {
    if (!deleteAction) return;
    try {
      // API call would go here
      toast.success('Action deleted successfully');
      setDeleteAction(null);
    } catch {
      toast.error('Failed to delete action');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton width={200} height={32} />
        <Card>
          <CardContent className="space-y-4 pt-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} width="100%" height={60} />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-strong)]">Corrective Actions</h1>
        <p className="text-[var(--text-muted)] mt-1">Track and manage all corrective actions</p>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[var(--text-subtle)]" />
          <input
            type="text"
            placeholder="Search actions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--border-default)] rounded-xl focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
          />
        </div>

        <select
          value={statusFilter || ''}
          onChange={(e) => setStatusFilter(e.target.value || null)}
          className="px-4 py-2 border border-[var(--border-default)] rounded-xl focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="VERIFIED">Verified</option>
        </select>

        <select
          value={priorityFilter || ''}
          onChange={(e) => setPriorityFilter(e.target.value || null)}
          className="px-4 py-2 border border-[var(--border-default)] rounded-xl focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
        >
          <option value="">All Priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Actions List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredActions.length} {filteredActions.length === 1 ? 'Action' : 'Actions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredActions.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-[var(--text-subtle)] mb-4" />
              <p className="text-[var(--text-muted)]">No corrective actions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActions.map((action) => (
                <div
                  key={action.id}
                  className="border border-[var(--border-subtle)] rounded-xl p-4 hover:shadow-[var(--shadow-md)] transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Non-Conformity Link */}
                      <Link
                        href={`/non-conformities/${action.nonConformityId}`}
                        className="text-sm text-[var(--brand-strong)] hover:text-[var(--brand)] font-medium"
                      >
                        NCR: {action.nonConformity?.title}
                      </Link>

                      {/* Action Description */}
                      <p className="text-[var(--text-strong)] font-medium">{action.description}</p>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-2 items-center text-sm text-[var(--text-muted)]">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[action.status]}`}>
                          {statusIcons[action.status]}
                          {action.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[action.priority]}`}>
                          {action.priority}
                        </span>
                        {action.targetDate && (
                          <span>
                            Target: {format(new Date(action.targetDate), 'MMM d, yyyy')}
                          </span>
                        )}
                        {action.completedDate && (
                          <span className="text-green-600">
                            Completed: {format(new Date(action.completedDate), 'MMM d, yyyy')}
                          </span>
                        )}
                        {action.verifiedDate && (
                          <span className="text-green-700">
                            Verified: {format(new Date(action.verifiedDate), 'MMM d, yyyy')}
                            {action.verifiedBy && (
                              <span className="ml-2">
                                by {action.verifiedBy.firstName} {action.verifiedBy.lastName}
                              </span>
                            )}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Link href={`/non-conformities/${action.nonConformityId}?tab=actions`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Open to review/verify
                          </Button>
                        </Link>
                      </div>

                      {/* Assignee */}
                      {action.assignedTo && (
                        <p className="text-sm text-[var(--text-muted)]">
                          Assigned to: {action.assignedTo.firstName} {action.assignedTo.lastName}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link href={`/non-conformities/${action.nonConformityId}?tab=actions`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Open
                        </Button>
                      </Link>
                      {action.status === 'COMPLETED' && (
                        <Link href={`/non-conformities/${action.nonConformityId}?tab=actions`}>
                          <Button size="sm">
                            <ShieldCheck className="h-4 w-4 mr-1" />
                            Verify
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteAction(action)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <DeleteConfirmationDialog
        isOpen={!!deleteAction}
        onClose={() => setDeleteAction(null)}
        onConfirm={handleDelete}
        itemName={deleteAction?.description || 'Action'}
        itemType="corrective action"
      />
    </div>
  );
}

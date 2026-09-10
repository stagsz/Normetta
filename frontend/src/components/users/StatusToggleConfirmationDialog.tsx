'use client';

import { useState } from 'react';
import { X, AlertTriangle, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToggleUserActive, User } from '@/hooks/useUsers';
import { toast } from 'sonner';

interface StatusToggleConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function StatusToggleConfirmationDialog({
  isOpen,
  onClose,
  user,
}: StatusToggleConfirmationDialogProps) {
  const [confirmed, setConfirmed] = useState(false);
  const toggleActive = useToggleUserActive();
  const isSubmitting = toggleActive.isPending;

  const resetForm = () => {
    setConfirmed(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('No user selected');
      return;
    }

    if (!confirmed) {
      toast.error('Please confirm that you want to proceed');
      return;
    }

    try {
      await toggleActive.mutateAsync(user.id);
      const newStatus = user.isActive ? 'deactivated' : 'activated';
      toast.success(`User ${newStatus} successfully`);
      handleClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
            'Failed to toggle user status';
      toast.error(message);
    }
  };

  if (!isOpen || !user) return null;

  const isDeactivating = user.isActive;
  const actionVerb = isDeactivating ? 'Deactivate' : 'Activate';
  const actionVerbLower = isDeactivating ? 'deactivate' : 'activate';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            {isDeactivating ? (
              <UserX className="h-5 w-5 text-red-600" />
            ) : (
              <UserCheck className="h-5 w-5 text-green-600" />
            )}
            {actionVerb} User
          </CardTitle>
          <button
            type="button"
            onClick={handleClose}
            className="text-[var(--text-subtle)] hover:text-[var(--text-muted)] transition-colors"
            disabled={isSubmitting}
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* User Info */}
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="h-12 w-12 rounded-full bg-[var(--brand-soft)] flex items-center justify-center">
                <span className="text-lg font-medium text-[var(--brand-strong)]">
                  {user.firstName?.[0]?.toUpperCase() || ''}
                  {user.lastName?.[0]?.toUpperCase() || ''}
                </span>
              </div>
              <div>
                <p className="font-medium text-[var(--text-strong)]">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
              </div>
            </div>

            {/* Current Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-muted)]">Current status:</span>
              {user.isActive ? (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                  <UserCheck className="h-4 w-4" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--text-muted)] bg-[var(--surface-sunken)] px-2 py-0.5 rounded">
                  <UserX className="h-4 w-4" />
                  Inactive
                </span>
              )}
            </div>

            {/* Warning */}
            <div
              className={`rounded-xl p-4 border ${
                isDeactivating
                  ? 'bg-red-50 border-red-200'
                  : 'bg-green-50 border-green-200'
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle
                  className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                    isDeactivating ? 'text-red-600' : 'text-green-600'
                  }`}
                />
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isDeactivating ? 'text-red-800' : 'text-green-800'
                    }`}
                  >
                    {isDeactivating ? 'Account Deactivation' : 'Account Activation'}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      isDeactivating ? 'text-red-700' : 'text-green-700'
                    }`}
                  >
                    {isDeactivating
                      ? 'This user will no longer be able to log in or access the system. Their data will be preserved.'
                      : 'This user will be able to log in and access the system according to their role permissions.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Confirmation Checkbox */}
            <div className="bg-[var(--surface-sunken)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[var(--border-default)] text-[var(--brand-strong)] focus:ring-[var(--brand)]"
                  disabled={isSubmitting}
                />
                <div>
                  <p className="text-sm font-medium text-[var(--text-strong)]">
                    Are you sure you want to {actionVerbLower} this user?
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {isDeactivating
                      ? 'I understand that this user will be unable to access the system until reactivated.'
                      : 'I understand that this user will regain access to the system with their assigned role permissions.'}
                  </p>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={isDeactivating ? 'destructive' : 'success'}
                loading={isSubmitting}
                disabled={!confirmed}
              >
                {actionVerb} User
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

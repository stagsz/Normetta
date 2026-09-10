'use client';

import { useState } from 'react';
import { X, AlertTriangle, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { useChangeUserRole, User } from '@/hooks/useUsers';
import { toast } from 'sonner';

const roleLabels: Record<string, string> = {
  SYSTEM_ADMIN: 'System Admin',
  QUALITY_MANAGER: 'Quality Manager',
  INTERNAL_AUDITOR: 'Internal Auditor',
  DEPARTMENT_HEAD: 'Department Head',
  VIEWER: 'Viewer',
};

const roleColors: Record<string, string> = {
  SYSTEM_ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
  QUALITY_MANAGER: 'bg-blue-50 text-blue-700 border-blue-200',
  INTERNAL_AUDITOR: 'bg-green-50 text-green-700 border-green-200',
  DEPARTMENT_HEAD: 'bg-orange-100 text-orange-700 border-orange-200',
  VIEWER: 'bg-[var(--surface-sunken)] text-[var(--text-body)] border-[var(--border-subtle)]',
};

const roleDescriptions: Record<string, string> = {
  SYSTEM_ADMIN: 'Full access to all features including user management, system settings, and all assessments',
  QUALITY_MANAGER: 'Manage assessments, reports, auditor assignments, and view user information',
  INTERNAL_AUDITOR: 'Conduct assessments, document findings, and manage non-conformities',
  DEPARTMENT_HEAD: 'View assigned sections, respond to findings, and track corrective actions',
  VIEWER: 'Read-only access to assessments and reports',
};

const roleOptions = [
  { value: 'SYSTEM_ADMIN', label: 'System Admin' },
  { value: 'QUALITY_MANAGER', label: 'Quality Manager' },
  { value: 'INTERNAL_AUDITOR', label: 'Internal Auditor' },
  { value: 'DEPARTMENT_HEAD', label: 'Department Head' },
  { value: 'VIEWER', label: 'Viewer' },
];

interface RoleChangeConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function RoleChangeConfirmationDialog({
  isOpen,
  onClose,
  user,
}: RoleChangeConfirmationDialogProps) {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [confirmed, setConfirmed] = useState(false);
  const changeRole = useChangeUserRole();
  const isSubmitting = changeRole.isPending;

  // Reset form when modal opens with new user
  const resetForm = () => {
    setSelectedRole('');
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

    if (!selectedRole) {
      toast.error('Please select a new role');
      return;
    }

    if (!confirmed) {
      toast.error('Please confirm that you understand the permission changes');
      return;
    }

    try {
      await changeRole.mutateAsync({
        userId: user.id,
        role: selectedRole,
      });
      toast.success(`Role changed to ${roleLabels[selectedRole]} successfully`);
      handleClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
            'Failed to change user role';
      toast.error(message);
    }
  };

  if (!isOpen || !user) return null;

  const currentRole = user.role;
  const currentRoleLabel = roleLabels[currentRole] || currentRole;
  const newRoleLabel = selectedRole ? roleLabels[selectedRole] : '';
  const isRoleSelected = !!selectedRole && selectedRole !== currentRole;

  // Filter out current role from options
  const availableRoleOptions = roleOptions.filter((opt) => opt.value !== currentRole);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-600" />
            Change User Role
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

            {/* Role Comparison */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[var(--text-body)]">
                Role Change
              </label>
              <div className="flex items-center gap-3">
                {/* Current Role */}
                <div className="flex-1">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Current Role</p>
                  <div
                    className={`px-3 py-2 rounded-xl border text-sm font-medium ${roleColors[currentRole]}`}
                  >
                    {currentRoleLabel}
                  </div>
                </div>

                <ArrowRight className="h-5 w-5 text-[var(--text-subtle)] flex-shrink-0 mt-5" />

                {/* New Role Selection */}
                <div className="flex-1">
                  <p className="text-xs text-[var(--text-muted)] mb-1">New Role</p>
                  <Select
                    value={selectedRole}
                    onChange={(e) => {
                      setSelectedRole(e.target.value);
                      setConfirmed(false);
                    }}
                    options={availableRoleOptions}
                    placeholder="Select role"
                    disabled={isSubmitting}
                    aria-label="Select new role"
                  />
                </div>
              </div>
            </div>

            {/* Permission Changes Warning */}
            {isRoleSelected && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Permission Changes
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      Changing from <span className="font-medium">{currentRoleLabel}</span> to{' '}
                      <span className="font-medium">{newRoleLabel}</span> will modify this
                      user&apos;s access permissions.
                    </p>
                    {selectedRole && (
                      <p className="text-xs text-amber-600 mt-2 italic">
                        {roleDescriptions[selectedRole]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Checkbox */}
            {isRoleSelected && (
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
                      Are you sure you want to change this user&apos;s role?
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      I understand that this will change the user&apos;s access permissions and may
                      affect their ability to perform certain actions in the system.
                    </p>
                  </div>
                </label>
              </div>
            )}

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
                loading={isSubmitting}
                disabled={!isRoleSelected || !confirmed}
              >
                Change Role
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVerifyAction, CorrectiveAction } from '@/hooks/useCorrectiveActions';
import { toast } from 'sonner';

interface VerificationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: CorrectiveAction | null;
}

export function VerificationFormModal({
  isOpen,
  onClose,
  action,
}: VerificationFormModalProps) {
  const [effectivenessNotes, setEffectivenessNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const verifyAction = useVerifyAction();

  const isSubmitting = verifyAction.isPending;

  // Reset form when modal opens with new action
  const handleOpen = () => {
    setEffectivenessNotes('');
    setConfirmed(false);
  };

  // Reset when action changes (new modal open)
  if (isOpen && action && effectivenessNotes === '' && !confirmed) {
    // Already at initial state, no reset needed
  }

  const handleClose = () => {
    setEffectivenessNotes('');
    setConfirmed(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!action) {
      toast.error('No action selected for verification');
      return;
    }

    if (!confirmed) {
      toast.error('Please confirm that you have verified the action effectiveness');
      return;
    }

    try {
      await verifyAction.mutateAsync({
        id: action.id,
        effectivenessNotes: effectivenessNotes.trim() || undefined,
      });
      toast.success('Corrective action verified successfully');
      handleClose();
    } catch {
      toast.error('Failed to verify corrective action');
    }
  };

  if (!isOpen || !action) return null;

  // Only allow verification of completed actions
  if (action.status !== 'COMPLETED') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Cannot Verify Action
            </CardTitle>
            <button
              type="button"
              onClick={handleClose}
              className="text-[var(--text-subtle)] hover:text-[var(--text-muted)] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--text-muted)] mb-4">
              Only completed actions can be verified. This action is currently{' '}
              <span className="font-medium">{action.status.replace('_', ' ').toLowerCase()}</span>.
            </p>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Please ensure the corrective action has been marked as completed before attempting verification.
            </p>
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Verify Corrective Action
          </CardTitle>
          <button
            type="button"
            onClick={handleClose}
            className="text-[var(--text-subtle)] hover:text-[var(--text-muted)] transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Action Summary */}
            <div className="bg-[var(--surface-sunken)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-sm font-medium text-[var(--text-muted)] mb-1">Action to Verify</p>
              <p className="text-[var(--text-strong)]">{action.description}</p>
              {action.assignedTo && (
                <p className="text-sm text-[var(--text-muted)] mt-2">
                  Assigned to: {action.assignedTo.firstName} {action.assignedTo.lastName}
                </p>
              )}
            </div>

            {/* Effectiveness Notes */}
            <div>
              <label
                htmlFor="effectivenessNotes"
                className="block text-sm font-medium text-[var(--text-body)] mb-1"
              >
                Effectiveness Notes
                <span className="text-[var(--text-subtle)] font-normal ml-1">(recommended)</span>
              </label>
              <textarea
                id="effectivenessNotes"
                value={effectivenessNotes}
                onChange={(e) => setEffectivenessNotes(e.target.value)}
                rows={4}
                placeholder="Document how you verified the effectiveness of this corrective action. Include any follow-up observations, testing results, or evidence of improvement..."
                className="w-full rounded-md border border-[var(--border-default)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent resize-none"
                disabled={isSubmitting}
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Describe how the corrective action addressed the non-conformity and prevented recurrence.
              </p>
            </div>

            {/* Verification Confirmation Checkbox */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[var(--border-default)] text-green-600 focus:ring-green-500"
                  disabled={isSubmitting}
                />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    I confirm that this corrective action has been verified
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    By checking this box, you confirm that:
                  </p>
                  <ul className="text-xs text-green-700 mt-1 list-disc list-inside space-y-0.5">
                    <li>The corrective action has been implemented as described</li>
                    <li>The effectiveness has been evaluated</li>
                    <li>The non-conformity root cause has been addressed</li>
                  </ul>
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
                loading={isSubmitting}
                disabled={!confirmed}
                className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Verify Action
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

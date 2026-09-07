'use client';

import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { X, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';

export type ConfirmationDialogVariant = 'destructive' | 'warning' | 'info' | 'success';

const variantConfig: Record<
  ConfirmationDialogVariant,
  {
    icon: typeof AlertCircle;
    iconColor: string;
    confirmButtonVariant: 'destructive' | 'warning' | 'default' | 'success';
    headerBgColor: string;
  }
> = {
  destructive: {
    icon: AlertCircle,
    iconColor: 'text-red-600',
    confirmButtonVariant: 'destructive',
    headerBgColor: 'bg-red-50',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    confirmButtonVariant: 'warning',
    headerBgColor: 'bg-amber-50',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    confirmButtonVariant: 'default',
    headerBgColor: 'bg-blue-50',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-600',
    confirmButtonVariant: 'success',
    headerBgColor: 'bg-green-50',
  },
};

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationDialogVariant;
  isLoading?: boolean;
  children?: ReactNode;
  maxWidth?: string;
  preventCloseOnLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'destructive',
  isLoading = false,
  children,
  maxWidth = 'max-w-md',
  preventCloseOnLoading = true,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleClose = () => {
    if (preventCloseOnLoading && isLoading) return;
    onClose();
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-dialog-title"
    >
      <Card className={clsx('w-full shadow-xl animate-enter', maxWidth)}>
        <CardHeader
          className={clsx(
            'flex flex-row items-center justify-between space-y-0 rounded-t-2xl',
            config.headerBgColor
          )}
        >
          <CardTitle
            id="confirmation-dialog-title"
            className={clsx('flex items-center gap-2', config.iconColor)}
          >
            <Icon className="h-5 w-5" />
            {title}
          </CardTitle>
          <button
            type="button"
            onClick={handleClose}
            className="text-[var(--text-subtle)] hover:text-[var(--text-muted)] transition-colors rounded-lg p-1 hover:bg-[var(--surface-sunken)]"
            disabled={preventCloseOnLoading && isLoading}
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="text-[var(--text-muted)] leading-relaxed">
            {typeof description === 'string' ? <p>{description}</p> : description}
          </div>

          {children}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={preventCloseOnLoading && isLoading}
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant={config.confirmButtonVariant}
              onClick={handleConfirm}
              loading={isLoading}
            >
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  itemName: string;
  itemType?: string;
  isLoading?: boolean;
  warningMessage?: string;
  canBeUndone?: boolean;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'item',
  isLoading = false,
  warningMessage,
  canBeUndone = false,
}: DeleteConfirmationDialogProps) {
  const defaultMessage = canBeUndone
    ? `Are you sure you want to delete "${itemName}"? This ${itemType} can be restored by an administrator.`
    : `Are you sure you want to delete "${itemName}"? This action cannot be undone.`;

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`}
      description={warningMessage || defaultMessage}
      confirmText="Delete"
      variant="destructive"
      isLoading={isLoading}
    />
  );
}

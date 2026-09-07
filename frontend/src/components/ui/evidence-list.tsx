'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import {
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
  Download,
  Trash2,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Button } from './button';
import { DeleteConfirmationDialog } from './confirmation-dialog';

export interface EvidenceItem {
  id: string;
  type: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  uploadedAt: string;
  uploadedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface EvidenceListProps {
  evidence: EvidenceItem[];
  onDownload: (evidenceId: string) => Promise<void>;
  onDelete?: (evidenceId: string) => Promise<void>;
  onPreview?: (evidenceId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getFileIcon(mimeType: string, fileName: string) {
  // Check by MIME type first
  if (mimeType.startsWith('image/')) {
    return <ImageIcon className="h-5 w-5 text-purple-500" />;
  }

  if (mimeType === 'application/pdf') {
    return <FileText className="h-5 w-5 text-red-500" />;
  }

  if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return <FileText className="h-5 w-5 text-blue-500" />;
  }

  if (
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
  }

  // Fall back to file extension
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-500" />;
    case 'doc':
    case 'docx':
      return <FileText className="h-5 w-5 text-blue-500" />;
    case 'xls':
    case 'xlsx':
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return <ImageIcon className="h-5 w-5 text-purple-500" />;
    default:
      return <File className="h-5 w-5 text-[var(--text-muted)]" />;
  }
}

function getFileTypeLabel(mimeType: string, fileName: string): string {
  if (mimeType.startsWith('image/')) {
    return 'Image';
  }

  if (mimeType === 'application/pdf') {
    return 'PDF';
  }

  if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'Word Document';
  }

  if (
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return 'Excel Spreadsheet';
  }

  const ext = fileName.split('.').pop()?.toUpperCase();
  return ext ? `${ext} File` : 'File';
}

export function EvidenceList({
  evidence,
  onDownload,
  onDelete,
  onPreview,
  isLoading = false,
  disabled = false,
  className,
}: EvidenceListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDownload = async (evidenceId: string) => {
    setDownloadingId(evidenceId);
    try {
      await onDownload(evidenceId);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (evidenceId: string) => {
    if (!onDelete) return;

    setDeletingId(evidenceId);
    try {
      await onDelete(evidenceId);
      setShowDeleteConfirm(null);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className={clsx('space-y-2', className)}>
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-sunken)] animate-pulse"
          >
            <div className="h-10 w-10 bg-[var(--stone-200)] rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[var(--stone-200)] rounded w-1/3" />
              <div className="h-3 bg-[var(--stone-200)] rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (evidence.length === 0) {
    return (
      <div className={clsx('text-center py-6', className)}>
        <File className="mx-auto h-8 w-8 text-[var(--text-subtle)]" />
        <p className="mt-2 text-sm text-[var(--text-muted)]">No evidence uploaded</p>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-2', className)}>
      {evidence.map((item) => (
        <div
          key={item.id}
          className={clsx(
            'flex items-center gap-3 p-3 rounded-xl border bg-[var(--surface-card)] transition-colors',
            disabled
              ? 'border-[var(--border-subtle)] opacity-60'
              : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
          )}
        >
          {/* File Icon */}
          <div className="flex-shrink-0 p-2 bg-[var(--surface-sunken)] rounded">
            {getFileIcon(item.mimeType, item.fileName)}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-strong)] truncate">
              {item.fileName}
            </p>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>{getFileTypeLabel(item.mimeType, item.fileName)}</span>
              <span>•</span>
              <span>{formatFileSize(item.fileSize)}</span>
              <span>•</span>
              <span>{formatDate(item.uploadedAt)}</span>
            </div>
            {item.description && (
              <p className="text-xs text-[var(--text-muted)] mt-1 truncate">
                {item.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {onPreview && item.mimeType.startsWith('image/') && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onPreview(item.id)}
                disabled={disabled}
                className="h-8 w-8"
                title="Preview"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">Preview</span>
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleDownload(item.id)}
              disabled={disabled || downloadingId === item.id}
              className="h-8 w-8"
              title="Download"
            >
              {downloadingId === item.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="sr-only">Download</span>
            </Button>

            {onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteConfirm(item.id)}
                disabled={disabled || deletingId === item.id}
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete"
              >
                {deletingId === item.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span className="sr-only">Delete</span>
              </Button>
            )}
          </div>
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationDialog
        isOpen={showDeleteConfirm !== null}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => { if (showDeleteConfirm) handleDelete(showDeleteConfirm); }}
        itemName={
          showDeleteConfirm
            ? evidence.find((e) => e.id === showDeleteConfirm)?.fileName || 'this file'
            : ''
        }
        itemType="evidence"
        isLoading={deletingId === showDeleteConfirm}
        canBeUndone={false}
      />
    </div>
  );
}

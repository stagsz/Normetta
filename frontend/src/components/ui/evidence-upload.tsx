'use client';

import { useCallback, useState } from 'react';
import { clsx } from 'clsx';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { ProgressBar } from './progress-bar';

// Allowed file types matching backend configuration
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/jpg',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
}

interface EvidenceUploadProps {
  responseId: string;
  onUpload: (file: File, onProgress: (progress: number) => void) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFile(file: File): string | null {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds ${formatFileSize(MAX_FILE_SIZE)} limit`;
  }

  // Check file extension
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`;
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return 'Invalid file type. Please upload PDF, Word, Excel, PNG, or JPEG files.';
  }

  return null;
}

export function EvidenceUpload({
  responseId,
  onUpload,
  disabled = false,
  className,
}: EvidenceUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      for (const file of fileArray) {
        const validationError = validateFile(file);

        if (validationError) {
          setUploadingFiles((prev) => [
            ...prev,
            { file, progress: 0, error: validationError },
          ]);
          continue;
        }

        // Add file to uploading list
        setUploadingFiles((prev) => [...prev, { file, progress: 0 }]);

        try {
          await onUpload(file, (progress) => {
            setUploadingFiles((prev) =>
              prev.map((uf) =>
                uf.file === file ? { ...uf, progress } : uf
              )
            );
          });

          // Remove file from list on success (after brief delay to show 100%)
          setTimeout(() => {
            setUploadingFiles((prev) => prev.filter((uf) => uf.file !== file));
          }, 500);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Upload failed';
          setUploadingFiles((prev) =>
            prev.map((uf) =>
              uf.file === file ? { ...uf, error: errorMessage } : uf
            )
          );
        }
      }
    },
    [onUpload]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragActive(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (disabled) return;

      const { files } = e.dataTransfer;
      if (files && files.length > 0) {
        handleFiles(files);
      }
    },
    [disabled, handleFiles]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;
      if (files && files.length > 0) {
        handleFiles(files);
      }
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    },
    [handleFiles]
  );

  const removeUploadingFile = useCallback((file: File) => {
    setUploadingFiles((prev) => prev.filter((uf) => uf.file !== file));
  }, []);

  return (
    <div className={clsx('space-y-3', className)}>
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={clsx(
          'relative border-2 border-dashed rounded-xl p-6 transition-colors text-center',
          disabled
            ? 'border-[var(--border-subtle)] bg-[var(--surface-sunken)] cursor-not-allowed'
            : isDragActive
            ? 'border-[var(--brand)] bg-[var(--brand-soft)]'
            : 'border-[var(--border-default)] bg-[var(--surface-card)] hover:border-[var(--border-strong)]'
        )}
      >
        <input
          type="file"
          id={`evidence-upload-${responseId}`}
          className="sr-only"
          onChange={handleFileInputChange}
          accept={ALLOWED_EXTENSIONS.join(',')}
          multiple
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-2">
          <div
            className={clsx(
              'p-3 rounded-full',
              isDragActive ? 'bg-[var(--brand-soft)]' : 'bg-[var(--surface-sunken)]'
            )}
          >
            <Upload
              className={clsx(
                'h-6 w-6',
                isDragActive ? 'text-[var(--brand-strong)]' : 'text-[var(--text-subtle)]'
              )}
            />
          </div>

          <div className="text-sm">
            <label
              htmlFor={`evidence-upload-${responseId}`}
              className={clsx(
                'font-medium cursor-pointer',
                disabled
                  ? 'text-[var(--text-subtle)] cursor-not-allowed'
                  : 'text-[var(--brand-strong)] hover:text-[var(--brand)]'
              )}
            >
              Click to upload
            </label>
            <span className="text-[var(--text-muted)]"> or drag and drop</span>
          </div>

          <p className="text-xs text-[var(--text-muted)]">
            PDF, Word, Excel, PNG, or JPEG (max {formatFileSize(MAX_FILE_SIZE)})
          </p>
        </div>
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((uploadingFile, index) => (
            <div
              key={`${uploadingFile.file.name}-${index}`}
              className={clsx(
                'flex items-center gap-3 p-3 rounded-xl border',
                uploadingFile.error
                  ? 'bg-red-50 border-red-200'
                  : 'bg-[var(--surface-sunken)] border-[var(--border-subtle)]'
              )}
            >
              <div
                className={clsx(
                  'flex-shrink-0 p-2 rounded',
                  uploadingFile.error ? 'bg-red-50' : 'bg-[var(--surface-card)]'
                )}
              >
                {uploadingFile.error ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <FileText className="h-5 w-5 text-[var(--text-subtle)]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-strong)] truncate">
                  {uploadingFile.file.name}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {formatFileSize(uploadingFile.file.size)}
                </p>

                {uploadingFile.error ? (
                  <p className="text-xs text-red-600 mt-1">
                    {uploadingFile.error}
                  </p>
                ) : (
                  <div className="mt-2">
                    <ProgressBar
                      value={uploadingFile.progress}
                      size="sm"
                      showPercentage={false}
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {uploadingFile.progress < 100
                        ? `Uploading... ${uploadingFile.progress}%`
                        : 'Upload complete'}
                    </p>
                  </div>
                )}
              </div>

              {uploadingFile.error && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeUploadingFile(uploadingFile.file)}
                  className="flex-shrink-0 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES, MAX_FILE_SIZE };

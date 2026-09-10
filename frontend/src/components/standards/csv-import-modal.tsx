'use client';

import { useState, useCallback, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { standardsApi } from '@/lib/api';
import { toast } from 'sonner';

interface ImportError {
  row: number;
  field: string;
  message: string;
  value?: string;
}

interface ImportResult {
  success: boolean;
  sectionsCreated: number;
  sectionsUpdated: number;
  questionsCreated: number;
  questionsUpdated: number;
  errors: ImportError[];
  warnings: string[];
}

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ALLOWED_EXTENSIONS = ['.csv'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds ${formatFileSize(MAX_FILE_SIZE)} limit`;
  }

  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return 'Only CSV files are allowed';
  }

  return null;
}

export function CSVImportModal({ isOpen, onClose, onSuccess }: CSVImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setValidationError(null);
    setIsUploading(false);
    setImportResult(null);
    setIsDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      setSelectedFile(null);
      return;
    }
    setValidationError(null);
    setSelectedFile(file);
    setImportResult(null);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

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

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to import');
      return;
    }

    setIsUploading(true);
    setImportResult(null);

    try {
      const response = await standardsApi.importCSV(selectedFile);
      const result = response.data.data as ImportResult;
      setImportResult(result);

      if (result.success) {
        toast.success(
          `Import successful! Created ${result.questionsCreated} questions, updated ${result.questionsUpdated} questions.`
        );
        onSuccess?.();
      } else {
        toast.error('Import failed. Please check the errors below.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      toast.error(errorMessage);
      setImportResult({
        success: false,
        sectionsCreated: 0,
        sectionsUpdated: 0,
        questionsCreated: 0,
        questionsUpdated: 0,
        errors: [{ row: 0, field: 'file', message: errorMessage }],
        warnings: [],
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setValidationError(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-[var(--brand-strong)]" />
            Import Questions from CSV
          </CardTitle>
          <button
            type="button"
            onClick={handleClose}
            className="text-[var(--text-subtle)] hover:text-[var(--text-muted)] transition-colors"
            disabled={isUploading}
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>

        <CardContent className="space-y-4 overflow-y-auto flex-1">
          {/* CSV Format Info */}
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
            <p className="text-sm text-blue-800 font-medium mb-1">CSV Format Requirements</p>
            <p className="text-xs text-blue-700">
              Required columns: <code className="bg-blue-50 px-1 rounded">standardReference</code>,{' '}
              <code className="bg-blue-50 px-1 rounded">standardText</code>,{' '}
              <code className="bg-blue-50 px-1 rounded">auditQuestion</code>,{' '}
              <code className="bg-blue-50 px-1 rounded">score1Criteria</code>,{' '}
              <code className="bg-blue-50 px-1 rounded">score2Criteria</code>,{' '}
              <code className="bg-blue-50 px-1 rounded">score3Criteria</code>
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Optional: <code className="bg-blue-50 px-1 rounded">guidance</code>
            </p>
          </div>

          {/* File Drop Zone */}
          {!selectedFile && (
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 transition-colors text-center ${
                isDragActive
                  ? 'border-[var(--brand)] bg-[var(--brand-soft)]'
                  : 'border-[var(--border-default)] bg-[var(--surface-card)] hover:border-[var(--border-strong)]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                id="csv-import-input"
                className="sr-only"
                onChange={handleFileInputChange}
                accept=".csv"
                disabled={isUploading}
              />

              <div className="flex flex-col items-center gap-3">
                <div
                  className={`p-3 rounded-full ${
                    isDragActive ? 'bg-[var(--brand-soft)]' : 'bg-[var(--surface-sunken)]'
                  }`}
                >
                  <Upload
                    className={`h-8 w-8 ${
                      isDragActive ? 'text-[var(--brand-strong)]' : 'text-[var(--text-subtle)]'
                    }`}
                  />
                </div>

                <div className="text-sm">
                  <label
                    htmlFor="csv-import-input"
                    className="font-medium text-[var(--brand-strong)] hover:text-[var(--brand)] cursor-pointer"
                  >
                    Click to upload
                  </label>
                  <span className="text-[var(--text-muted)]"> or drag and drop</span>
                </div>

                <p className="text-xs text-[var(--text-muted)]">
                  CSV files only (max {formatFileSize(MAX_FILE_SIZE)})
                </p>
              </div>
            </div>
          )}

          {/* Validation Error */}
          {validationError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{validationError}</p>
            </div>
          )}

          {/* Selected File */}
          {selectedFile && !importResult && (
            <div className="flex items-center gap-3 p-3 bg-[var(--surface-sunken)] rounded-xl border border-[var(--border-subtle)]">
              <div className="flex-shrink-0 p-2 bg-[var(--surface-card)] rounded">
                <FileText className="h-5 w-5 text-[var(--text-subtle)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-strong)] truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-[var(--text-subtle)] hover:text-red-500 transition-colors"
                disabled={isUploading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="space-y-3">
              {/* Success/Failure Banner */}
              <div
                className={`flex items-center gap-2 p-3 rounded-xl border ${
                  importResult.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                {importResult.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span
                  className={`text-sm font-medium ${
                    importResult.success ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {importResult.success ? 'Import Successful' : 'Import Failed'}
                </span>
              </div>

              {/* Statistics */}
              {importResult.success && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[var(--surface-sunken)] rounded-xl p-2 text-center">
                    <p className="text-lg font-semibold text-[var(--text-strong)]">
                      {importResult.sectionsCreated}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">Sections Created</p>
                  </div>
                  <div className="bg-[var(--surface-sunken)] rounded-xl p-2 text-center">
                    <p className="text-lg font-semibold text-[var(--text-strong)]">
                      {importResult.sectionsUpdated}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">Sections Updated</p>
                  </div>
                  <div className="bg-[var(--surface-sunken)] rounded-xl p-2 text-center">
                    <p className="text-lg font-semibold text-[var(--text-strong)]">
                      {importResult.questionsCreated}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">Questions Created</p>
                  </div>
                  <div className="bg-[var(--surface-sunken)] rounded-xl p-2 text-center">
                    <p className="text-lg font-semibold text-[var(--text-strong)]">
                      {importResult.questionsUpdated}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">Questions Updated</p>
                  </div>
                </div>
              )}

              {/* Errors */}
              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-700 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {importResult.errors.length} Error{importResult.errors.length !== 1 ? 's' : ''}
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {importResult.errors.map((error, index) => (
                      <div
                        key={index}
                        className="text-xs bg-red-50 rounded p-2 border border-red-100"
                      >
                        <span className="font-medium text-red-800">
                          {error.row > 0 ? `Row ${error.row}` : 'File'}
                          {error.field && ` - ${error.field}`}:
                        </span>{' '}
                        <span className="text-red-700">{error.message}</span>
                        {error.value && (
                          <span className="text-red-500 ml-1">
                            (value: &quot;{error.value}&quot;)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {importResult.warnings.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {importResult.warnings.length} Warning{importResult.warnings.length !== 1 ? 's' : ''}
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {importResult.warnings.map((warning, index) => (
                      <div
                        key={index}
                        className="text-xs bg-amber-50 rounded p-2 border border-amber-100 text-amber-700"
                      >
                        {warning}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              {importResult?.success ? 'Close' : 'Cancel'}
            </Button>
            {!importResult?.success && (
              <Button
                type="button"
                onClick={handleImport}
                loading={isUploading}
                disabled={!selectedFile || isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            )}
            {importResult && !importResult.success && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemoveFile}
                disabled={isUploading}
              >
                Try Another File
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

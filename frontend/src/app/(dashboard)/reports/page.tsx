'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { assessmentsApi } from '@/lib/api';
import { Download, FileText, FileSpreadsheet, Presentation, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';
import { SkeletonListItem, SkeletonFilters } from '@/components/ui/skeleton';
import { clsx } from 'clsx';

type ReportFormat = 'pdf' | 'pptx' | 'csv';

interface Assessment {
  id: string;
  title: string;
  status: string;
  auditType: string;
  overallScore: number | null;
  scheduledDate: string | null;
  completedDate: string | null;
  leadAuditor: {
    firstName: string;
    lastName: string;
  };
}

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingFormat, setDownloadingFormat] = useState<ReportFormat | null>(null);

  // Fetch completed and under review assessments
  const { data, isLoading, error } = useQuery({
    queryKey: ['reports-assessments', statusFilter],
    queryFn: async () => {
      const params: any = {
        pageSize: 100,
        sortBy: 'completedDate',
        sortOrder: 'desc',
      };

      // Only fetch completed and under review assessments
      if (!statusFilter) {
        params.status = 'COMPLETED,UNDER_REVIEW';
      } else {
        params.status = statusFilter;
      }

      const response = await assessmentsApi.list(params);
      return response.data;
    },
  });

  const assessments: Assessment[] = data?.data || [];

  // Filter assessments by search term
  const filteredAssessments = assessments.filter(assessment =>
    assessment.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadReport = async (assessment: Assessment, format: ReportFormat) => {
    try {
      setDownloadingId(assessment.id);
      setDownloadingFormat(format);

      let response;
      let filename;
      let contentType;

      if (format === 'pdf') {
        response = await assessmentsApi.downloadReport(assessment.id);
        filename = `assessment-report-${assessment.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;
        contentType = 'application/pdf';
      } else if (format === 'pptx') {
        response = await assessmentsApi.downloadPowerPointReport(assessment.id);
        filename = `assessment-report-${assessment.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pptx`;
        contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      } else {
        // CSV export for all assessments
        response = await assessmentsApi.exportCsv();
        filename = `assessments-export-${new Date().toISOString().split('T')[0]}.csv`;
        contentType = 'text/csv';
      }

      // Create blob and download
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`${format.toUpperCase()} report downloaded successfully`);
    } catch (error: any) {
      console.error('Error downloading report:', error);

      // Check if it's a PowerPoint-specific error
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;

      if (format === 'pptx' && errorMessage?.includes('pptxgenjs')) {
        toast.error(
          'PowerPoint generation is not available. The required package is not installed on the server. Please contact your administrator.',
          { duration: 5000 }
        );
      } else {
        toast.error(errorMessage || `Failed to download ${format.toUpperCase()} report`);
      }
    } finally {
      setDownloadingId(null);
      setDownloadingFormat(null);
    }
  };

  const handleExportAll = async () => {
    try {
      setDownloadingId('all');
      setDownloadingFormat('csv');

      const response = await assessmentsApi.exportCsv();
      const filename = `assessments-export-${new Date().toISOString().split('T')[0]}.csv`;

      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('CSV export downloaded successfully');
    } catch (error: any) {
      console.error('Error exporting CSV:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to export CSV');
    } finally {
      setDownloadingId(null);
      setDownloadingFormat(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-[var(--status-pass-bg)] text-[var(--status-pass-fg)] border border-[var(--status-pass-line)]';
      case 'UNDER_REVIEW':
        return 'bg-[var(--brand-soft)] text-[var(--text-link)]';
      case 'IN_PROGRESS':
        return 'bg-[var(--status-obs-bg)] text-[var(--status-obs-fg)] border border-[var(--status-obs-line)]';
      case 'DRAFT':
        return 'bg-[var(--surface-sunken)] text-[var(--text-strong)]';
      default:
        return 'bg-[var(--surface-sunken)] text-[var(--text-strong)]';
    }
  };

  // overallScore is a 0–100 percentage (see backend assessmentService)
  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-[var(--text-subtle)]';
    if (score >= 80) return 'text-[var(--status-pass-fg)]';
    if (score >= 50) return 'text-[var(--status-obs-fg)]';
    return 'text-[var(--status-fail-fg)]';
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-strong)]">Reports</h1>
            <p className="text-[var(--text-muted)] mt-1">Generate and download assessment reports in multiple formats</p>
          </div>
        </div>
        <SkeletonFilters showExtraFilters={true} />
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonListItem key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-[var(--status-fail-bg)] border border-[var(--status-fail-line)] rounded-xl p-4">
          <p className="text-[var(--status-fail-fg)]">Error loading assessments. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-strong)]">Reports</h1>
          <p className="text-[var(--text-muted)] mt-1">
            Generate and download assessment reports in multiple formats
          </p>
        </div>
        <button
          onClick={handleExportAll}
          disabled={downloadingId === 'all'}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--brand)] text-[var(--text-on-brand)] rounded-xl hover:bg-[var(--brand-strong)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet size={18} />
          {downloadingId === 'all' ? 'Exporting...' : 'Export All to CSV'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[var(--surface-card)] rounded-xl shadow-[var(--shadow-sm)] border border-[var(--border-subtle)] p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" size={20} />
            <input
              type="text"
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--surface-sunken)] text-[var(--text-strong)] placeholder:text-[var(--text-subtle)] border border-[var(--border-default)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-[var(--text-subtle)]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[var(--surface-sunken)] text-[var(--text-strong)] border border-[var(--border-default)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            >
              <option value="">Completed & Under Review</option>
              <option value="COMPLETED">Completed Only</option>
              <option value="UNDER_REVIEW">Under Review Only</option>
              <option value="IN_PROGRESS">In Progress</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assessments List */}
      {filteredAssessments.length === 0 ? (
        <div className="bg-[var(--surface-card)] rounded-xl shadow-[var(--shadow-sm)] border border-[var(--border-subtle)] p-8 text-center">
          <FileText className="mx-auto text-[var(--text-subtle)] mb-4" size={48} />
          <h3 className="text-lg font-medium text-[var(--text-strong)] mb-2">No Reports Available</h3>
          <p className="text-[var(--text-muted)]">
            {searchTerm
              ? 'No assessments match your search criteria.'
              : 'Complete an assessment to generate reports.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAssessments.map((assessment) => (
            <div
              key={assessment.id}
              className="bg-[var(--surface-card)] rounded-xl shadow-[var(--shadow-sm)] border border-[var(--border-subtle)] p-6 hover:shadow-[var(--shadow-md)] transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Assessment Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <FileText className="text-[var(--brand-strong)] mt-1 flex-shrink-0" size={24} />
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-strong)]">{assessment.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-[var(--text-muted)]">
                        <span className={clsx('px-2 py-1 rounded text-xs font-medium', getStatusColor(assessment.status))}>
                          {assessment.status.replace('_', ' ')}
                        </span>
                        <span>Type: {assessment.auditType}</span>
                        {assessment.overallScore !== null && (
                          <span className={clsx('font-semibold', getScoreColor(assessment.overallScore))}>
                            Score: {Math.round(assessment.overallScore)}%
                          </span>
                        )}
                        <span>Auditor: {assessment.leadAuditor.firstName} {assessment.leadAuditor.lastName}</span>
                        {assessment.completedDate && (
                          <span>
                            Completed: {new Date(assessment.completedDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleDownloadReport(assessment, 'pdf')}
                    disabled={downloadingId === assessment.id && downloadingFormat === 'pdf'}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <Download size={16} />
                    {downloadingId === assessment.id && downloadingFormat === 'pdf' ? 'Downloading...' : 'PDF'}
                  </button>
                  <button
                    onClick={() => handleDownloadReport(assessment, 'pptx')}
                    disabled={downloadingId === assessment.id && downloadingFormat === 'pptx'}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <Presentation size={16} />
                    {downloadingId === assessment.id && downloadingFormat === 'pptx' ? 'Downloading...' : 'PowerPoint'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Card */}
      <div className="bg-[var(--brand-soft)] border border-[var(--border-subtle)] rounded-xl p-4">
        <h4 className="font-semibold text-[var(--text-strong)] mb-2">Available Report Formats:</h4>
        <ul className="space-y-1 text-[var(--text-body)] text-sm">
          <li>• <strong>PDF</strong> - Comprehensive report with charts and detailed findings</li>
          <li>• <strong>PowerPoint</strong> - Professional presentation with slides for executive summary, findings, and recommendations</li>
          <li>• <strong>CSV</strong> - Export all assessment data for analysis in spreadsheet applications</li>
        </ul>
      </div>

      {/* PowerPoint Setup Notice */}
      <div className="bg-[var(--status-obs-bg)] border border-[var(--status-obs-line)] rounded-xl p-4">
        <h4 className="font-semibold text-[var(--status-obs-fg)] mb-2">📋 PowerPoint Setup Required</h4>
        <p className="text-sm text-[var(--text-body)] mb-2">
          To enable PowerPoint report generation, the server administrator needs to install the required package.
        </p>
        <div className="bg-[var(--surface-sunken)] border border-[var(--status-obs-line)] rounded p-2 mt-2">
          <p className="text-xs font-mono text-[var(--status-obs-fg)]">
            Server command: <span className="font-bold">npm install pptxgenjs</span>
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Run this in the <code className="bg-[var(--surface-raised)] px-1 rounded">backend/</code> directory and restart the server.
          </p>
        </div>
      </div>
    </div>
  );
}

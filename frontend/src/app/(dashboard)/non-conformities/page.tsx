'use client';

import { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { format } from 'date-fns';
import {
  Search,
  Filter,
  AlertCircle,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { useNonConformities } from '@/hooks/useNonConformities';
import { useDebounce } from '@/hooks/useDebounce';
import { NCRsListSkeleton } from '@/components/non-conformities/NCRsListSkeleton';
import { NCRsEmptyState } from '@/components/non-conformities/NCRsEmptyState';

const statusColors: Record<string, string> = {
  OPEN: 'bg-[var(--status-fail-bg)] text-[var(--status-fail-fg)] border border-[var(--status-fail-line)]',
  IN_PROGRESS: 'bg-[var(--status-obs-bg)] text-[var(--status-obs-fg)] border border-[var(--status-obs-line)]',
  RESOLVED: 'bg-[var(--brand-soft)] text-[var(--text-link)]',
  CLOSED: 'bg-[var(--status-pass-bg)] text-[var(--status-pass-fg)] border border-[var(--status-pass-line)]',
};

const severityColors: Record<string, string> = {
  MINOR: 'bg-[var(--status-obs-bg)] text-[var(--status-obs-fg)] border border-[var(--status-obs-line)]',
  MAJOR: 'bg-[var(--status-fail-bg)] text-[var(--status-fail-fg)] border border-[var(--status-fail-line)]',
  CRITICAL: 'bg-[var(--status-fail-bg)] text-[var(--status-fail-fg)] border border-[var(--status-fail-line)]',
};

const statusOptions = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const severityOptions = [
  { value: 'MINOR', label: 'Minor' },
  { value: 'MAJOR', label: 'Major' },
  { value: 'CRITICAL', label: 'Critical' },
];

type SortField = 'createdAt' | 'severity' | 'status' | 'identifiedDate';
type SortOrder = 'asc' | 'desc';

interface SortableColumnHeaderProps {
  field: SortField;
  label: string;
  currentSortBy: string;
  currentSortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

function SortableColumnHeader({
  field,
  label,
  currentSortBy,
  currentSortOrder,
  onSort,
}: SortableColumnHeaderProps) {
  const isActive = currentSortBy === field;

  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 font-medium text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors"
      aria-label={`Sort by ${label}`}
    >
      {label}
      {isActive ? (
        currentSortOrder === 'asc' ? (
          <ArrowUp className="h-4 w-4 text-[var(--brand-strong)]" />
        ) : (
          <ArrowDown className="h-4 w-4 text-[var(--brand-strong)]" />
        )
      ) : (
        <ArrowUpDown className="h-4 w-4 text-[var(--text-subtle)]" />
      )}
    </button>
  );
}

export default function NonConformitiesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const safeParams = searchParams ?? new URLSearchParams();

  // Get filter values from URL
  const statusFilter = safeParams.get('status') || '';
  const severityFilter = safeParams.get('severity') || '';
  const searchTermFromUrl = safeParams.get('search') || '';
  const page = parseInt(safeParams.get('page') || '1', 10);
  const pageSize = parseInt(safeParams.get('pageSize') || '10', 10);
  const sortBy = (safeParams.get('sortBy') || 'createdAt') as SortField;
  const sortOrder = (safeParams.get('sortOrder') || 'desc') as SortOrder;

  // Local state for search input (for immediate feedback)
  const [searchInput, setSearchInput] = useState(searchTermFromUrl);

  // Debounce the search input (300ms delay)
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update URL with new filter values
  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(safeParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Reset to page 1 when filters change (but not when sorting)
      if (
        !updates.hasOwnProperty('page') &&
        (updates.status !== undefined ||
          updates.severity !== undefined ||
          updates.search !== undefined) &&
        updates.sortBy === undefined &&
        updates.sortOrder === undefined
      ) {
        params.delete('page');
      }

      const queryString = params.toString();
      router.push(queryString ? `${pathname ?? '/'}?${queryString}` : pathname ?? '/');
    },
    [router, pathname, safeParams]
  );

  // Sync URL when debounced search value changes
  useEffect(() => {
    if (debouncedSearch !== searchTermFromUrl) {
      updateQueryParams({ search: debouncedSearch });
    }
  }, [debouncedSearch, searchTermFromUrl, updateQueryParams]);

  // Sync local state when URL changes externally
  useEffect(() => {
    if (searchTermFromUrl !== searchInput && searchTermFromUrl !== debouncedSearch) {
      setSearchInput(searchTermFromUrl);
    }
  }, [searchTermFromUrl]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateQueryParams({ status: e.target.value });
  };

  const handleSeverityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateQueryParams({ severity: e.target.value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handlePageChange = (newPage: number) => {
    updateQueryParams({ page: String(newPage) });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    updateQueryParams({ pageSize: String(newPageSize), page: '1' });
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      updateQueryParams({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      updateQueryParams({ sortBy: field, sortOrder: 'desc' });
    }
  };

  // Check if any filters are active
  const hasFilters = Boolean(searchTermFromUrl || statusFilter || severityFilter);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    router.push(pathname ?? '/');
  }, [router, pathname]);

  const { data, isLoading, isError } = useNonConformities({
    page,
    pageSize,
    status: statusFilter || undefined,
    severity: severityFilter || undefined,
    search: searchTermFromUrl || undefined,
    sortBy,
    sortOrder,
  });

  const nonConformities = data?.data || [];
  const pagination = data?.pagination;

  // Show full-page skeleton while loading
  if (isLoading) {
    return <NCRsListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-strong)]">Non-Conformities</h1>
          <p className="text-[var(--text-muted)]">
            Track and manage non-conformances identified during assessments
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-subtle)]"
                  size={18}
                />
                <Input
                  placeholder="Search by title..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="pl-10"
                  aria-label="Search non-conformities"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-40">
                <Select
                  value={statusFilter}
                  onChange={handleStatusChange}
                  options={statusOptions}
                  placeholder="All Status"
                  aria-label="Filter by status"
                />
              </div>
              <div className="w-40">
                <Select
                  value={severityFilter}
                  onChange={handleSeverityChange}
                  options={severityOptions}
                  placeholder="All Severity"
                  aria-label="Filter by severity"
                />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sort Controls */}
      {!isLoading && !isError && nonConformities.length > 0 && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center gap-6 text-sm">
              <span className="text-[var(--text-muted)] font-medium">Sort by:</span>
              <SortableColumnHeader
                field="createdAt"
                label="Created"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
              <SortableColumnHeader
                field="identifiedDate"
                label="Identified"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
              <SortableColumnHeader
                field="severity"
                label="Severity"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
              <SortableColumnHeader
                field="status"
                label="Status"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* NCRs List */}
      <div className="space-y-4">
        {isError ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-[var(--status-fail-fg)] mb-4" />
              <p className="text-[var(--text-body)] font-medium">Failed to load non-conformities</p>
              <p className="text-[var(--text-muted)] text-sm mt-1">Please try refreshing the page</p>
            </CardContent>
          </Card>
        ) : nonConformities.length === 0 ? (
          <Card>
            <CardContent className="py-6">
              <NCRsEmptyState
                hasFilters={hasFilters}
                onClearFilters={handleClearFilters}
              />
            </CardContent>
          </Card>
        ) : (
          nonConformities.map((ncr) => (
            <Card key={ncr.id} className="hover:shadow-[var(--shadow-md)] transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/non-conformities/${ncr.id}`}
                        className="text-lg font-semibold text-[var(--text-strong)] hover:text-[var(--brand-strong)] truncate"
                      >
                        {ncr.title}
                      </Link>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                          statusColors[ncr.status] || 'bg-[var(--surface-sunken)] text-[var(--text-body)]'
                        }`}
                      >
                        {ncr.status.replace('_', ' ')}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                          severityColors[ncr.severity] || 'bg-[var(--surface-sunken)] text-[var(--text-body)]'
                        }`}
                      >
                        {ncr.severity}
                      </span>
                    </div>

                    <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-3">{ncr.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
                      {/* Assessment link */}
                      <Link
                        href={`/assessments/${ncr.assessment.id}`}
                        className="flex items-center gap-1 text-[var(--brand-strong)] hover:text-[var(--brand)]"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {ncr.assessment.title}
                      </Link>

                      {/* Section info */}
                      {ncr.response?.section && (
                        <span className="flex items-center gap-1">
                          <ChevronRight className="h-3.5 w-3.5" />
                          {ncr.response.section.sectionNumber} {ncr.response.section.title}
                        </span>
                      )}

                      {/* Question info */}
                      {ncr.response?.question && (
                        <span className="text-[var(--text-subtle)]">
                          Q{ncr.response.question.questionNumber}
                        </span>
                      )}

                      {/* Created date */}
                      <span>Created: {format(new Date(ncr.createdAt), 'MMM d, yyyy')}</span>

                      {/* Corrective actions count */}
                      {ncr.correctiveActions.length > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="font-medium">{ncr.correctiveActions.length}</span>
                          corrective action{ncr.correctiveActions.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="ml-4">
                    <Link href={`/non-conformities/${ncr.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !isError && nonConformities.length > 0 && pagination && (
        <Card>
          <CardContent className="py-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              pageSize={pagination.limit}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[10, 25, 50]}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

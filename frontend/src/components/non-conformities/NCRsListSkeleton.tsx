'use client';

import {
  Skeleton,
  SkeletonFilters,
  SkeletonPagination,
} from '@/components/ui/skeleton';

/** Skeleton for a single NCR list item */
function SkeletonNCRItem() {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)] p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Title and badges row */}
          <div className="flex items-center gap-3 mb-2">
            <Skeleton variant="text" width={220} height={24} />
            <Skeleton variant="rectangular" width={80} height={24} className="rounded-full" />
            <Skeleton variant="rectangular" width={60} height={24} className="rounded-full" />
          </div>

          {/* Description */}
          <Skeleton variant="text" width="90%" className="mb-3" />

          {/* Meta info row */}
          <div className="flex flex-wrap items-center gap-4">
            <Skeleton variant="text" width={140} />
            <Skeleton variant="text" width={160} />
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" width={100} />
          </div>
        </div>
        {/* View Details button */}
        <div className="ml-4">
          <Skeleton variant="rectangular" width={100} height={32} className="rounded-md" />
        </div>
      </div>
    </div>
  );
}

interface NCRsListSkeletonProps {
  /** Number of NCR item skeletons to render */
  itemCount?: number;
}

export function NCRsListSkeleton({ itemCount = 5 }: NCRsListSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton variant="text" width={180} height={32} />
          <Skeleton variant="text" width={420} />
        </div>
      </div>

      {/* Filters skeleton - NCRs have status and severity dropdowns */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Skeleton variant="rectangular" height={40} className="w-full rounded-md" />
            </div>
            <div className="flex gap-2">
              <Skeleton variant="rectangular" width={160} height={40} className="rounded-md" />
              <Skeleton variant="rectangular" width={160} height={40} className="rounded-md" />
              <Skeleton variant="rectangular" width={120} height={40} className="rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Sort controls skeleton */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]">
        <div className="py-3 px-6">
          <div className="flex items-center gap-6 text-sm">
            <Skeleton variant="text" width={60} />
            <Skeleton variant="text" width={70} />
            <Skeleton variant="text" width={80} />
            <Skeleton variant="text" width={70} />
            <Skeleton variant="text" width={60} />
          </div>
        </div>
      </div>

      {/* NCR items skeleton */}
      <div className="space-y-4">
        {Array.from({ length: itemCount }).map((_, i) => (
          <SkeletonNCRItem key={i} />
        ))}
      </div>

      {/* Pagination skeleton */}
      <SkeletonPagination />
    </div>
  );
}

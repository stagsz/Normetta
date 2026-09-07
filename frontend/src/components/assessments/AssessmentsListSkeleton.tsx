'use client';

import {
  Skeleton,
  SkeletonListItem,
  SkeletonFilters,
  SkeletonPagination,
} from '@/components/ui/skeleton';

interface AssessmentsListSkeletonProps {
  /** Number of assessment item skeletons to render */
  itemCount?: number;
}

export function AssessmentsListSkeleton({ itemCount = 5 }: AssessmentsListSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton variant="text" width={150} height={32} />
          <Skeleton variant="text" width={380} />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton variant="rectangular" width={130} height={40} className="rounded-md" />
          <Skeleton variant="rectangular" width={150} height={40} className="rounded-md" />
        </div>
      </div>

      {/* Filters skeleton */}
      <SkeletonFilters showExtraFilters={true} />

      {/* Sort controls skeleton */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]">
        <div className="py-3 px-6">
          <div className="flex items-center gap-6 text-sm">
            <Skeleton variant="text" width={60} />
            <Skeleton variant="text" width={70} />
            <Skeleton variant="text" width={80} />
            <Skeleton variant="text" width={60} />
            <Skeleton variant="text" width={60} />
          </div>
        </div>
      </div>

      {/* Assessment items skeleton */}
      <div className="space-y-4">
        {Array.from({ length: itemCount }).map((_, i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>

      {/* Pagination skeleton */}
      <SkeletonPagination />
    </div>
  );
}

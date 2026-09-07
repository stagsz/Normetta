'use client';

import { Skeleton, SkeletonCard, SkeletonChart, SkeletonStatusGrid } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton variant="text" width={150} height={32} />
          <Skeleton variant="text" width={320} />
        </div>
        <Skeleton variant="rectangular" width={150} height={40} className="rounded-md" />
      </div>

      {/* Stats Cards skeleton - 4 cards in a grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Charts Row skeleton - 2 charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart height={280} />
        <SkeletonChart height={280} />
      </div>

      {/* Trend Chart skeleton - full width */}
      <SkeletonChart height={250} />

      {/* Assessment Status Breakdown skeleton */}
      <SkeletonStatusGrid count={5} />

      {/* NCR Status Breakdown skeleton */}
      <SkeletonStatusGrid count={4} />
    </div>
  );
}

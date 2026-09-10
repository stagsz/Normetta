'use client';

import { clsx } from 'clsx';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Shape variant for the skeleton */
  variant?: 'rectangular' | 'circular' | 'text';
  /** Width of the skeleton (can be number for pixels or string for other units) */
  width?: number | string;
  /** Height of the skeleton (can be number for pixels or string for other units) */
  height?: number | string;
}

function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-[var(--stone-200)]',
        {
          'rounded-md': variant === 'rectangular',
          'rounded-full': variant === 'circular',
          'rounded h-4': variant === 'text',
        },
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  );
}

/** Skeleton for a card stat display */
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)] p-6',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="text" width={120} />
          <Skeleton variant="text" width={80} height={32} />
        </div>
        <Skeleton variant="circular" width={48} height={48} />
      </div>
      <Skeleton variant="text" width={100} className="mt-4" />
    </div>
  );
}

/** Skeleton for chart sections */
function SkeletonChart({ className, height = 280 }: { className?: string; height?: number }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]',
        className
      )}
    >
      <div className="p-6 pb-0">
        <Skeleton variant="text" width={180} height={24} />
      </div>
      <div className="p-6">
        <Skeleton variant="rectangular" height={height} className="w-full" />
      </div>
    </div>
  );
}

/** Skeleton for grid items (assessment status breakdown) */
function SkeletonStatusGrid({ count = 5 }: { count?: number }) {
  return (
    <div
      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]"
    >
      <div className="p-6 pb-0">
        <Skeleton variant="text" width={160} height={24} />
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="p-4 bg-[var(--surface-sunken)] rounded-lg flex flex-col items-center">
              <Skeleton variant="text" width={40} height={28} className="mb-2" />
              <Skeleton variant="text" width={60} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Skeleton for a table row in list views */
function SkeletonTableRow({ columns = 6 }: { columns?: number }) {
  return (
    <tr className="border-b border-[var(--border-subtle)]">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton variant="text" width={i === 0 ? 140 : 80} />
        </td>
      ))}
    </tr>
  );
}

/** Skeleton for a list item card (assessments, NCRs) */
function SkeletonListItem({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)] p-4',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Title and badges row */}
          <div className="flex items-center gap-3 mb-2">
            <Skeleton variant="text" width={200} height={24} />
            <Skeleton variant="rectangular" width={80} height={24} className="rounded-full" />
            <Skeleton variant="rectangular" width={70} height={24} className="rounded-full" />
          </div>
          {/* Meta info row */}
          <div className="flex items-center gap-6">
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" width={140} />
            <Skeleton variant="text" width={100} />
          </div>
        </div>
        {/* Right side - progress/score and actions */}
        <div className="flex items-center gap-6">
          <Skeleton variant="rectangular" width={140} height={36} className="rounded" />
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton for filter/search bar */
function SkeletonFilters({ showExtraFilters = true }: { showExtraFilters?: boolean }) {
  return (
    <div
      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]"
    >
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Skeleton variant="rectangular" height={40} className="w-full rounded-md" />
          </div>
          <div className="flex gap-2">
            <Skeleton variant="rectangular" width={176} height={40} className="rounded-md" />
            {showExtraFilters && (
              <Skeleton variant="rectangular" width={120} height={40} className="rounded-md" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton for pagination controls */
function SkeletonPagination() {
  return (
    <div
      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]"
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width={180} />
          <div className="flex items-center gap-2">
            <Skeleton variant="rectangular" width={80} height={36} className="rounded-md" />
            <Skeleton variant="text" width={60} />
            <Skeleton variant="rectangular" width={80} height={36} className="rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonChart,
  SkeletonStatusGrid,
  SkeletonTableRow,
  SkeletonListItem,
  SkeletonFilters,
  SkeletonPagination
};

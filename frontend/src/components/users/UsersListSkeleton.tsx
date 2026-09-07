'use client';

import {
  Skeleton,
  SkeletonPagination,
} from '@/components/ui/skeleton';

/** Skeleton for a single user table row */
function SkeletonUserRow() {
  return (
    <tr className="border-b border-[var(--border-subtle)]">
      {/* User column with avatar */}
      <td className="px-6 py-4">
        <div className="flex items-center">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="ml-4 space-y-1">
            <Skeleton variant="text" width={140} height={18} />
            <Skeleton variant="text" width={180} height={16} />
          </div>
        </div>
      </td>
      {/* Role column */}
      <td className="px-6 py-4">
        <Skeleton variant="rectangular" width={100} height={24} className="rounded-full" />
      </td>
      {/* Status column */}
      <td className="px-6 py-4">
        <Skeleton variant="text" width={60} />
      </td>
      {/* Last Login column */}
      <td className="px-6 py-4">
        <Skeleton variant="text" width={130} />
      </td>
      {/* Created column */}
      <td className="px-6 py-4">
        <Skeleton variant="text" width={100} />
      </td>
      {/* Actions column */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Skeleton variant="rectangular" width={60} height={28} className="rounded-md" />
          <Skeleton variant="rectangular" width={60} height={28} className="rounded-md" />
          <Skeleton variant="rectangular" width={80} height={28} className="rounded-md" />
        </div>
      </td>
    </tr>
  );
}

interface UsersListSkeletonProps {
  /** Number of user row skeletons to render */
  rowCount?: number;
}

export function UsersListSkeleton({ rowCount = 5 }: UsersListSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton variant="text" width={180} height={32} />
          <Skeleton variant="text" width={320} />
        </div>
        <Skeleton variant="rectangular" width={120} height={32} className="rounded-full" />
      </div>

      {/* Filters skeleton */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Skeleton variant="rectangular" height={40} className="w-full rounded-md" />
            </div>
            <div className="flex gap-2">
              <Skeleton variant="rectangular" width={176} height={40} className="rounded-md" />
              <Skeleton variant="rectangular" width={144} height={40} className="rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Users table skeleton */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--surface-sunken)] border-b border-[var(--border-subtle)]">
              <tr>
                <th className="px-6 py-3 text-left">
                  <Skeleton variant="text" width={50} height={14} />
                </th>
                <th className="px-6 py-3 text-left">
                  <Skeleton variant="text" width={40} height={14} />
                </th>
                <th className="px-6 py-3 text-left">
                  <Skeleton variant="text" width={50} height={14} />
                </th>
                <th className="px-6 py-3 text-left">
                  <Skeleton variant="text" width={70} height={14} />
                </th>
                <th className="px-6 py-3 text-left">
                  <Skeleton variant="text" width={60} height={14} />
                </th>
                <th className="px-6 py-3 text-right">
                  <Skeleton variant="text" width={55} height={14} className="ml-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {Array.from({ length: rowCount }).map((_, i) => (
                <SkeletonUserRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination skeleton */}
      <SkeletonPagination />
    </div>
  );
}

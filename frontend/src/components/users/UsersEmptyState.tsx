'use client';

import { Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

interface UsersEmptyStateProps {
  /** Whether filters are currently active (search, role, status, etc.) */
  hasFilters: boolean;
  /** Callback to clear all filters */
  onClearFilters?: () => void;
}

/**
 * Empty state component for the admin users list
 * Shows different content based on whether filters are applied
 */
export function UsersEmptyState({ hasFilters, onClearFilters }: UsersEmptyStateProps) {
  if (hasFilters) {
    // No results matching current filters
    return (
      <EmptyState
        icon={Search}
        title="No matching users"
        description="No users match your current search or filter criteria. Try adjusting your filters to see more results."
        action={
          onClearFilters ? (
            <Button variant="outline" onClick={onClearFilters}>
              Clear all filters
            </Button>
          ) : undefined
        }
      />
    );
  }

  // No users exist at all (unlikely scenario since admin must exist)
  return (
    <EmptyState
      icon={Users}
      title="No users yet"
      description="Users will appear here once they register for the system. The first user to register becomes the system administrator."
    />
  );
}

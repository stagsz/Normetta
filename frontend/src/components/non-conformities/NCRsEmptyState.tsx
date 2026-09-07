'use client';

import { AlertTriangle, Search, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

interface NCRsEmptyStateProps {
  /** Whether filters are currently active (search, status, severity, etc.) */
  hasFilters: boolean;
  /** Callback to clear all filters */
  onClearFilters?: () => void;
}

/**
 * Empty state component for the non-conformities list
 * Shows different content based on whether filters are applied
 */
export function NCRsEmptyState({ hasFilters, onClearFilters }: NCRsEmptyStateProps) {
  if (hasFilters) {
    // No results matching current filters
    return (
      <EmptyState
        icon={Search}
        title="No matching non-conformities"
        description="No non-conformities match your current search or filter criteria. Try adjusting your filters to see more results."
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

  // No NCRs exist at all - this is actually a good thing!
  return (
    <EmptyState
      icon={CheckCircle}
      title="No non-conformities found"
      description="Great news! No non-conformities have been identified yet. They will appear here automatically when assessments identify areas that don't meet ISO 9001 requirements."
    />
  );
}

'use client';

import Link from 'next/link';
import { ClipboardList, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

interface AssessmentsEmptyStateProps {
  /** Whether filters are currently active (search, status, etc.) */
  hasFilters: boolean;
  /** Callback to clear all filters */
  onClearFilters?: () => void;
}

/**
 * Empty state component for the assessments list
 * Shows different content based on whether filters are applied
 */
export function AssessmentsEmptyState({ hasFilters, onClearFilters }: AssessmentsEmptyStateProps) {
  if (hasFilters) {
    // No results matching current filters
    return (
      <EmptyState
        icon={Search}
        title="No matching assessments"
        description="No assessments match your current search or filter criteria. Try adjusting your filters to see more results."
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

  // No assessments exist at all
  return (
    <EmptyState
      icon={ClipboardList}
      title="No assessments yet"
      description="Get started by creating your first ISO 9001 self-assessment. You'll be able to evaluate your organization's quality management system compliance."
      action={
        <Link href="/assessments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create your first assessment
          </Button>
        </Link>
      }
    />
  );
}

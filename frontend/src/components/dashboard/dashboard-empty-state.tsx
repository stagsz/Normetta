'use client';

import { ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

/**
 * Empty state component for the dashboard when no assessments exist
 * Displays a welcome message and prompts the user to create their first assessment
 */
export function DashboardEmptyState() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-strong)]">Dashboard</h1>
        <p className="text-[var(--text-muted)]">ISO 9001:2015 Quality Management System Overview</p>
      </div>

      {/* Empty State Card */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]">
        <EmptyState
          icon={ClipboardCheck}
          title="Welcome to ISO 9001 Self-Assessment"
          description="Get started by creating your first assessment. You'll be able to evaluate your organization's compliance with ISO 9001:2015 quality management requirements."
          action={
            <Link href="/assessments/new">
              <Button>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Create First Assessment
              </Button>
            </Link>
          }
          className="py-16"
        />
      </div>
    </div>
  );
}

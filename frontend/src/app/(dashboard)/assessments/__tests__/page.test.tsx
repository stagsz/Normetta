import { render, screen } from '@/__tests__/test-utils';
import { useSearchParams } from 'next/navigation';
import { useAssessments } from '@/hooks/useAssessments';
import AssessmentsPage from '../page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/assessments',
  useSearchParams: jest.fn(),
}));

jest.mock('@/hooks/useAssessments', () => ({
  useAssessments: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  assessmentsApi: { exportCsv: jest.fn() },
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@/components/ui/pagination', () => ({
  Pagination: () => <div data-testid="pagination" />,
}));

jest.mock('@/components/assessments/AssessmentsListSkeleton', () => ({
  AssessmentsListSkeleton: () => <div data-testid="assessments-skeleton" />,
}));

const mockUseSearchParams = useSearchParams as jest.Mock;
const mockUseAssessments = useAssessments as jest.Mock;

const emptyData = {
  data: [],
  pagination: { page: 1, totalPages: 0, totalItems: 0, pageSize: 10 },
};

function setup(query: string, result: Record<string, unknown>) {
  mockUseSearchParams.mockReturnValue(new URLSearchParams(query));
  mockUseAssessments.mockReturnValue(result);
  return render(<AssessmentsPage />);
}

describe('AssessmentsPage empty state', () => {
  it('shows "No assessments yet" without sort bar or pagination when the org has none', () => {
    setup('', { data: emptyData, isLoading: false, isError: false });

    expect(screen.getByText('No assessments yet')).toBeInTheDocument();
    expect(screen.queryByText('Sort by:')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
  });

  it('shows "No matching assessments" when a status filter is active', () => {
    setup('status=DRAFT', { data: emptyData, isLoading: false, isError: false });

    expect(screen.getByText('No matching assessments')).toBeInTheDocument();
    expect(screen.queryByText('No assessments yet')).not.toBeInTheDocument();
  });

  it('shows the error card instead of an empty state on error', () => {
    setup('', { data: undefined, isLoading: false, isError: true });

    expect(screen.getByText('Failed to load assessments')).toBeInTheDocument();
    expect(screen.queryByText('No assessments yet')).not.toBeInTheDocument();
    expect(screen.queryByText('No matching assessments')).not.toBeInTheDocument();
  });

  it('shows the skeleton and no empty state while loading', () => {
    setup('', { data: undefined, isLoading: true, isError: false });

    expect(screen.getByTestId('assessments-skeleton')).toBeInTheDocument();
    expect(screen.queryByText('No assessments yet')).not.toBeInTheDocument();
    expect(screen.queryByText('No matching assessments')).not.toBeInTheDocument();
  });
});

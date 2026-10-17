import { render, screen, userEvent } from '@/__tests__/test-utils';
import { AssessmentsEmptyState } from '../AssessmentsEmptyState';

describe('AssessmentsEmptyState', () => {
  it('shows the first-assessment CTA when no filters are active', () => {
    render(<AssessmentsEmptyState hasFilters={false} />);

    expect(screen.getByText('No assessments yet')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Create your first assessment/ });
    expect(link).toHaveAttribute('href', '/assessments/new');
  });

  it('shows the no-match state and clears filters once when clicked', async () => {
    const onClearFilters = jest.fn();
    render(<AssessmentsEmptyState hasFilters onClearFilters={onClearFilters} />);

    expect(screen.getByText('No matching assessments')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Create your first assessment/ })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Clear all filters' }));
    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });

  it('hides the clear button when no onClearFilters is passed', () => {
    render(<AssessmentsEmptyState hasFilters />);

    expect(screen.getByText('No matching assessments')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear all filters' })).not.toBeInTheDocument();
  });
});

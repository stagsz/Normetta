import { render, screen, userEvent } from '@/__tests__/test-utils';
import { ScoreButton, ScoreGroup } from '../score-button';

describe('ScoreButton Component', () => {
  const defaultProps = {
    score: 1 as const,
    selected: false,
    onClick: jest.fn(),
    criteria: 'Test criteria for this score',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders with score value displayed', () => {
      render(<ScoreButton {...defaultProps} />);
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('renders score 1 with Non-Compliant label', () => {
      render(<ScoreButton {...defaultProps} score={1} />);
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getAllByText('Non-Compliant').length).toBe(2);
    });

    it('renders score 2 with Initial label', () => {
      render(<ScoreButton {...defaultProps} score={2} />);
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getAllByText('Initial').length).toBe(2);
    });

    it('renders score 3 with Developing label', () => {
      render(<ScoreButton {...defaultProps} score={3} />);
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getAllByText('Developing').length).toBe(2);
    });
  });

  describe('color variants', () => {
    it('applies red styles for score 1 when not selected', () => {
      render(<ScoreButton {...defaultProps} score={1} selected={false} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-[var(--status-fail-bg)]');
    });

    it('applies red selected styles for score 1 when selected', () => {
      render(<ScoreButton {...defaultProps} score={1} selected={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-[var(--status-fail-solid)]');
      expect(button).toHaveClass('border-[var(--status-fail-solid)]');
      expect(button).toHaveClass('ring-2');
    });

    it('applies amber styles for score 2 when not selected', () => {
      render(<ScoreButton {...defaultProps} score={2} selected={false} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-[var(--status-obs-bg)]');
    });

    it('applies amber selected styles for score 2 when selected', () => {
      render(<ScoreButton {...defaultProps} score={2} selected={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-[var(--status-obs-solid)]');
      expect(button).toHaveClass('border-[var(--status-obs-solid)]');
      expect(button).toHaveClass('ring-2');
    });

    it('applies developing styles for score 3 when not selected', () => {
      render(<ScoreButton {...defaultProps} score={3} selected={false} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-[rgba(184,165,31,0.14)]');
    });

    it('applies developing selected styles for score 3 when selected', () => {
      render(<ScoreButton {...defaultProps} score={3} selected={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-[#B8A51F]');
      expect(button).toHaveClass('border-[#B8A51F]');
      expect(button).toHaveClass('ring-2');
    });
  });

  describe('click handling', () => {
    it('calls onClick handler when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<ScoreButton {...defaultProps} onClick={handleClick} />);

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<ScoreButton {...defaultProps} onClick={handleClick} disabled />);

      const button = screen.getByRole('button');
      try {
        await user.click(button);
      } catch {
        // some setups throw on disabled buttons; behavior still acceptable
      }

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('applies disabled styles when disabled', () => {
      render(<ScoreButton {...defaultProps} disabled />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50');
      expect(button).toHaveClass('cursor-not-allowed');
    });

    it('is not disabled by default', () => {
      render(<ScoreButton {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('criteria tooltip', () => {
    it('renders criteria text in tooltip', () => {
      const criteria = 'This is the specific criteria for scoring';
      render(<ScoreButton {...defaultProps} criteria={criteria} />);
      expect(screen.getByText(criteria)).toBeInTheDocument();
    });

    it('renders the score label in tooltip', () => {
      render(<ScoreButton {...defaultProps} score={1} />);
      const labels = screen.getAllByText('Non-Compliant');
      expect(labels.length).toBe(2);
    });
  });
});

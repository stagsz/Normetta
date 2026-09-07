import { render, screen, userEvent } from '@/__tests__/test-utils';
import { QuestionCard, QuestionCardCompact, MAX_JUSTIFICATION_LENGTH, Question } from '../question-card';

const mockQuestion: Question = {
  id: 'q-1',
  questionNumber: 'Q4.1',
  questionText: 'Is there documented evidence of a quality management system?',
  guidance: 'Look for documented policies and procedures.',
  standardReference: 'ISO 9001:2015 4.4',
  score1Criteria: 'No documentation exists',
  score2Criteria: 'Partial documentation exists',
  score3Criteria: 'Full documentation exists and is controlled',
};

describe('QuestionCard Component', () => {
  const defaultProps = {
    question: mockQuestion,
    onScoreChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders question number badge', () => {
      render(<QuestionCard {...defaultProps} />);
      expect(screen.getByText('Q4.1')).toBeInTheDocument();
    });

    it('renders question text', () => {
      render(<QuestionCard {...defaultProps} />);
      expect(screen.getByText('Is there documented evidence of a quality management system?')).toBeInTheDocument();
    });

    it('renders standard reference when provided', () => {
      render(<QuestionCard {...defaultProps} />);
      expect(screen.getByText(/Ref: ISO 9001:2015 4.4/)).toBeInTheDocument();
    });

    it('renders score selection prompt', () => {
      render(<QuestionCard {...defaultProps} />);
      expect(screen.getByText('Select Compliance Score')).toBeInTheDocument();
    });

    it('renders all three score buttons', () => {
      render(<QuestionCard {...defaultProps} />);
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('guidance section', () => {
    it('renders guidance when showGuidance is true (default)', () => {
      render(<QuestionCard {...defaultProps} />);
      expect(screen.getByText('Auditor Guidance')).toBeInTheDocument();
      expect(screen.getByText('Look for documented policies and procedures.')).toBeInTheDocument();
    });

    it('hides guidance when showGuidance is false', () => {
      render(<QuestionCard {...defaultProps} showGuidance={false} />);
      expect(screen.queryByText('Auditor Guidance')).not.toBeInTheDocument();
    });

    it('does not render guidance section when question has no guidance', () => {
      const questionWithoutGuidance = { ...mockQuestion, guidance: null };
      render(<QuestionCard {...defaultProps} question={questionWithoutGuidance} />);
      expect(screen.queryByText('Auditor Guidance')).not.toBeInTheDocument();
    });
  });

  describe('score button interactions', () => {
    it('calls onScoreChange with 1 when score 1 button is clicked', async () => {
      const user = userEvent.setup();
      const handleScoreChange = jest.fn();

      render(<QuestionCard {...defaultProps} onScoreChange={handleScoreChange} />);

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]); // First button is score 1
      expect(handleScoreChange).toHaveBeenCalledWith(1);
    });

    it('calls onScoreChange with 2 when score 2 button is clicked', async () => {
      const user = userEvent.setup();
      const handleScoreChange = jest.fn();

      render(<QuestionCard {...defaultProps} onScoreChange={handleScoreChange} />);

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[1]); // Second button is score 2
      expect(handleScoreChange).toHaveBeenCalledWith(2);
    });

    it('calls onScoreChange with 3 when score 3 button is clicked', async () => {
      const user = userEvent.setup();
      const handleScoreChange = jest.fn();

      render(<QuestionCard {...defaultProps} onScoreChange={handleScoreChange} />);

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[2]); // Third button is score 3
      expect(handleScoreChange).toHaveBeenCalledWith(3);
    });

    it('does not call onScoreChange when disabled', async () => {
      const user = userEvent.setup();
      const handleScoreChange = jest.fn();

      render(<QuestionCard {...defaultProps} onScoreChange={handleScoreChange} disabled />);

      const buttons = screen.getAllByRole('button');
      for (const button of buttons) {
        await user.click(button).catch(() => {
          // userEvent may throw when clicking disabled buttons
        });
      }

      expect(handleScoreChange).not.toHaveBeenCalled();
    });
  });

  describe('criteria tooltips', () => {
    it('renders score 1 criteria in tooltip', () => {
      render(<QuestionCard {...defaultProps} />);
      expect(screen.getByText('No documentation exists')).toBeInTheDocument();
    });

    it('renders score 2 criteria in tooltip', () => {
      render(<QuestionCard {...defaultProps} />);
      expect(screen.getByText('Partial documentation exists')).toBeInTheDocument();
    });

    it('renders score 3 criteria in tooltip', () => {
      render(<QuestionCard {...defaultProps} />);
      expect(screen.getByText('Full documentation exists and is controlled')).toBeInTheDocument();
    });
  });

  describe('score display', () => {
    it('shows score badge when response has score', () => {
      render(
        <QuestionCard
          {...defaultProps}
          response={{ score: 2, justification: '' }}
        />
      );
      // Label appears 3 times: badge, button, tooltip
      const partiallyCompliantElements = screen.getAllByText('Partially Compliant');
      expect(partiallyCompliantElements.length).toBe(3);
    });

    it('shows Non-Compliant badge for score 1', () => {
      render(
        <QuestionCard
          {...defaultProps}
          response={{ score: 1, justification: '' }}
        />
      );
      // Label appears 3 times: badge, button, tooltip
      const nonCompliantElements = screen.getAllByText('Non-Compliant');
      expect(nonCompliantElements.length).toBe(3);
    });

    it('shows Fully Compliant badge for score 3', () => {
      render(
        <QuestionCard
          {...defaultProps}
          response={{ score: 3, justification: '' }}
        />
      );
      // Label appears 3 times: badge, button, tooltip
      const fullyCompliantElements = screen.getAllByText('Fully Compliant');
      expect(fullyCompliantElements.length).toBe(3);
    });

    it('does not show score badge when no response', () => {
      render(<QuestionCard {...defaultProps} />);
      // Only the score labels in the buttons, not a separate badge
      const nonCompliantElements = screen.getAllByText('Non-Compliant');
      // Should only appear twice: once in button, once in tooltip
      expect(nonCompliantElements.length).toBe(2);
    });
  });

  describe('justification textarea', () => {
    it('shows justification textarea when score is selected', () => {
      render(
        <QuestionCard
          {...defaultProps}
          response={{ score: 2, justification: '' }}
        />
      );
      expect(screen.getByLabelText(/Justification/)).toBeInTheDocument();
    });

    it('hides justification textarea when no score', () => {
      render(<QuestionCard {...defaultProps} />);
      expect(screen.queryByLabelText(/Justification/)).not.toBeInTheDocument();
    });

    it('displays existing justification text', () => {
      render(
        <QuestionCard
          {...defaultProps}
          response={{ score: 2, justification: 'This is my justification' }}
        />
      );
      expect(screen.getByDisplayValue('This is my justification')).toBeInTheDocument();
    });

    it('calls onJustificationChange when typing', async () => {
      const user = userEvent.setup();
      const handleJustificationChange = jest.fn();

      render(
        <QuestionCard
          {...defaultProps}
          response={{ score: 2, justification: '' }}
          onJustificationChange={handleJustificationChange}
        />
      );

      const textarea = screen.getByLabelText(/Justification/);
      await user.type(textarea, 'New text');
      expect(handleJustificationChange).toHaveBeenCalled();
    });

    it('disables textarea when disabled prop is true', () => {
      render(
        <QuestionCard
          {...defaultProps}
          response={{ score: 2, justification: '' }}
          disabled
        />
      );
      const textarea = screen.getByLabelText(/Justification/);
      expect(textarea).toBeDisabled();
    });
  });

  describe('required indicator', () => {
    it('shows required indicator when score is 1', () => {
      render(
        <QuestionCard
          {...defaultProps}
          response={{ score: 1, justification: '' }}
        />
      );
      expect(screen.getByText('(Required)')).toBeInTheDocument();
    });

    it('shows required indicator when score is 2', () => {
      render(
        <QuestionCard
          {...defaultProps}
          response={{ score: 2, justification: '' }}
        />
      );
      expect(screen.getByText('(Required)')).toBeInTheDocument();
    });

    it('does not show required indicator when score is 3', () => {
      render(
        <QuestionCard
          {...defaultProps}
          response={{ score: 3, justification: '' }}
        />
      );
      expect(screen.queryByText('(Required)')).not.toBeInTheDocument();
    });

    it('shows warning when justification is required but empty', () => {
      render(
        <QuestionCard
          {...defaultProps}
          response={{ score: 1, justification: '' }}
        />
      );
      expect(screen.getByText('Justification is required for non-compliant scores')).toBeInTheDocument();
    });

    it('hides warning when justification is provided', () => {
      render(
        <QuestionCard
          {...defaultProps}
          response={{ score: 1, justification: 'This is my explanation' }}
        />
      );
      expect(screen.queryByText('Justification is required for non-compliant scores')).not.toBeInTheDocument();
    });
  });

  describe('character counter', () => {
    it('displays character count', () => {
      const justification = 'Short text';
      render(
        <QuestionCard
          {...defaultProps}
          response={{ score: 2, justification }}
        />
      );
      // Character count is displayed with locale formatting, so check for the parts
      expect(screen.getByText(/10/)).toBeInTheDocument();
      expect(screen.getByText(/2.*000/)).toBeInTheDocument();
    });

    it('shows warning when over character limit', () => {
      const longText = 'a'.repeat(MAX_JUSTIFICATION_LENGTH + 1);
      render(
        <QuestionCard
          {...defaultProps}
          response={{ score: 2, justification: longText }}
        />
      );
      expect(screen.getByText('Justification exceeds maximum length')).toBeInTheDocument();
    });

    it('does not show warning when at character limit', () => {
      const exactText = 'a'.repeat(MAX_JUSTIFICATION_LENGTH);
      render(
        <QuestionCard
          {...defaultProps}
          response={{ score: 2, justification: exactText }}
        />
      );
      expect(screen.queryByText('Justification exceeds maximum length')).not.toBeInTheDocument();
    });
  });

  describe('draft indicator', () => {
    it('shows draft indicator when response is draft', () => {
      render(
        <QuestionCard
          {...defaultProps}
          response={{ score: 2, justification: '', isDraft: true }}
        />
      );
      expect(screen.getByText('Draft - not yet saved')).toBeInTheDocument();
    });

    it('hides draft indicator when response is not draft', () => {
      render(
        <QuestionCard
          {...defaultProps}
          response={{ score: 2, justification: '', isDraft: false }}
        />
      );
      expect(screen.queryByText('Draft - not yet saved')).not.toBeInTheDocument();
    });
  });

  describe('color coding', () => {
    it('applies red border for score 1', () => {
      const { container } = render(
        <QuestionCard
          {...defaultProps}
          response={{ score: 1, justification: '' }}
        />
      );
      const card = container.firstChild;
      expect(card).toHaveClass('border-l-red-500');
    });

    it('applies yellow border for score 2', () => {
      const { container } = render(
        <QuestionCard
          {...defaultProps}
          response={{ score: 2, justification: '' }}
        />
      );
      const card = container.firstChild;
      expect(card).toHaveClass('border-l-yellow-500');
    });

    it('applies green border for score 3', () => {
      const { container } = render(
        <QuestionCard
          {...defaultProps}
          response={{ score: 3, justification: '' }}
        />
      );
      const card = container.firstChild;
      expect(card).toHaveClass('border-l-green-500');
    });

    it('applies neutral border when no score', () => {
      const { container } = render(<QuestionCard {...defaultProps} />);
      const card = container.firstChild;
      expect(card).toHaveClass('border-l-[var(--border-strong)]');
    });
  });

  describe('custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <QuestionCard {...defaultProps} className="custom-class" />
      );
      const card = container.firstChild;
      expect(card).toHaveClass('custom-class');
    });
  });
});

describe('QuestionCardCompact Component', () => {
  const defaultProps = {
    question: mockQuestion,
  };

  describe('rendering', () => {
    it('renders question number', () => {
      render(<QuestionCardCompact {...defaultProps} />);
      expect(screen.getByText('Q4.1')).toBeInTheDocument();
    });

    it('renders question text (truncated)', () => {
      render(<QuestionCardCompact {...defaultProps} />);
      expect(screen.getByText('Is there documented evidence of a quality management system?')).toBeInTheDocument();
    });

    it('renders as a button', () => {
      render(<QuestionCardCompact {...defaultProps} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('score display', () => {
    it('shows Not scored badge when no response', () => {
      render(<QuestionCardCompact {...defaultProps} />);
      expect(screen.getByText('Not scored')).toBeInTheDocument();
    });

    it('shows score badge with value when response has score', () => {
      render(
        <QuestionCardCompact
          {...defaultProps}
          response={{ score: 2, justification: '' }}
        />
      );
      expect(screen.getByText('Score: 2')).toBeInTheDocument();
    });

    it('shows - in circular indicator when no score', () => {
      render(<QuestionCardCompact {...defaultProps} />);
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('shows score number in circular indicator when scored', () => {
      render(
        <QuestionCardCompact
          {...defaultProps}
          response={{ score: 3, justification: '' }}
        />
      );
      // There should be a circular indicator with the score
      const scoreIndicators = screen.getAllByText('3');
      expect(scoreIndicators.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('click handling', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<QuestionCardCompact {...defaultProps} onClick={handleClick} />);

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('color coding', () => {
    it('applies neutral border when no score', () => {
      render(<QuestionCardCompact {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-l-[var(--border-strong)]');
    });

    it('applies red border for score 1', () => {
      render(
        <QuestionCardCompact
          {...defaultProps}
          response={{ score: 1, justification: '' }}
        />
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-l-red-500');
    });

    it('applies yellow border for score 2', () => {
      render(
        <QuestionCardCompact
          {...defaultProps}
          response={{ score: 2, justification: '' }}
        />
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-l-yellow-500');
    });

    it('applies green border for score 3', () => {
      render(
        <QuestionCardCompact
          {...defaultProps}
          response={{ score: 3, justification: '' }}
        />
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-l-green-500');
    });
  });

  describe('custom className', () => {
    it('applies custom className', () => {
      render(<QuestionCardCompact {...defaultProps} className="custom-class" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });
});

describe('MAX_JUSTIFICATION_LENGTH constant', () => {
  it('exports the correct value', () => {
    expect(MAX_JUSTIFICATION_LENGTH).toBe(2000);
  });
});

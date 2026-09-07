import { render, screen } from '@/__tests__/test-utils';
import { ProgressBar, CircularProgress } from '../progress-bar';

describe('ProgressBar Component', () => {
  describe('rendering', () => {
    it('renders with default props', () => {
      render(<ProgressBar value={50} />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('renders label when provided', () => {
      render(<ProgressBar value={50} label="Progress" />);
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });

    it('hides percentage when showPercentage is false', () => {
      render(<ProgressBar value={50} showPercentage={false} />);
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('shows both label and percentage', () => {
      render(<ProgressBar value={75} label="Completion" showPercentage />);
      expect(screen.getByText('Completion')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  describe('percentage calculation', () => {
    it('calculates percentage correctly with default max of 100', () => {
      render(<ProgressBar value={75} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('calculates percentage correctly with custom max', () => {
      render(<ProgressBar value={5} max={10} />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('rounds percentage to whole number', () => {
      render(<ProgressBar value={33.333} />);
      expect(screen.getByText('33%')).toBeInTheDocument();
    });

    it('rounds percentage to nearest whole number', () => {
      render(<ProgressBar value={66.6} />);
      expect(screen.getByText('67%')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles 0 value (empty progress)', () => {
      const { container } = render(<ProgressBar value={0} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
      const progressFill = container.querySelector('.progress-bar');
      expect(progressFill).toHaveStyle({ width: '0%' });
    });

    it('handles 100% value (full progress)', () => {
      const { container } = render(<ProgressBar value={100} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
      const progressFill = container.querySelector('.progress-bar');
      expect(progressFill).toHaveStyle({ width: '100%' });
    });

    it('clamps value above 100 to 100%', () => {
      const { container } = render(<ProgressBar value={150} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
      const progressFill = container.querySelector('.progress-bar');
      expect(progressFill).toHaveStyle({ width: '100%' });
    });

    it('clamps negative value to 0%', () => {
      const { container } = render(<ProgressBar value={-10} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
      const progressFill = container.querySelector('.progress-bar');
      expect(progressFill).toHaveStyle({ width: '0%' });
    });
  });

  describe('width calculation', () => {
    it('sets correct width style based on percentage', () => {
      const { container } = render(<ProgressBar value={75} />);
      const progressFill = container.querySelector('.progress-bar');
      expect(progressFill).toHaveStyle({ width: '75%' });
    });

    it('handles fractional percentages in width', () => {
      const { container } = render(<ProgressBar value={33.5} />);
      const progressFill = container.querySelector('.progress-bar');
      expect(progressFill).toHaveStyle({ width: '33.5%' });
    });
  });

  describe('size variants', () => {
    it('applies small size class', () => {
      const { container } = render(<ProgressBar value={50} size="sm" />);
      const progressBar = container.querySelector('.progress-bar');
      expect(progressBar).toHaveClass('h-2');
    });

    it('applies medium size class (default)', () => {
      const { container } = render(<ProgressBar value={50} size="md" />);
      const progressBar = container.querySelector('.progress-bar');
      expect(progressBar).toHaveClass('h-3');
    });

    it('applies large size class', () => {
      const { container } = render(<ProgressBar value={50} size="lg" />);
      const progressBar = container.querySelector('.progress-bar');
      expect(progressBar).toHaveClass('h-4');
    });
  });

  describe('color schemes', () => {
    describe('default color scheme', () => {
      it('uses primary color regardless of percentage', () => {
        const { container } = render(<ProgressBar value={50} colorScheme="default" />);
        const progressBar = container.querySelector('.progress-bar');
        expect(progressBar).toHaveClass('bg-sage-600');
      });
    });

    describe('compliance color scheme', () => {
      it('shows red for percentage below 50', () => {
        const { container } = render(<ProgressBar value={30} colorScheme="compliance" />);
        const progressBar = container.querySelector('.progress-bar');
        expect(progressBar).toHaveClass('bg-red-500');
      });

      it('shows red for percentage at 49', () => {
        const { container } = render(<ProgressBar value={49} colorScheme="compliance" />);
        const progressBar = container.querySelector('.progress-bar');
        expect(progressBar).toHaveClass('bg-red-500');
      });

      it('shows yellow for percentage at 50', () => {
        const { container } = render(<ProgressBar value={50} colorScheme="compliance" />);
        const progressBar = container.querySelector('.progress-bar');
        expect(progressBar).toHaveClass('bg-amber-500');
      });

      it('shows yellow for percentage between 50 and 69', () => {
        const { container } = render(<ProgressBar value={60} colorScheme="compliance" />);
        const progressBar = container.querySelector('.progress-bar');
        expect(progressBar).toHaveClass('bg-amber-500');
      });

      it('shows green for percentage at 70', () => {
        const { container } = render(<ProgressBar value={70} colorScheme="compliance" />);
        const progressBar = container.querySelector('.progress-bar');
        expect(progressBar).toHaveClass('bg-green-500');
      });

      it('shows green for percentage above 70', () => {
        const { container } = render(<ProgressBar value={90} colorScheme="compliance" />);
        const progressBar = container.querySelector('.progress-bar');
        expect(progressBar).toHaveClass('bg-green-500');
      });
    });
  });

  describe('custom className', () => {
    it('applies custom className to wrapper', () => {
      const { container } = render(<ProgressBar value={50} className="custom-class" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
      expect(wrapper).toHaveClass('w-full');
    });
  });
});

describe('CircularProgress Component', () => {
  describe('rendering', () => {
    it('renders with default props', () => {
      render(<CircularProgress value={50} />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('hides percentage when showPercentage is false', () => {
      render(<CircularProgress value={50} showPercentage={false} />);
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('renders SVG element', () => {
      const { container } = render(<CircularProgress value={50} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('percentage calculation', () => {
    it('calculates percentage correctly with default max of 100', () => {
      render(<CircularProgress value={75} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('calculates percentage correctly with custom max', () => {
      render(<CircularProgress value={5} max={10} />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('rounds percentage to whole number', () => {
      render(<CircularProgress value={33.333} />);
      expect(screen.getByText('33%')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles 0 value', () => {
      render(<CircularProgress value={0} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('handles 100% value', () => {
      render(<CircularProgress value={100} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('clamps value above 100 to 100%', () => {
      render(<CircularProgress value={150} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('clamps negative value to 0%', () => {
      render(<CircularProgress value={-10} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('SVG sizing', () => {
    it('uses default size of 120', () => {
      const { container } = render(<CircularProgress value={50} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '120');
      expect(svg).toHaveAttribute('height', '120');
    });

    it('applies custom size', () => {
      const { container } = render(<CircularProgress value={50} size={80} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '80');
      expect(svg).toHaveAttribute('height', '80');
    });
  });

  describe('color schemes', () => {
    it('uses primary color for default scheme', () => {
      const { container } = render(<CircularProgress value={50} colorScheme="default" />);
      const circles = container.querySelectorAll('circle');
      // The second circle (progress indicator) should have the stroke color
      expect(circles[1]).toHaveAttribute('stroke', '#2563eb');
    });

    it('uses red for compliance scheme below 50', () => {
      const { container } = render(<CircularProgress value={30} colorScheme="compliance" />);
      const circles = container.querySelectorAll('circle');
      expect(circles[1]).toHaveAttribute('stroke', '#ef4444');
    });

    it('uses yellow for compliance scheme between 50-69', () => {
      const { container } = render(<CircularProgress value={60} colorScheme="compliance" />);
      const circles = container.querySelectorAll('circle');
      expect(circles[1]).toHaveAttribute('stroke', '#eab308');
    });

    it('uses green for compliance scheme at 70 or above', () => {
      const { container } = render(<CircularProgress value={80} colorScheme="compliance" />);
      const circles = container.querySelectorAll('circle');
      expect(circles[1]).toHaveAttribute('stroke', '#22c55e');
    });
  });

  describe('custom className', () => {
    it('applies custom className to wrapper', () => {
      const { container } = render(<CircularProgress value={50} className="custom-class" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });
  });
});

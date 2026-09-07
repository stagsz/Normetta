'use client';

import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-[linear-gradient(var(--brand),_var(--brand-strong))] text-white shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:brightness-110',
        destructive:
          'bg-red-600 text-white shadow-[var(--shadow-md)] hover:bg-red-700 hover:shadow-[var(--shadow-lg)]',
        outline:
          'border-2 border-[var(--brand-soft)] bg-[var(--surface-card)] text-[var(--brand)] shadow-[var(--shadow-md)] hover:bg-[var(--brand-soft)] hover:border-[var(--brand)] hover:shadow-[var(--shadow-lg)]',
        secondary:
          'bg-[var(--surface-sunken)] text-[var(--text-strong)] shadow-[var(--shadow-md)] hover:bg-[var(--stone-200)] hover:shadow-[var(--shadow-lg)]',
        ghost:
          'text-[var(--text-muted)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-strong)]',
        link:
          'text-[var(--brand-strong)] underline-offset-4 hover:underline hover:text-[var(--brand)]',
        success:
          'bg-green-600 text-white shadow-[var(--shadow-md)] hover:bg-green-700 hover:shadow-[var(--shadow-lg)]',
        warning:
          'bg-yellow-500 text-white shadow-[var(--shadow-md)] hover:bg-yellow-600 hover:shadow-[var(--shadow-lg)]',
      },
      size: {
        default: 'h-10 px-5 py-2 text-sm rounded-xl',
        sm: 'h-9 px-3.5 text-sm rounded-lg',
        lg: 'h-12 px-8 text-base rounded-xl',
        icon: 'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  iconLeft?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, iconLeft, children, disabled, ...props }, ref) => {
    return (
      <button
        className={clsx(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && iconLeft && <span className="mr-2 inline-flex">{iconLeft}</span>}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

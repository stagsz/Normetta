'use client';

import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';

const selectVariants = cva(
  'appearance-none w-full rounded-xl border bg-[var(--surface-card)] text-sm text-[var(--text-strong)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--surface-sunken)] pr-10',
  {
    variants: {
      variant: {
        default: 'border-[var(--border-default)] hover:border-[var(--border-strong)] focus:border-transparent',
        error: 'border-[var(--status-fail-line)] focus:ring-[var(--status-fail-solid)] bg-[var(--status-fail-bg)]',
      },
      size: {
        default: 'h-10 px-3.5 py-2',
        sm: 'h-9 px-2.5 py-1 text-sm',
        lg: 'h-11 px-4 py-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, size, options, placeholder, error, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={clsx(selectVariants({ variant: error ? 'error' : variant, size, className }))}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]"
          aria-hidden="true"
        />
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select, selectVariants };

'use client';

import { forwardRef } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-[var(--text-body)] mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={id}
          className={clsx(
            'flex h-10 w-full rounded-xl border bg-[var(--surface-card)] px-3.5 py-2 text-sm text-[var(--text-strong)]',
            'placeholder:text-[var(--text-subtle)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--surface-sunken)]',
            'transition-all duration-200',
            error
              ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
              : 'border-[var(--border-default)] hover:border-[var(--border-strong)]',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zm.75 6.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };

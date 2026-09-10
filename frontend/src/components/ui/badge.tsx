'use client';

import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--surface-sunken)] text-[var(--text-body)] border border-[var(--border-subtle)]',
        sage: 'bg-[var(--brand-soft)] text-[var(--brand)] border border-[var(--border-subtle)]',
        info: 'bg-blue-50 text-blue-700 border border-blue-200',
        success: 'bg-green-50 text-green-700 border border-green-200',
        warning: 'bg-amber-50 text-amber-700 border border-amber-200',
        danger: 'bg-red-50 text-red-700 border border-red-200',
        // Solid variants
        'solid-sage': 'bg-[var(--brand)] text-white',
        'solid-info': 'bg-blue-600 text-white',
        'solid-success': 'bg-green-600 text-white',
        'solid-warning': 'bg-[var(--status-obs-solid)] text-white',
        'solid-danger': 'bg-red-600 text-white',
      },
      size: {
        sm: 'text-xs px-2 py-0.5 rounded-md',
        default: 'text-xs px-2.5 py-1 rounded-lg',
        lg: 'text-sm px-3 py-1 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span
      ref={ref}
      className={clsx(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };

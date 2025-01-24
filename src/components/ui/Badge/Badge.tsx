// src/components/ui/Badge/Badge.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20',
        primary:
          'bg-primary-50 text-primary-600 ring-primary-500/10 dark:bg-primary-400/10 dark:text-primary-400 dark:ring-primary-400/20',
        success:
          'bg-green-50 text-green-600 ring-green-500/10 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-400/20',
        warning:
          'bg-yellow-50 text-yellow-600 ring-yellow-500/10 dark:bg-yellow-400/10 dark:text-yellow-400 dark:ring-yellow-400/20',
        danger:
          'bg-red-50 text-red-600 ring-red-500/10 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20',
        info:
          'bg-blue-50 text-blue-600 ring-blue-500/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20'
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-sm'
      },
      rounded: {
        full: 'rounded-full',
        md: 'rounded-md'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
      rounded: 'full'
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, rounded, icon, dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, rounded }), className)}
        {...props}
      >
        {icon && <span className="mr-1 -ml-0.5">{icon}</span>}
        {dot && (
          <span className={cn(
            'mr-1.5 -ml-0.5 h-1.5 w-1.5 rounded-full',
            variant === 'primary' && 'bg-primary-400',
            variant === 'success' && 'bg-green-400',
            variant === 'warning' && 'bg-yellow-400',
            variant === 'danger' && 'bg-red-400',
            variant === 'info' && 'bg-blue-400',
            variant === 'default' && 'bg-gray-400'
          )} />
        )}
        {children}
      </span>
    );
  }
);
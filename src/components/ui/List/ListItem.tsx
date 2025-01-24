// src/components/ui/List/ListItem.tsx
import * as React from 'react';
import { cn } from '../../../utils/cn';

interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  dense?: boolean;
}

export const ListItem = React.forwardRef<HTMLDivElement, ListItemProps>(
  ({ className, selected, dense, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center px-4',
          dense ? 'py-1.5' : 'py-2',
          selected && 'bg-primary-50 dark:bg-primary-900/50',
          'hover:bg-gray-50 dark:hover:bg-gray-800',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
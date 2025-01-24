// src/components/ui/Avatar/Avatar.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const avatarVariants = cva(
  'relative inline-flex items-center justify-center font-medium overflow-hidden',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-14 w-14 text-xl'
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-lg'
      }
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle'
    }
  }
);

interface AvatarProps
  extends React.ImgHTMLAttributes<HTMLImageElement>,
    VariantProps<typeof avatarVariants> {
  fallback?: React.ReactNode;
  status?: 'online' | 'offline' | 'away' | 'busy';
  bordered?: boolean;
}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, size, shape, src, alt, fallback, status, bordered, ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false);

    const handleError = () => {
      setHasError(true);
    };

    return (
      <span ref={ref} className="relative inline-block">
        <span
          className={cn(
            avatarVariants({ size, shape }),
            bordered && 'ring-2 ring-white dark:ring-gray-900',
            className
          )}
        >
          {!hasError && src ? (
            <img
              src={src}
              alt={alt}
              onError={handleError}
              className="h-full w-full object-cover"
              {...props}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
              {fallback || (
                <span className="uppercase">
                  {alt
                    ? alt.split(' ').map(n => n[0]).join('')
                    : '?'}
                </span>
              )}
            </span>
          )}
        </span>
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-gray-900',
              size === 'xs' ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5',
              status === 'online' && 'bg-green-400',
              status === 'offline' && 'bg-gray-400',
              status === 'away' && 'bg-yellow-400',
              status === 'busy' && 'bg-red-400'
            )}
          />
        )}
      </span>
    );
  }
);

Avatar.displayName = 'Avatar';

export const AvatarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { spacing?: number }
>(({ className, spacing = -3, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center', className)}
      style={{ marginLeft: `${Math.abs(spacing)}px` }}
      {...props}
    >
      {React.Children.map(children, child => (
        <div style={{ marginLeft: `${spacing}px` }}>{child}</div>
      ))}
    </div>
  );
});
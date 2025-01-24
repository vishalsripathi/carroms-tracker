// src/components/ui/Skeleton/Skeleton.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const skeletonVariants = cva(
  'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
  {
    variants: {
      variant: {
        default: 'opacity-100',
        shimmer: 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent dark:before:via-white/10',
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: number | string;
  height?: number | string;
  circle?: boolean;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, width, height, circle, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant }), circle && 'rounded-full', className)}
        style={{
          width: width,
          height: height || (typeof width === 'number' ? width : undefined)
        }}
        {...props}
      />
    );
  }
);

export const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, width = '100%', height = 16, ...props }, ref) => {
    return (
      <Skeleton
        ref={ref}
        className={cn('my-1', className)}
        width={width}
        height={height}
        {...props}
      />
    );
  }
);

interface SkeletonAvatarProps extends SkeletonProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const SkeletonAvatar = React.forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  ({ size = 'md', className, ...props }, ref) => {
    const sizeMap = {
      xs: 24,
      sm: 32,
      md: 40,
      lg: 48,
      xl: 56
    };

    return (
      <Skeleton
        ref={ref}
        circle
        width={sizeMap[size]}
        height={sizeMap[size]}
        className={className}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';
SkeletonText.displayName = 'SkeletonText';
SkeletonAvatar.displayName = 'SkeletonAvatar';
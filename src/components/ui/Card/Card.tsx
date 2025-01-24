import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-sm transition-all',
  {
    variants: {
      variant: {
        default: 'border-border/50',
        ghost: 'border-transparent shadow-none',
        outline: 'border-border',
        elevated: 'border-transparent shadow-md hover:shadow-lg',
      },
      hover: {
        true: 'hover:border-border/80 hover:bg-accent/50',
        false: '',
      },
      clickable: {
        true: 'cursor-pointer active:scale-[0.98] transition-transform',
        false: '',
      }
    },
    defaultVariants: {
      variant: 'default',
      hover: false,
      clickable: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  loading?: boolean;
  disabled?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, clickable, loading, disabled, children, ...props }, ref) => {
    const rootClass = cn(
      cardVariants({ variant, hover, clickable }),
      disabled && 'opacity-60 cursor-not-allowed',
      className
    );

    return (
      <div ref={ref} className={rootClass} {...props}>
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          children
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

// Card Title Component
export const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));

CardTitle.displayName = 'CardTitle';

// Card Description Component
export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

// Card Content Component
export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));

CardContent.displayName = 'CardContent';

// Card Footer Component
export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';

// Card Media Component
interface CardMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
  overlay?: React.ReactNode;
}

export const CardMedia = React.forwardRef<HTMLDivElement, CardMediaProps>(
  ({ className, src, alt, aspectRatio = '16:9', overlay, ...props }, ref) => {
    const aspectRatioClass = {
      '16:9': 'aspect-video',
      '4:3': 'aspect-4/3',
      '1:1': 'aspect-square',
    };

    return (
      <div
        ref={ref}
        className={cn('relative overflow-hidden', aspectRatioClass[aspectRatio], className)}
        {...props}
      >
        <img
          src={src}
          alt={alt}
          className="object-cover w-full h-full"
        />
        {overlay && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            {overlay}
          </div>
        )}
      </div>
    );
  }
);

CardMedia.displayName = 'CardMedia';
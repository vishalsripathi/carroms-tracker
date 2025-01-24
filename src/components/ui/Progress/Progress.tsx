import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '../../../utils/cn';

interface ProgressProps {
  value: number;
  max?: number;
  variant?: 'linear' | 'circular';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Progress = ({
  value,
  max = 100,
  variant = 'linear',
  size = 'md',
  className,
}: ProgressProps) => {
  const percentage = (value / max) * 100;

  if (variant === 'circular') {
    const sizes = {
      sm: 'h-8 w-8',
      md: 'h-12 w-12',
      lg: 'h-16 w-16',
    };

    const strokeWidth = size === 'sm' ? 2 : size === 'md' ? 3 : 4;
    const radius = size === 'sm' ? 12 : size === 'md' ? 20 : 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className={cn(sizes[size], 'relative', className)}>
        <svg className="h-full w-full -rotate-90">
          <circle
            className="text-gray-200"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="50%"
            cy="50%"
          />
          <circle
            className="text-blue-600 transition-all duration-300 ease-in-out"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="50%"
            cy="50%"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
          {Math.round(percentage)}%
        </div>
      </div>
    );
  }

  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <ProgressPrimitive.Root
      className={cn('relative w-full overflow-hidden rounded-full bg-gray-200', heights[size], className)}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-blue-600 transition-all duration-300 ease-in-out"
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </ProgressPrimitive.Root>
  );
};
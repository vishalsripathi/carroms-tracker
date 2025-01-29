import { cn } from "../../../utils/cn";


interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  className?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = ({
  size = 'md',
  variant = 'primary',
  className,
  fullScreen = false,
}: LoadingSpinnerProps) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const variants = {
    primary: 'text-primary',
    secondary: 'text-secondary',
  };

  const spinnerContent = (
    <div className={cn('animate-spin', sizes[size], variants[variant], className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className="animate-spin"
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
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center gap-4">
          {spinnerContent}
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
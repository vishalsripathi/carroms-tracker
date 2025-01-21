interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    fullScreen?: boolean;
  }
  
  const LoadingSpinner = ({ size = 'medium', fullScreen = false }: LoadingSpinnerProps) => {
    const sizeClasses = {
      small: 'h-6 w-6',
      medium: 'h-12 w-12',
      large: 'h-16 w-16'
    };
  
    const spinner = (
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${sizeClasses[size]}`} />
    );
  
    if (fullScreen) {
      return (
        <div className="fixed inset-0 bg-gray-100/75 flex items-center justify-center">
          {spinner}
        </div>
      );
    }
  
    return spinner;
  };
  
  export default LoadingSpinner;
interface AlertProps {
    type?: 'error' | 'success' | 'warning' | 'info';
    children: React.ReactNode;
    onClose?: () => void;
  }
  
  export const BasicAlert: React.FC<AlertProps> = ({ 
    type = 'info', 
    children, 
    onClose 
  }) => {
    const types = {
      error: 'bg-red-100 text-red-800 border-red-200',
      success: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200'
    };
  
    return (
      <div className={`p-4 rounded border ${types[type]} relative`}>
        {children}
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        )}
      </div>
    );
  };
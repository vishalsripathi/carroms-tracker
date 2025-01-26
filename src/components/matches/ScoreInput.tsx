interface ScoreInputProps {
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  label?: string;
  max?: number;
  className?: string;
}

export const ScoreInput: React.FC<ScoreInputProps> = ({
  value,
  onChange,
  onBlur,
  label,
  max = 29,
  className
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={e => {
            const newValue = Math.max(0, parseInt(e.target.value) || 0);
            onChange(Math.min(newValue, max));
          }}
          onBlur={onBlur}
          className={`w-full px-3 py-2 text-center text-2xl font-bold rounded-lg 
            border border-gray-200 dark:border-gray-700
            bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:cursor-not-allowed disabled:opacity-50
            ${className}`}
          min="0"
          max={max}
        />
        <span className="absolute -top-2 right-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-1">
          points
        </span>
      </div>
    </div>
  );
};
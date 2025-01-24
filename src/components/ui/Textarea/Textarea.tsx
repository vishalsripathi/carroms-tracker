import * as React from 'react';
import { cn } from '../../../utils/cn';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxLength?: number;
  showCount?: boolean;
  autoExpand?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, maxLength, showCount, autoExpand, onChange, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    
    React.useEffect(() => {
      if (autoExpand && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [autoExpand, props.value]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoExpand) {
        event.target.style.height = 'auto';
        event.target.style.height = `${event.target.scrollHeight}px`;
      }
      onChange?.(event);
    };

    const currentLength = typeof props.value === 'string' ? props.value.length : 0;

    const textareaClassName = cn(
      'flex min-h-[80px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:focus-visible:ring-offset-gray-950',
      error && 'border-red-500 focus-visible:ring-red-500',
      className
    );

    return (
      <div className="grid w-full gap-1.5">
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <textarea
          ref={(element) => {
            textareaRef.current = element;
            if (typeof ref === 'function') {
              ref(element);
            } else if (ref) {
              ref.current = element;
            }
          }}
          onChange={handleChange}
          maxLength={maxLength}
          className={textareaClassName}
          {...props}
        />
        {(error || (showCount && maxLength)) && (
          <div className="flex justify-between text-sm">
            {error && <p className="text-red-500">{error}</p>}
            {showCount && maxLength && (
              <p className={cn(
                'text-gray-500',
                currentLength >= maxLength && 'text-red-500'
              )}>
                {currentLength}/{maxLength}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  options: RadioOption[];
  label?: string;
  error?: string;
}

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, options, label, error, ...props }, ref) => (
  <div className="grid gap-2">
    {label && (
      <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {label}
      </label>
    )}
    <RadioGroupPrimitive.Root
      className={cn('grid gap-2', className)}
      {...props}
      ref={ref}
    >
      {options.map((option) => (
        <div key={option.value} className="flex items-start space-x-3">
          <RadioGroupPrimitive.Item
            value={option.value}
            disabled={option.disabled}
            className={cn(
              'peer h-4 w-4 rounded-full border border-gray-300 text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-primary-600 dark:focus:ring-offset-gray-950',
              error && 'border-red-500 focus:ring-red-500'
            )}
          >
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
              <Circle className="h-2.5 w-2.5 fill-current" />
            </RadioGroupPrimitive.Indicator>
          </RadioGroupPrimitive.Item>
          <label className="grid gap-1 leading-none">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {option.label}
            </span>
            {option.description && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {option.description}
              </span>
            )}
          </label>
        </div>
      ))}
    </RadioGroupPrimitive.Root>
    {error && (
      <p className="text-sm text-red-500">{error}</p>
    )}
  </div>
));

RadioGroup.displayName = 'RadioGroup';

export { RadioGroup };
import * as React from "react";
import * as Label from "@radix-ui/react-label";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "../../../utils/cn";

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
  controls?: boolean;
  value: number;
  onChange: (value: number) => void;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, label, error, min, max, step = 1, controls = true, value, onChange, ...props }, ref) => {
    const id = React.useId();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(event.target.value);
      if (!isNaN(newValue)) {
        onChange(newValue);
      }
    };

    const increment = () => {
      if (max === undefined || value < max) {
        onChange(value + step);
      }
    };

    const decrement = () => {
      if (min === undefined || value > min) {
        onChange(value - step);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        increment();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        decrement();
      }
    };

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <Label.Root
            htmlFor={id}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </Label.Root>
        )}
        <div className="relative">
          <input
            id={id}
            ref={ref}
            type="number"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            min={min}
            max={max}
            step={step}
            className={cn(
              "flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-primary-800",
              error && "border-red-500 focus-visible:ring-red-500",
              controls && "pr-10",
              className
            )}
            {...props}
          />
          {controls && (
            <div className="absolute right-0 top-0 h-full flex flex-col border-l border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={increment}
                disabled={max !== undefined && value >= max}
                className="flex-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 rounded-tr-md"
              >
                <ChevronUp className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={decrement}
                disabled={min !== undefined && value <= min}
                className="flex-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 rounded-br-md"
              >
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";

export { NumberInput };
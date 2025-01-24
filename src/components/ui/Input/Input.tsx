// src/components/ui/Input/Input.tsx
import * as React from "react";
import * as Label from "@radix-ui/react-label";
import { cn } from "../../../utils/cn";
import { EyeIcon, EyeOffIcon, X } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  showPassword?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, leftIcon, rightIcon, clearable, onClear, showPassword, ...props }, ref) => {
    const [showPasswordValue, setShowPasswordValue] = React.useState(false);
    const id = React.useId();

    const togglePassword = () => {
      setShowPasswordValue(prev => !prev);
    };

    const renderRightElement = () => {
      if (type === "password" && showPassword) {
        return (
          <button
            type="button"
            onClick={togglePassword}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPasswordValue ? (
              <EyeOffIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </button>
        );
      }

      if (clearable && props.value) {
        return (
          <button
            type="button"
            onClick={onClear}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        );
      }

      return rightIcon;
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
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {leftIcon}
            </div>
          )}
          <input
            id={id}
            type={showPasswordValue ? "text" : type}
            className={cn(
              "flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-primary-800",
              error && "border-red-500 focus-visible:ring-red-500",
              leftIcon && "pl-10",
              (rightIcon || clearable || (type === "password" && showPassword)) && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {renderRightElement() && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {renderRightElement()}
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

Input.displayName = "Input";

export { Input };
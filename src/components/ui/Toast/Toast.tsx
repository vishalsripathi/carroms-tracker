import { useState, useEffect } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cva } from 'class-variance-authority';
import { cn } from '../../../utils/cn';
import { X } from 'lucide-react';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
  {
    variants: {
      variant: {
        default: 'bg-background border',
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface Toast {
  id: string;
  title: string;
  description?: string | undefined;
  variant?: 'default' | 'success' | 'error' | 'warning';
  duration?: number;
}

interface ToastProps extends Toast {
  onClose: (id: string) => void;
}

export const Toast = ({ id, title, description, variant = 'default', duration = 5000, onClose }: ToastProps) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  return (
    <ToastPrimitive.Provider>
      <ToastPrimitive.Root
        open={open}
        onOpenChange={setOpen}
        className={cn(toastVariants({ variant }))}
      >
        <div className="flex flex-col gap-1">
          <ToastPrimitive.Title className="text-sm font-semibold">
            {title}
          </ToastPrimitive.Title>
          {description && (
            <ToastPrimitive.Description className="text-sm opacity-90">
              {description}
            </ToastPrimitive.Description>
          )}
        </div>
        <ToastPrimitive.Close
          onClick={() => onClose(id)}
          className="absolute right-2 top-2 rounded-md p-1 opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </ToastPrimitive.Close>
      </ToastPrimitive.Root>
      <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
    </ToastPrimitive.Provider>
  );
};
import * as React from 'react';
import { Dialog as HeadlessDialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';

const dialogVariants = cva(
  'relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all dark:bg-gray-800 w-full',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        full: 'max-w-full'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
);

interface DialogProps extends VariantProps<typeof dialogVariants> {
  open: boolean;
  onClose: () => void;
  initialFocus?: React.MutableRefObject<HTMLElement | null>;
  children?: React.ReactNode;
  className?: string;
}

export const Dialog = ({
  open,
  onClose,
  initialFocus,
  children,
  size,
  className
}: DialogProps) => (
  <Transition.Root show={open} as={React.Fragment}>
    <HeadlessDialog
      as="div"
      className="relative z-50"
      onClose={onClose}
      initialFocus={initialFocus}
    >
      <Transition.Child
        as={React.Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
      </Transition.Child>

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <HeadlessDialog.Panel
              className={cn(dialogVariants({ size }), className)}
            >
              {children}
            </HeadlessDialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </HeadlessDialog>
  </Transition.Root>
);

export const DialogHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex items-center justify-between p-4 border-b', className)}
    {...props}
  >
    <HeadlessDialog.Title as="h3" className="text-lg font-semibold">
      {children}
    </HeadlessDialog.Title>
    <DialogClose />
  </div>
);

export const DialogContent = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('p-4 overflow-y-auto max-h-[calc(100vh-16rem)]', className)}
    {...props}
  >
    {children}
  </div>
);

export const DialogFooter = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex items-center justify-end space-x-2 p-4 border-t',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const DialogClose = ({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cn(
      'rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700',
      className
    )}
    {...props}
  >
    <X className="h-5 w-5" />
  </button>
);

// Example ActionDialog component with built-in actions
interface ActionDialogProps extends Omit<DialogProps, 'children'> {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'danger' | 'default';
}

export const ActionDialog = ({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'default',
  ...props
}: ActionDialogProps) => (
  <Dialog {...props}>
    <DialogHeader>{title}</DialogHeader>
    <DialogContent>
      {description && <p className="text-gray-500">{description}</p>}
    </DialogContent>
    <DialogFooter>
      <button
        type="button"
        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md"
        onClick={props.onClose}
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        className={cn(
          'px-4 py-2 text-sm font-medium text-white rounded-md',
          variant === 'danger'
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-primary-600 hover:bg-primary-700'
        )}
        onClick={onConfirm}
      >
        {confirmLabel}
      </button>
    </DialogFooter>
  </Dialog>
);
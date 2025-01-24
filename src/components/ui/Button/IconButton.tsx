import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '../../../utils/cn';
import { Button } from './Button';
import type { ButtonProps } from './Button';

interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon'> {
  icon: React.ReactNode;
  tooltip?: string;
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, icon, tooltip, tooltipSide = 'top', ...props }, ref) => {
    const button = (
      <Button
        ref={ref}
        className={cn('p-0', className)}
        size="icon"
        {...props}
      >
        {icon}
      </Button>
    );

    if (tooltip) {
      return (
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              {button}
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side={tooltipSide}
                className="rounded bg-gray-900 px-2 py-1 text-xs text-white animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
              >
                {tooltip}
                <Tooltip.Arrow className="fill-gray-900" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      );
    }

    return button;
  }
);
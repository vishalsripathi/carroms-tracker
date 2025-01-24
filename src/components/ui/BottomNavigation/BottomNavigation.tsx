import * as React from 'react';
import { cn } from '../../../utils/cn';

interface NavigationItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  badge?: number | string;
}

interface BottomNavigationProps {
  items: NavigationItem[];
  activeItem?: string;
  onItemClick?: (item: NavigationItem) => void;
  className?: string;
  showLabels?: boolean;
}

export const BottomNavigation = ({
  items,
  activeItem,
  onItemClick,
  className,
  showLabels = true,
}: BottomNavigationProps) => {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'flex h-16 border-t bg-white/80 backdrop-blur-lg dark:bg-gray-900/80',
        'border-gray-200 dark:border-gray-800',
        'lg:hidden',
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => {
            item.onClick?.();
            onItemClick?.(item);
          }}
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-1',
            'text-xs font-medium',
            'transition-colors duration-200',
            activeItem === item.key
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50'
          )}
        >
          <div className="relative">
            {item.icon}
            {item.badge && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {item.badge}
              </span>
            )}
          </div>
          {showLabels && <span>{item.label}</span>}
        </button>
      ))}
    </div>
  );
};
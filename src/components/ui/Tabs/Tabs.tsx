import * as React from 'react';
import { Tab } from '@headlessui/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const tabsRootVariants = cva('relative', {
  variants: {
    orientation: {
      horizontal: 'space-y-2',
      vertical: 'flex space-x-2'
    }
  },
  defaultVariants: {
    orientation: 'horizontal'
  }
});

const tabListVariants = cva(
  'relative flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1',
  {
    variants: {
      orientation: {
        horizontal: 'space-x-1',
        vertical: 'flex-col space-y-1'
      },
      fullWidth: {
        true: 'w-full',
        false: ''
      }
    },
    defaultVariants: {
      orientation: 'horizontal',
      fullWidth: false
    }
  }
);

const tabVariants = cva(
  'relative flex items-center justify-center select-none rounded-md text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      orientation: {
        horizontal: 'px-3 py-1.5',
        vertical: 'px-3 py-1.5 w-full justify-start'
      },
      state: {
        active: 'bg-white text-primary-600 shadow dark:bg-gray-700 dark:text-primary-400',
        inactive: 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700/50'
      }
    },
    defaultVariants: {
      orientation: 'horizontal',
      state: 'inactive'
    }
  }
);

const tabPanelVariants = cva(
  'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
  {
    variants: {
      orientation: {
        horizontal: '',
        vertical: 'flex-1'
      }
    },
    defaultVariants: {
      orientation: 'horizontal'
    }
  }
);

interface TabItem {
  id: string;
  label: string | React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps extends VariantProps<typeof tabsRootVariants> {
  tabs: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  fullWidth?: boolean;
  className?: string;
}

export const Tabs = ({
  tabs,
  defaultTab,
  onChange,
  orientation = 'horizontal',
  fullWidth,
  className
}: TabsProps) => {
  const defaultIndex = tabs.findIndex(tab => tab.id === defaultTab);

  return (
    <Tab.Group
      defaultIndex={defaultIndex}
      onChange={index => onChange?.(tabs[index].id)}
      as="div"
      className={cn(tabsRootVariants({ orientation }), className)}
    >
      <Tab.List className={tabListVariants({ orientation, fullWidth })}>
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            disabled={tab.disabled}
            className={({ selected }) =>
              cn(tabVariants({ orientation, state: selected ? 'active' : 'inactive' }))
            }
          >
            {tab.label}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className={orientation === 'vertical' ? 'flex-1' : ''}>
        {tabs.map(tab => (
          <Tab.Panel
            key={tab.id}
            className={tabPanelVariants({ orientation })}
          >
            {tab.content}
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
};
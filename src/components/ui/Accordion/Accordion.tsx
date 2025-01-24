import * as React from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  type?: 'single' | 'multiple';
  defaultOpen?: string[];
  className?: string;
  iconPosition?: 'left' | 'right';
}

export const Accordion = ({
  items,
  type = 'single',
  defaultOpen = [],
  className,
  iconPosition = 'right'
}: AccordionProps) => {
  const [openItems, setOpenItems] = React.useState<string[]>(defaultOpen);

  const toggleItem = (itemId: string) => {
    if (type === 'single') {
      setOpenItems(openItems.includes(itemId) ? [] : [itemId]);
    } else {
      setOpenItems(
        openItems.includes(itemId)
          ? openItems.filter(id => id !== itemId)
          : [...openItems, itemId]
      );
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item) => (
        <Disclosure
          key={item.id}
          as="div"
          defaultOpen={defaultOpen.includes(item.id)}
          className="rounded-lg border border-gray-200 dark:border-gray-700"
        >
          {({ open }) => (
            <>
              <Disclosure.Button
                disabled={item.disabled}
                onClick={() => toggleItem(item.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium',
                  'focus:outline-none focus-visible:ring focus-visible:ring-primary-500 focus-visible:ring-opacity-75',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  open
                    ? 'bg-gray-50 dark:bg-gray-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800',
                  iconPosition === 'left' && 'flex-row-reverse justify-end gap-2'
                )}
              >
                <span>{item.title}</span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-gray-500 transition-transform duration-200',
                    open && 'transform rotate-180'
                  )}
                />
              </Disclosure.Button>
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {item.content}
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  );
};
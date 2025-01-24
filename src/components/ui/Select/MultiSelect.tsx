import { Fragment, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { SelectOption } from './Select';

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: SelectOption[];
  label?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  searchable?: boolean;
}

export const MultiSelect = ({
  value,
  onChange,
  options,
  label,
  error,
  disabled,
  placeholder = 'Select options...',
  className,
  searchable = true
}: MultiSelectProps) => {
  const [query, setQuery] = useState('');

  const filteredOptions = query === ''
    ? options
    : options.filter((option) =>
        option.label
          .toLowerCase()
          .includes(query.toLowerCase())
      );

  const selectedOptions = options.filter(option => 
    value.includes(option.value)
  );

  const handleDeselect = (optionValue: string) => {
    onChange(value.filter(v => v !== optionValue));
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          {label}
        </label>
      )}
      <Combobox
        value={value}
        onChange={onChange}
        multiple
        disabled={disabled}
      >
        <div className="relative">
          <div className="relative">
            <div className={cn(
              "min-h-[2.5rem] w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              disabled && "bg-gray-50 text-gray-500"
            )}>
              <div className="flex flex-wrap gap-1">
                {selectedOptions.map((option) => (
                  <span
                    key={option.value}
                    className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-sm font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                  >
                    {option.label}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeselect(option.value);
                      }}
                      className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary-200 dark:hover:bg-primary-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {searchable && (
                  <Combobox.Input
                    className="border-none p-0 focus:ring-0 dark:bg-gray-800 dark:text-white"
                    placeholder={selectedOptions.length === 0 ? placeholder : ''}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                )}
              </div>
            </div>
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 sm:text-sm">
              {filteredOptions.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                  Nothing found.
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <Combobox.Option
                    key={option.value}
                    className={({ active }) =>
                      cn(
                        'relative cursor-pointer select-none py-2 pl-10 pr-4',
                        active ? 'bg-primary-600 text-white' : 'text-gray-900 dark:text-white'
                      )
                    }
                    value={option.value}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={cn('block truncate', selected && 'font-medium')}>
                          {option.label}
                        </span>
                        {selected && (
                          <span
                            className={cn(
                              'absolute inset-y-0 left-0 flex items-center pl-3',
                              active ? 'text-white' : 'text-primary-600'
                            )}
                          >
                            <Check className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
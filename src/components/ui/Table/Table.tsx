import * as React from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '../../../utils/cn';

type SortDirection = 'asc' | 'desc' | null;

interface Column<T> {
  id: string;
  header: React.ReactNode;
  cell: (item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  align?: 'left' | 'center' | 'right';
  showOnMobile?: boolean;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  className?: string;
}

export function Table<T>({
  data,
  columns,
  pageSize = 10,
  onRowClick,
  loading,
  className
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: SortDirection;
  }>({ key: '', direction: null });
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Filter data based on search and column filters
  const filteredData = React.useMemo(() => {
    return data.filter(item => {
      // Apply search filter
      if (searchTerm) {
        const searchable = columns
          .filter(col => col.filterable)
          .some(col => {
            const cellValue = col.cell(item)?.toString().toLowerCase();
            return cellValue?.includes(searchTerm.toLowerCase());
          });
        if (!searchable) return false;
      }

      // Apply column filters
      return Object.entries(filters).every(([key, value]) => {
        const column = columns.find(col => col.id === key);
        if (!column || !value) return true;
        const cellValue = column.cell(item)?.toString().toLowerCase();
        return cellValue?.includes(value.toLowerCase());
      });
    });
  }, [data, columns, searchTerm, filters]);

  // Sort filtered data
  const sortedData = React.useMemo(() => {
    if (!sortConfig.direction) return filteredData;
  
    return [...filteredData].sort((a, b) => {
      const column = columns.find(col => col.id === sortConfig.key);
      if (!column) return 0;
  
      const aValue = column.cell(a)?.toString().toLowerCase() ?? '';
      const bValue = column.cell(b)?.toString().toLowerCase() ?? '';
  
      if (sortConfig.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [filteredData, sortConfig, columns]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (columnId: string) => {
    setSortConfig(current => ({
      key: columnId,
      direction:
        current.key === columnId
          ? current.direction === 'asc'
            ? 'desc'
            : current.direction === 'desc'
            ? null
            : 'asc'
          : 'asc'
    }));
  };

  const handleFilter = (columnId: string, value: string) => {
    setFilters(current => ({
      ...current,
      [columnId]: value
    }));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-md border pl-9 py-2"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border dark:border-gray-800">
        <table className={cn('w-full text-sm', className)}>
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map(column => (
                <th
                  key={column.id}
                  className={cn(
                    'border-b px-4 py-3 text-left font-medium',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    !column.showOnMobile && 'hidden sm:table-cell',
                    column.sortable && 'cursor-pointer select-none'
                  )}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth
                  }}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.header}</span>
                    {column.sortable && sortConfig.key === column.id && (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : sortConfig.direction === 'desc' ? (
                        <ArrowDown className="h-4 w-4" />
                      ) : null
                    )}
                  </div>
                  {column.filterable && (
                    <input
                      type="text"
                      placeholder="Filter..."
                      value={filters[column.id] || ''}
                      onChange={e => handleFilter(column.id, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      className="mt-1 w-full rounded border px-2 py-1"
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Loading...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No data found
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr
                  key={index}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'bg-white dark:bg-gray-900',
                    onRowClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  {columns.map(column => (
                    <td
                      key={column.id}
                      className={cn(
                        'px-4 py-3',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        !column.showOnMobile && 'hidden sm:table-cell'
                      )}
                    >
                      {column.cell(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of{' '}
            {sortedData.length} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded border p-2 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded border p-2 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
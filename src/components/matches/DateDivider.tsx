import { formatDistanceToNow } from "date-fns";

interface DateDividerProps {
    date: Date;
  }
  
  export const DateDivider = ({ date }: DateDividerProps) => (
    <div className="flex items-center justify-center my-4">
      <div className="bg-gray-200 dark:bg-gray-700 h-px flex-1" />
      <div className="px-4 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatDistanceToNow(date, { addSuffix: true })}
        </span>
      </div>
      <div className="bg-gray-200 dark:bg-gray-700 h-px flex-1" />
    </div>
  );
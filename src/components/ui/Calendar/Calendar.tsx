import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { Button } from '../Button';

interface CalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
  disablePastDates?: boolean;
  disableFutureDates?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export const Calendar = ({
  value = new Date(),
  onChange,
  disablePastDates,
  disableFutureDates,
  minDate,
  maxDate,
  className
}: CalendarProps) => {
  const [currentDate, setCurrentDate] = React.useState(value);
  const [selectedDate, setSelectedDate] = React.useState(value);

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onChange?.(date);
  };

  const isDateDisabled = (date: Date) => {
    if (disablePastDates && date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
    if (disableFutureDates && date > new Date()) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const renderDays = () => {
    const days = [];
    let day = 1;

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < startingDayOfWeek) {
          week.push(<td key={`empty-${j}`} className="p-0" />);
        } else if (day <= daysInMonth) {
          const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const isDisabled = isDateDisabled(currentDay);
          const isSelected = selectedDate && 
            currentDay.toDateString() === selectedDate.toDateString();
          const isToday = currentDay.toDateString() === new Date().toDateString();

          week.push(
            <td key={day} className="p-0 text-center">
              <button
                type="button" // Add this
                onClick={() => !isDisabled && handleDateSelect(currentDay)}
                disabled={isDisabled}
                className={cn(
                  "w-9 h-9 rounded-md text-sm transition-all",
                  isDisabled && "opacity-50 cursor-not-allowed",
                  isSelected && "bg-primary text-primary-foreground",
                  isToday && !isSelected && "bg-accent text-accent-foreground",
                  !isSelected && !isToday && !isDisabled && "hover:bg-muted"
                )}
              >
                {day}
              </button>
            </td>
          );
          day++;
        }
      }
      if (week.length > 0) days.push(<tr key={i} className="flex w-full mt-2">{week}</tr>);
      if (day > daysInMonth) break;
    }

    return days;
  };

  return (
    <div className={cn("p-4 bg-background border rounded-lg shadow-sm", className)}>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-semibold">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <table className="w-full">
        <thead>
          <tr className="flex">
            {weekDays.map(day => (
              <th key={day} className="flex-1 text-sm font-normal text-muted-foreground">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="mt-2">
          {renderDays()}
        </tbody>
      </table>
    </div>
  );
};
// src/utils/dateUtils.ts

export type DateFormat = 'full' | 'date' | 'time' | 'dateTime' | 'relative';

const formatOptions = {
  full: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  },
  date: {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  },
  time: {
    hour: '2-digit',
    minute: '2-digit'
  },
  dateTime: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
} as const;

export const formatDate = (
  timestamp: { seconds: number; nanoseconds: number } | Date | number,
  format: DateFormat = 'dateTime'
): string => {
  let date: Date;

  // Convert Firebase Timestamp to Date
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    date = new Date(timestamp.seconds * 1000);
  } 
  // Convert number (milliseconds) to Date
  else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  }
  // Use timestamp if it's already a Date
  else {
    date = timestamp as Date;
  }

  // Handle relative time format
  if (format === 'relative') {
    return formatRelativeTime(date);
  }

  // Format using Intl.DateTimeFormat
  return new Intl.DateTimeFormat(
    'en-US',
    formatOptions[format]
  ).format(date);
};

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  // For older dates, return formatted date
  return new Intl.DateTimeFormat('en-US', formatOptions.date).format(date);
};
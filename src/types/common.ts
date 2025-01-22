export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Utility type for components that need loading/error states
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Common UI component props
export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

export type Theme = 'light' | 'dark';
export type Size = 'sm' | 'md' | 'lg';
export type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
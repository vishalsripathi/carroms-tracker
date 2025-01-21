// src/components/common/FormattedDate.tsx

import React from 'react';
import { formatDate, DateFormat } from '../../utils/dateUtils';

interface FormattedDateProps {
  date: { seconds: number; nanoseconds: number } | Date | number;
  format?: DateFormat;
  className?: string;
}

const FormattedDate: React.FC<FormattedDateProps> = ({
  date,
  format = 'dateTime',
  className = ''
}) => {
  return (
    <span className={className} title={formatDate(date, 'full')}>
      {formatDate(date, format)}
    </span>
  );
};

export default FormattedDate;
'use client';

import * as React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, onValueChange, onChange, children, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) onChange(e);
      if (onValueChange) onValueChange(e.target.value);
    };

    return (
      <select
        ref={ref}
        className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        onChange={handleChange}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

// Simple wrapper components for compatibility
const SelectTrigger = ({ children, ...props }: any) => <div {...props}>{children}</div>;
const SelectValue = ({ children, ...props }: any) => <span {...props}>{children}</span>;
const SelectContent = ({ children, ...props }: any) => <div {...props}>{children}</div>;
const SelectItem = ({ children, value, ...props }: any) => <option value={value} {...props}>{children}</option>;

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
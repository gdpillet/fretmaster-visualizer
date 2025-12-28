import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select: React.FC<SelectProps> = ({ label, className, children, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`
            flex h-10 w-full items-center justify-between rounded-md border border-border 
            bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground 
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 
            disabled:cursor-not-allowed disabled:opacity-50 appearance-none
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
      </div>
    </div>
  );
};

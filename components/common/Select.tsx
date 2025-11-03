import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  id: string;
  options?: string[];
}

export const Select: React.FC<SelectProps> = ({ label, id, options, children, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full px-3 py-2 bg-light-bg/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none transition-colors ${className}`}
        {...props}
      >
        {options ? options.map(option => (
          <option key={option} value={option} className="bg-light-bg-secondary dark:bg-dark-bg-secondary">{option}</option>
        )) : children}
      </select>
    </div>
  );
};
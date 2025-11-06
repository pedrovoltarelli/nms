import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  id: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, id, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`w-full px-4 py-2 bg-light-bg/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors placeholder:text-light-text-secondary/70 dark:placeholder:text-dark-text-secondary/50 ${className}`}
        {...props}
      />
    </div>
  );
};
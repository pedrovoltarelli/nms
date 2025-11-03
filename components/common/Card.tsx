import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-light-bg-secondary/50 dark:bg-dark-bg-secondary/50 rounded-2xl border border-light-border/80 dark:border-dark-border/80 shadow-lg backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
};
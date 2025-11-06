import React from 'react';

interface PageTitleProps {
    title: string;
    subtitle: string;
}

export const PageTitle: React.FC<PageTitleProps> = ({ title, subtitle }) => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">{title}</h1>
            <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary mt-1">{subtitle}</p>
        </div>
    );
};
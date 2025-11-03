import React, { useContext } from 'react';
import { User } from '../types';
import { AppContext } from '../pages/Dashboard';

const SunIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 12a5 5 0 100-10 5 5 0 000 10z" /></svg>);
const MoonIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>);
const MenuIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>);

interface HeaderProps {
    user: User;
    setSidebarOpen: (isOpen: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ user, setSidebarOpen }) => {
    const context = useContext(AppContext);

    if (!context) return null;

    const { theme, setTheme } = context;

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <header className="h-20 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-lg border-b border-light-border/80 dark:border-dark-border/80 flex-shrink-0">
            <div className="flex items-center justify-between h-full px-6 lg:px-8">
                {/* Hamburger Menu for mobile */}
                <button 
                    className="lg:hidden text-light-text-secondary dark:text-dark-text-secondary"
                    onClick={() => setSidebarOpen(true)}
                >
                    <MenuIcon className="w-6 h-6" />
                </button>

                {/* Placeholder for search or other header items. Kept for alignment. */}
                <div className="hidden lg:block"></div>

                <div className="flex items-center gap-4">
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary text-light-text-secondary dark:text-dark-text-secondary">
                        {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                    </button>
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg">
                            {user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                            <p className="font-semibold text-sm text-light-text dark:text-dark-text">{user.name}</p>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{user.email}</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
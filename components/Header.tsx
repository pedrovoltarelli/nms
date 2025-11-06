import React from 'react';
import { User } from '../types';

const MenuIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>);

interface HeaderProps {
    user: User;
    setSidebarOpen: (isOpen: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ user, setSidebarOpen }) => {
    return (
        <header className="h-20 bg-dark-bg/80 backdrop-blur-lg border-b border-dark-border/80 flex-shrink-0">
            <div className="flex items-center justify-between h-full px-6 lg:px-8">
                {/* Hamburger Menu for mobile */}
                <button 
                    className="lg:hidden text-dark-text-secondary"
                    onClick={() => setSidebarOpen(true)}
                >
                    <MenuIcon className="w-6 h-6" />
                </button>

                {/* Placeholder for search or other header items. Kept for alignment. */}
                <div className="hidden lg:block"></div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg">
                            {user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                            <p className="font-semibold text-sm text-dark-text">{user.name}</p>
                            <p className="text-xs text-dark-text-secondary">{user.email}</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
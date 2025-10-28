import React from 'react';
import { SparklesIcon, HistoryIcon, SidebarCloseIcon } from './Icons';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarVisible: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarVisible }) => {
  return (
    <header className="bg-surface/50 backdrop-blur-sm border-b border-accent-secondary shadow-md flex-shrink-0">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div>
            <div className="flex items-center space-x-3">
            <SparklesIcon className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold text-primary tracking-tight">
                PromptPix
            </h1>
            </div>
            <p className="text-secondary mt-1">Transform your images into creative AI art prompts.</p>
        </div>
        <div>
            <button 
                onClick={onToggleSidebar}
                className="p-2 rounded-full text-secondary hover:bg-surface hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                aria-label={isSidebarVisible ? "Hide sidebar" : "Show sidebar"}
                title={isSidebarVisible ? "Hide sidebar" : "Show sidebar"}
            >
                {isSidebarVisible ? <SidebarCloseIcon className="w-6 h-6" /> : <HistoryIcon className="w-6 h-6" />}
            </button>
        </div>
      </div>
    </header>
  );
};

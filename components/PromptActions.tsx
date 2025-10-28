import React, { useState, useEffect, useRef } from 'react';
import { CopyIcon, CheckIcon, DownloadIcon } from './Icons';
import { exportPrompt } from '../utils/exportUtils';

interface PromptActionsProps {
  prompt: string;
}

export const PromptActions: React.FC<PromptActionsProps> = ({ prompt }) => {
  const [copied, setCopied] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = (format: 'txt' | 'json' | 'md') => {
    exportPrompt(prompt, format);
    setIsExportOpen(false);
  };

  const buttonClass = "p-2 rounded-full bg-background text-primary hover:bg-highlight-hover/20 transition-colors focus:outline-none focus:ring-2 focus:ring-accent";

  return (
    <>
      <button
        onClick={handleCopy}
        className={buttonClass}
        aria-label="Copy prompt"
        title="Copy prompt"
      >
        {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
      </button>
      
      <div className="relative" ref={exportRef}>
        <button
          onClick={() => setIsExportOpen(prev => !prev)}
          className={buttonClass}
          aria-label="Export prompt"
          title="Export prompt"
        >
          <DownloadIcon className="w-5 h-5" />
        </button>
        {isExportOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-surface border border-accent-secondary/30 rounded-lg shadow-lg z-10 overflow-hidden">
            <button onClick={() => handleExport('txt')} className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-highlight-hover/20">TXT</button>
            <button onClick={() => handleExport('json')} className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-highlight-hover/20">JSON</button>
            <button onClick={() => handleExport('md')} className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-highlight-hover/20">Markdown</button>
          </div>
        )}
      </div>
    </>
  );
};
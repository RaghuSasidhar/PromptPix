import React, { useState } from 'react';
import type { BatchResult } from '../App';
import { CopyIcon, CheckIcon, ErrorIcon } from './Icons';

interface BatchResultCardProps {
  result: BatchResult;
}

const MiniLoader: React.FC = () => (
    <div className="space-y-2 animate-pulse">
        <div className="h-4 bg-background rounded w-3/4"></div>
        <div className="h-4 bg-background rounded w-1/2"></div>
    </div>
);


export const BatchResultCard: React.FC<BatchResultCardProps> = ({ result }) => {
    const { dataUrl, prompt, isLoading, error } = result;
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!prompt) return;
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-surface rounded-2xl overflow-hidden flex items-start space-x-4 p-4 border border-accent-secondary/10 shadow-panel">
            <img 
                src={dataUrl} 
                alt="Uploaded" 
                className="w-24 h-24 object-cover rounded-lg flex-shrink-0" 
            />
            <div className="flex-grow pt-1 w-full min-h-[6rem]">
                {isLoading && <MiniLoader />}
                {error && (
                    <div className="text-red-400 text-sm flex items-start space-x-2">
                        <ErrorIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                           <p className="font-semibold">Error</p>
                           <p>{error}</p>
                        </div>
                    </div>
                )}
                {prompt && (
                    <div className="relative">
                        <p className="text-sm text-primary font-mono whitespace-pre-wrap pr-8">{prompt}</p>
                        <button
                            onClick={handleCopy}
                            className="absolute -top-1 right-0 p-1.5 rounded-full text-secondary hover:bg-background hover:text-primary"
                            aria-label="Copy prompt"
                            title="Copy prompt"
                        >
                            {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
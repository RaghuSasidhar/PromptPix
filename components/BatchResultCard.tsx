import React, { useState } from 'react';
import type { BatchResult } from '../App';
import { CopyIcon, CheckIcon, ErrorIcon, PhotoIcon } from './Icons';

interface BatchResultCardProps {
  result: BatchResult;
  onGenerateImage: (id: string) => void;
}

const MiniLoader: React.FC<{text: string}> = ({text}) => (
    <div className="flex items-center space-x-2 text-sm text-secondary">
        <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <span>{text}</span>
    </div>
);


export const BatchResultCard: React.FC<BatchResultCardProps> = ({ result, onGenerateImage }) => {
    const { id, dataUrl, prompt, isLoading, error, isGeneratingImage, generatedImageUrl, imageError } = result;
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!prompt) return;
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-surface rounded-2xl overflow-hidden flex flex-col border border-accent-secondary/10 shadow-panel">
            <div className="flex items-start space-x-4 p-4">
                <img 
                    src={dataUrl} 
                    alt="Uploaded" 
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0" 
                />
                <div className="flex-grow pt-1 w-full min-h-[6rem]">
                    {isLoading && <MiniLoader text="Analyzing..." />}
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
            {(prompt || isGeneratingImage || generatedImageUrl || imageError) && (
                <div className="border-t border-accent-secondary/20 bg-background/50 p-3 min-h-[52px] flex items-center justify-center">
                    {prompt && !isGeneratingImage && !generatedImageUrl && (
                        <button
                            onClick={() => onGenerateImage(id)}
                            className="px-3 py-1.5 text-xs font-bold text-background uppercase tracking-wider bg-accent rounded-full transition-all duration-300 hover:shadow-glow-accent disabled:bg-secondary disabled:cursor-not-allowed flex items-center"
                        >
                            <PhotoIcon className="w-4 h-4 mr-1.5" />
                            Generate Image
                        </button>
                    )}
                    {isGeneratingImage && <MiniLoader text="Generating Image..." />}
                    {imageError && (
                         <div className="text-red-400 text-xs flex items-center space-x-2">
                            <ErrorIcon className="w-4 h-4 flex-shrink-0" />
                            <p className="truncate" title={imageError}>{imageError}</p>
                        </div>
                    )}
                    {generatedImageUrl && (
                        <img src={generatedImageUrl} alt="Generated from prompt" className="w-full h-auto object-contain rounded-md" />
                    )}
                </div>
            )}
        </div>
    );
};
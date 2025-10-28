import React, { useState } from 'react';
import { ClearIcon } from './Icons';

interface PromptInputProps {
  onContinue: (prompt: string) => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({ onContinue }) => {
  const [prompt, setPrompt] = useState('');

  const handleContinue = () => {
    if (prompt.trim()) {
      onContinue(prompt.trim());
    }
  };

  return (
    <div className="w-full space-y-4">
        <div className="relative w-full h-72 bg-surface rounded-2xl p-6 flex flex-col group shadow-panel">
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to create. For example: 'A majestic lion with a crown of stars, in a cosmic nebula, digital painting, 4k'."
                className="w-full h-full bg-transparent text-primary text-lg placeholder-secondary/50 resize-none focus:outline-none flex-grow"
                aria-label="Prompt input"
            />
            {prompt && (
                <button
                onClick={() => setPrompt('')}
                className="absolute top-4 right-4 bg-background text-secondary p-1.5 rounded-full hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Clear prompt"
                >
                <ClearIcon className="w-4 h-4" strokeWidth="2" />
                </button>
            )}
        </div>
        <button
            onClick={handleContinue}
            disabled={!prompt.trim()}
            className="w-full mt-4 px-4 py-3 text-base font-bold text-background uppercase tracking-wider bg-highlight rounded-full transition-all duration-300 hover:bg-accent disabled:bg-secondary disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center"
        >
            Continue
        </button>
    </div>
  );
};
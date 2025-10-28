import React from 'react';
import { Loader } from './Loader';
import { ErrorIcon, PhotoIcon } from './Icons';
import type { PromptRating } from '../App';
import { PromptAnalysis } from './PromptAnalysis';
import { PromptRefiner } from './PromptRefiner';
import { PromptActions } from './PromptActions';


interface PromptDisplayProps {
  prompt: string;
  isLoading: boolean;
  error: string | null;
  isGeneratingImage: boolean;
  onGenerateImage: () => void;
  rating: PromptRating | null;
  isRating: boolean;
  onRefine: (level: 'concise' | 'descriptive') => void;
  onResetRefinement: () => void;
}

export const PromptDisplay: React.FC<PromptDisplayProps> = (props) => {
  const { prompt, isLoading, error, isGeneratingImage, onGenerateImage, rating, isRating, onRefine, onResetRefinement } = props;

  if (isLoading && !prompt) {
    return <Loader />;
  }
  
  if (error) {
    return (
      <div className="text-center text-red-400 flex flex-col items-center p-4 bg-surface rounded-2xl shadow-panel">
        <ErrorIcon className="w-12 h-12 mb-4" />
        <p className="font-semibold">Error</p>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!prompt) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      <div className="relative bg-surface rounded-2xl shadow-panel p-4">
        <div className={`absolute inset-0 bg-surface/50 rounded-2xl transition-opacity duration-300 ${isLoading ? 'opacity-70' : 'opacity-0'} pointer-events-none z-10`}></div>
        <div className="absolute top-4 right-4 flex flex-col space-y-2 z-20">
            <PromptActions prompt={prompt} />
        </div>
        <p className="text-primary font-mono text-base leading-relaxed whitespace-pre-wrap min-h-[120px]">
            {prompt}
        </p>
      </div>
      <PromptAnalysis rating={rating} isLoading={isRating} />
      <PromptRefiner 
        onRefine={onRefine} 
        // Fix: Pass `onResetRefinement` to the `onReset` prop as expected by `PromptRefiner`.
        onReset={onResetRefinement} 
        isDisabled={isLoading || isRating}
      />
      <button
        onClick={onGenerateImage}
        disabled={isGeneratingImage || isLoading}
        className="w-full mt-4 px-4 py-3 text-base font-bold text-background uppercase tracking-wider bg-accent rounded-full transition-all duration-300 hover:shadow-glow-accent disabled:bg-secondary disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center"
      >
        {isGeneratingImage ? (
            <>
            <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin mr-2"></div>
            Generating...
            </>
        ) : (
            <>
            <PhotoIcon className="w-5 h-5 mr-2" />
            Generate Image
            </>
        )}
      </button>
    </div>
  );
};
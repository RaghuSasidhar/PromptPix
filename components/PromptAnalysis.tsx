import React from 'react';
import { SparklesIcon } from './Icons';
import type { PromptRating } from '../App';

interface PromptAnalysisProps {
    rating: PromptRating | null;
    isLoading: boolean;
}

export const PromptAnalysis: React.FC<PromptAnalysisProps> = ({ rating, isLoading }) => {
    const baseClasses = "bg-surface rounded-2xl p-4 space-y-2 shadow-panel";

    if (isLoading) {
        return (
            <div className={`${baseClasses} animate-pulse`}>
                <div className="h-4 bg-background rounded w-1/3"></div>
                <div className="h-8 bg-background rounded w-1/4"></div>
                <div className="h-4 bg-background rounded w-full"></div>
            </div>
        );
    }

    if (!rating) return null;

    const scoreColor = rating.score >= 8 ? 'text-green-400' : rating.score >= 5 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className={baseClasses}>
            <h4 className="flex items-center text-sm font-semibold text-secondary uppercase tracking-wider">
                <SparklesIcon className="w-5 h-5 mr-2 text-accent" />
                Prompt Analysis
            </h4>
            <div className="flex items-baseline space-x-2">
                <span className={`text-3xl font-bold ${scoreColor}`}>{rating.score.toFixed(1)}</span>
                <span className="text-sm text-secondary">/ 10</span>
            </div>
            <p className="text-sm text-primary">{rating.feedback}</p>
        </div>
    );
};
import React from 'react';
import type { BatchResult } from '../App';
import { BatchResultCard } from './BatchResultCard';
import { CollectionIcon, DownloadIcon } from './Icons';
import { exportPrompt } from '../utils/exportUtils';

interface BatchResultsDisplayProps {
  results: BatchResult[];
  onGenerateBatchImage: (id: string) => void;
}

export const BatchResultsDisplay: React.FC<BatchResultsDisplayProps> = ({ results, onGenerateBatchImage }) => {

  const completedCount = results.filter(r => !r.isLoading).length;
  const totalCount = results.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleExportAll = () => {
    const allPrompts = results
        .map((r, i) => `--- PROMPT ${i + 1} ---\n${r.prompt}`)
        .join('\n\n');
    exportPrompt(allPrompts, 'txt');
  }

  if (results.length === 0) {
    return (
        <div className="w-full h-full flex items-center justify-center text-center text-accent-secondary p-4">
            <div>
                <CollectionIcon className="w-20 h-20 mx-auto" />
                <p className="mt-4 text-lg font-semibold text-primary">Batch Results</p>
                <p className="mt-1 text-sm text-secondary">Your batch results will appear here</p>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-transparent overflow-hidden">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <div>
                <h3 className="text-lg font-bold text-primary">Processing... ({completedCount}/{totalCount})</h3>
                <div className="w-64 h-2 bg-surface rounded-full mt-1">
                    <div className="h-2 bg-accent rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            {completedCount === totalCount && (
                <button
                    onClick={handleExportAll}
                    className="px-4 py-2 text-sm font-semibold text-primary bg-surface hover:bg-highlight-hover/20 rounded-full flex items-center space-x-2 transition-colors"
                >
                    <DownloadIcon className="w-5 h-5" />
                    <span>Export All</span>
                </button>
            )}
        </div>
        <div className="flex-grow bg-surface/50 rounded-2xl p-4 overflow-y-auto shadow-inner">
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                {results.map((result) => (
                    <BatchResultCard key={result.id} result={result} onGenerateImage={onGenerateBatchImage} />
                ))}
            </div>
        </div>
    </div>
  );
};
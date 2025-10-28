import React from 'react';
import { MagicWandIcon } from './Icons';

export const Welcome: React.FC = () => {
  return (
    <div className="text-center text-secondary w-full py-16">
      <MagicWandIcon className="w-20 h-20 mx-auto mb-4 text-accent-secondary" />
      <h3 className="text-xl font-bold text-primary">Your Creative Companion Awaits</h3>
      <p className="mt-2 max-w-md mx-auto">Provide an input to get started. Your generated prompt, analysis, and refinement tools will appear here.</p>
    </div>
  );
};
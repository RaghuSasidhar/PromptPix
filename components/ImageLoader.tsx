import React from 'react';

export const ImageLoader: React.FC = () => {
  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="w-full aspect-square bg-surface rounded-2xl animate-pulse"></div>
      <p className="text-center font-semibold text-primary">Conjuring pixels...</p>
      <p className="text-center text-sm text-secondary">This can take up to a minute.</p>
    </div>
  );
};
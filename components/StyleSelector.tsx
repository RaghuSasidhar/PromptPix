import React, { useState } from 'react';

export const PRIMARY_STYLES = ['None', 'Photorealistic', 'Anime', 'Cartoon', 'Cinematic'];
export const SECONDARY_STYLES = [
    'Oil Painting', 'Cyberpunk', 'Steampunk', 'Watercolor', 'Low Poly', 'Art Deco', 
    'Impressionism', 'Minimalist', 'Vaporwave', 'Gothic', 'Fantasy Art'
];

interface StyleSelectorProps {
  selectedStyle: string;
  onStyleChange: (style: string) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onStyleChange }) => {
  const [showMore, setShowMore] = useState(false);

  const renderButton = (style: string) => (
    <button
        key={style}
        onClick={() => onStyleChange(style)}
        className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-accent ${
        selectedStyle === style
            ? 'bg-accent text-background'
            : 'bg-surface hover:bg-highlight-hover/20 text-secondary'
        }`}
    >
        {style}
    </button>
  );

  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold text-primary mb-3">Artistic Style</h3>
      <div className="flex flex-wrap gap-2">
        {PRIMARY_STYLES.map(renderButton)}
        <button
          onClick={() => setShowMore(!showMore)}
          className="px-3 py-1.5 text-sm font-semibold rounded-full transition-colors bg-surface hover:bg-highlight-hover/20 text-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-accent"
        >
          {showMore ? 'Less...' : 'More...'}
        </button>
        {showMore && SECONDARY_STYLES.map(renderButton)}
      </div>
    </div>
  );
};
import React from 'react';
import { ImageLoader } from './ImageLoader';
import { ErrorIcon, PhotoIcon } from './Icons';

interface ImageResultDisplayProps {
  imageUrls: string[];
  isLoading: boolean;
  error: string | null;
  hasPrompt: boolean;
}

export const ImageResultDisplay: React.FC<ImageResultDisplayProps> = ({ imageUrls, isLoading, error, hasPrompt }) => {

  const containerClasses = "w-full h-full flex items-center justify-center p-4 rounded-2xl bg-background";

  if (isLoading) {
    return <div className={containerClasses}><ImageLoader /></div>;
  }

  if (error) {
    return (
      <div className={`${containerClasses} text-center text-red-400 flex-col`}>
        <ErrorIcon className="w-12 h-12 mb-4" />
        <p className="font-semibold">Image Generation Failed</p>
        <p className="text-sm text-red-500 max-w-xs">{error}</p>
      </div>
    );
  }

  if (imageUrls && imageUrls.length > 0) {
    return (
        <div className="w-full h-full flex flex-col gap-4 overflow-y-auto p-2 bg-background rounded-2xl">
            {imageUrls.map((url, index) => (
                 <img 
                    key={index}
                    src={url} 
                    alt={`AI generated image ${index + 1}`}
                    className="w-full h-auto object-contain rounded-xl flex-shrink-0 shadow-lg" 
                />
            ))}
        </div>
    );
  }

  if (hasPrompt) {
     return (
        <div className={`${containerClasses} text-center text-secondary flex-col`}>
            <PhotoIcon className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-primary">Ready to Create</h3>
            <p className="mt-1">Click "Generate Image" to bring your prompt to life.</p>
        </div>
     );
  }

  return (
    <div className={`${containerClasses} text-center text-accent-secondary flex-col`}>
        <PhotoIcon className="w-16 h-16 mx-auto" />
         <p className="mt-2 text-sm">Your generated image will appear here</p>
    </div>
  );
};
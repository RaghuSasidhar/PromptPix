import React from 'react';
import { StyleSelector } from './StyleSelector';
import { SparklesIcon } from './Icons';

interface StyleSelectionPanelProps {
    inputPreview: { type: 'image', url: string } | { type: 'text', text: string };
    selectedStyle: string;
    onStyleChange: (style: string) => void;
    onContinue: () => void;
    isGenerating: boolean;
}

export const StyleSelectionPanel: React.FC<StyleSelectionPanelProps> = ({ 
    inputPreview, 
    selectedStyle, 
    onStyleChange, 
    onContinue, 
    isGenerating 
}) => {
  return (
    <div className="w-full max-w-lg space-y-6">
        <div>
            <h2 className="text-xl font-bold text-primary mb-2">2️⃣ Select a Style</h2>
            <p className="text-secondary text-sm">Choose an artistic style to guide the AI. Select 'None' for a surprise!</p>
        </div>

        <div className="bg-surface rounded-2xl p-4 shadow-panel">
            {inputPreview.type === 'image' ? (
                <img src={inputPreview.url} alt="Input preview" className="w-full h-auto max-h-64 object-contain rounded-lg mb-4" />
            ) : (
                <div className="bg-background rounded-lg p-3 max-h-64 overflow-y-auto">
                    <p className="text-primary font-mono text-sm whitespace-pre-wrap">{inputPreview.text}</p>
                </div>
            )}
        </div>
        
        <div className="bg-surface rounded-2xl p-4 shadow-panel">
            <StyleSelector selectedStyle={selectedStyle} onStyleChange={onStyleChange} />
        </div>

        <button
            onClick={onContinue}
            disabled={isGenerating}
            className="w-full mt-4 px-4 py-3 text-base font-bold text-background uppercase tracking-wider bg-accent rounded-full transition-all duration-300 hover:shadow-glow-accent disabled:bg-secondary disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center"
        >
            {isGenerating ? (
                <>
                    <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin mr-2"></div>
                    Generating...
                </>
            ) : (
                <>
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Generate Prompt
                </>
            )}
        </button>
    </div>
  );
};
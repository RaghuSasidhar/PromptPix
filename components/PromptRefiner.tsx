import React, { useState, useEffect } from 'react';

interface PromptRefinerProps {
    onRefine: (level: 'concise' | 'descriptive') => void;
    onReset: () => void;
    isDisabled: boolean;
}

export const PromptRefiner: React.FC<PromptRefinerProps> = ({ onRefine, onReset, isDisabled }) => {
    const [value, setValue] = useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const level = parseInt(e.target.value, 10);
        setValue(level);
    };

    const handleMouseUp = () => {
        if (value === -1) {
            onRefine('concise');
        } else if (value === 1) {
            onRefine('descriptive');
        } else {
            onReset();
        }
    }
    
    useEffect(() => {
        if(isDisabled) {
            setValue(0);
        }
    }, [isDisabled]);

    return (
        <div className="bg-surface rounded-2xl p-4 shadow-panel">
             <h4 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">Refine Prompt</h4>
             <div className="flex items-center space-x-3 pt-2">
                <span className="text-xs font-medium text-secondary uppercase">Concise</span>
                <input
                    type="range"
                    min="-1"
                    max="1"
                    step="1"
                    value={value}
                    onChange={handleChange}
                    onMouseUp={handleMouseUp}
                    onTouchEnd={handleMouseUp}
                    disabled={isDisabled}
                    className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-accent disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span className="text-xs font-medium text-secondary uppercase">Descriptive</span>
             </div>
        </div>
    );
};
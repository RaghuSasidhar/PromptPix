import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  children: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onConfirm, onCancel, title, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-surface rounded-2xl shadow-xl p-8 w-full max-w-md border border-accent-secondary/30">
        <h3 id="modal-title" className="text-xl font-bold text-primary mb-3">
          {title}
        </h3>
        <div className="text-secondary mb-8">
          {children}
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider bg-background text-primary hover:bg-highlight-hover/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider bg-highlight text-white hover:bg-accent hover:text-background transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
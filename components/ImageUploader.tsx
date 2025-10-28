import React, { useState, useCallback } from 'react';
import { toBase64 } from '../utils/fileUtils';
import { PhotoIcon } from './Icons';

interface ImageUploaderProps {
  onFilesUpload: (files: { base64: string, mimeType: string, file: File }[]) => void;
  isDisabled: boolean;
  mode: 'single' | 'batch';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onFilesUpload, isDisabled, mode }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileProcessing = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const processedFiles = await Promise.all(
      Array.from(files).map(async (file) => {
        const base64 = await toBase64(file);
        return { base64, mimeType: file.type, file };
      })
    );
    onFilesUpload(processedFiles);
  }, [onFilesUpload]);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDisabled) setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isDisabled) return;
    handleFileProcessing(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileProcessing(e.target.files);
    e.target.value = ''; // Reset input to allow re-uploading the same file
  };

  const borderStyle = isDragging 
    ? 'border-accent' 
    : 'border-accent-secondary/30';

  const uploaderText = mode === 'single' ? 'Drag & drop an image or click to upload' : 'Drag & drop images or click to upload';

  return (
    <label
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative block w-full max-w-lg p-10 text-center border-2 border-dashed bg-surface/50 rounded-2xl cursor-pointer transition-all duration-300 ${borderStyle} ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:border-accent-secondary hover:bg-surface'}`}
    >
      <div className="flex flex-col items-center">
        <PhotoIcon className={`w-16 h-16 text-secondary transition-colors duration-300 ${isDragging ? 'text-accent' : ''}`} />
        <p className="mt-4 text-lg font-semibold text-primary">{uploaderText}</p>
        <p className="text-sm text-secondary">Supports JPG, PNG, WEBP</p>
      </div>
      <input
        type="file"
        className="hidden"
        accept="image/jpeg, image/png, image/webp"
        multiple={mode === 'batch'}
        onChange={handleFileChange}
        disabled={isDisabled}
      />
    </label>
  );
};
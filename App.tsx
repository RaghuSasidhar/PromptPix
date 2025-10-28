import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { PromptDisplay } from './components/PromptDisplay';
import { Welcome } from './components/Welcome';
import { generateImagePrompt, generateImage, ratePrompt, refinePrompt } from './services/geminiService';
import { ImageResultDisplay } from './components/ImageResultDisplay';
import { ConfirmationModal } from './components/ConfirmationModal';
import { HistoryIcon, SparklesIcon, CollectionIcon, SidebarCloseIcon, TrashIcon, PhotoIcon, PencilIcon } from './components/Icons';
import { BatchResultsDisplay } from './components/BatchResultsDisplay';
import { fileToDataUrl } from './utils/fileUtils';
import { useDebounce } from './hooks/useDebounce';
import { PromptInput } from './components/PromptInput';
import { StyleSelectionPanel } from './components/StyleSelectionPanel';
import { PRIMARY_STYLES, SECONDARY_STYLES } from './components/StyleSelector';


export interface PromptRating {
  score: number;
  feedback: string;
}

export interface HistoryItem {
  id: string;
  prompt: string;
  imageUrl: string;
  sourceImageUrl: string;
  rating: PromptRating | null;
}

export interface BatchResult {
    id: string;
    dataUrl: string;
    prompt: string;
    isLoading: boolean;
    error: string | null;
    isGeneratingImage: boolean;
    generatedImageUrl: string | null;
    imageError: string | null;
}

export interface BatchHistoryItem {
  id: string;
  timestamp: string;
  results: Omit<BatchResult, 'isLoading' | 'error' | 'isGeneratingImage' | 'imageError'>[];
}

type AppMode = 'image-to-prompt' | 'text-to-image' | 'batch';
type WorkflowStep = 'input' | 'style' | 'review';

const HistorySidebar: React.FC<{
    history: HistoryItem[];
    batchHistory: BatchHistoryItem[];
    isVisible: boolean;
    onSelect: (item: HistoryItem) => void;
    onSelectBatch: (item: BatchHistoryItem) => void;
    onDelete: (id: string, type: 'single' | 'batch') => void;
}> = ({ history, batchHistory, isVisible, onSelect, onSelectBatch, onDelete }) => {
    if (!isVisible) return null;

    return (
        <aside className="w-full h-full bg-surface/80 backdrop-blur-sm flex flex-col overflow-y-auto">
            <div className="p-4 border-b border-accent-secondary/30">
                <h2 className="text-xl font-bold text-primary flex items-center">
                    <HistoryIcon className="w-6 h-6 mr-3 text-accent" />
                    History
                </h2>
            </div>
            
            <div className="flex-grow">
                {history.length > 0 && (
                    <div className="p-4">
                        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">Single Prompts</h3>
                        {history.map((item) => (
                            <div key={item.id} className="group relative mb-2">
                                <button
                                    onClick={() => onSelect(item)}
                                    className="w-full flex items-center p-2 text-left bg-background/50 hover:bg-highlight-hover/20 rounded-lg transition-colors"
                                >
                                    <img src={item.imageUrl} alt="Generated" className="w-14 h-14 object-cover rounded-md flex-shrink-0" />
                                    <div className="ml-3 overflow-hidden">
                                        <p className="text-sm font-medium text-primary truncate">{item.prompt}</p>
                                    </div>
                                </button>
                                <button onClick={() => onDelete(item.id, 'single')} className="absolute top-1 right-1 p-1 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TrashIcon className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {batchHistory.length > 0 && (
                     <div className="p-4 border-t border-accent-secondary/30">
                        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">Batch Jobs</h3>
                         {batchHistory.map((item) => (
                             <div key={item.id} className="group relative mb-2">
                                 <button
                                     onClick={() => onSelectBatch(item)}
                                     className="w-full flex items-center p-2 text-left bg-background/50 hover:bg-highlight-hover/20 rounded-lg transition-colors"
                                 >
                                     <div className="w-14 h-14 grid grid-cols-2 grid-rows-2 gap-0.5 flex-shrink-0">
                                        {item.results.slice(0, 4).map(r => <img key={r.id} src={r.dataUrl} className="w-full h-full object-cover rounded-sm" />)}
                                     </div>
                                     <div className="ml-3 overflow-hidden">
                                         <p className="text-sm font-medium text-primary">{item.results.length} Prompts</p>
                                         <p className="text-xs text-secondary">{new Date(item.timestamp).toLocaleString()}</p>
                                     </div>
                                 </button>
                                <button onClick={() => onDelete(item.id, 'batch')} className="absolute top-1 right-1 p-1 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TrashIcon className="w-3 h-3" />
                                </button>
                             </div>
                         ))}
                     </div>
                )}
                
                {history.length === 0 && batchHistory.length === 0 && (
                    <div className="p-4 text-center text-secondary text-sm mt-8">
                        Your generated prompts and batch jobs will appear here.
                    </div>
                )}
            </div>
        </aside>
    );
};


const App: React.FC = () => {
  // Global State
  const [appMode, setAppMode] = useState<AppMode>('image-to-prompt');
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>('input');
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => JSON.parse(localStorage.getItem('promptpix_history') || '[]'));
  const [batchHistory, setBatchHistory] = useState<BatchHistoryItem[]>(() => JSON.parse(localStorage.getItem('promptpix_batch_history') || '[]'));

  // Shared State
  const [prompt, setPrompt] = useState<string>('');
  const [originalPrompt, setOriginalPrompt] = useState<string>('');
  const [style, setStyle] = useState<string>('None');
  const [rating, setRating] = useState<PromptRating | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  
  // Loading & Error State
  const [isLoadingPrompt, setIsLoadingPrompt] = useState<boolean>(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [isRating, setIsRating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  
  // Mode-specific State
  const [sourceImage, setSourceImage] = useState<{ base64: string, mimeType: string, dataUrl: string } | null>(null);
  const [textInput, setTextInput] = useState('');
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const debouncedTextInput = useDebounce(textInput, 500);

  // Effects for LocalStorage persistence
  useEffect(() => { localStorage.setItem('promptpix_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('promptpix_batch_history', JSON.stringify(batchHistory)); }, [batchHistory]);

  const resetAllStates = useCallback(() => {
    setWorkflowStep('input');
    setPrompt('');
    setOriginalPrompt('');
    setRating(null);
    setGeneratedImages([]);
    setError(null);
    setImageError(null);
    setIsLoadingPrompt(false);
    setIsGeneratingImage(false);
    setIsRating(false);
    setSourceImage(null);
    setTextInput('');
    setBatchResults([]);
  }, []);
  
  const handleModeChange = (mode: AppMode) => {
    if (appMode !== mode) {
        resetAllStates();
        setAppMode(mode);
    }
  }

  const handleTextContinue = (inputText: string) => {
    resetAllStates();
    setTextInput(inputText);
    setWorkflowStep('style');
  };

  const handleStyleSelectionContinue = useCallback(async () => {
    let finalStyle = style;
    if (style === 'None') {
        const allStyles = [...PRIMARY_STYLES.filter(s => s !== 'None'), ...SECONDARY_STYLES];
        finalStyle = allStyles[Math.floor(Math.random() * allStyles.length)];
        setStyle(finalStyle);
    }

    if (appMode === 'image-to-prompt' && sourceImage) {
        setIsLoadingPrompt(true);
        setError(null);
        setWorkflowStep('review');
        try {
            const newPrompt = await generateImagePrompt(sourceImage.base64, sourceImage.mimeType, finalStyle);
            setPrompt(newPrompt);
            setOriginalPrompt(newPrompt);
        } catch (e: any) {
            setError(e.message || 'Failed to generate prompt.');
        } finally {
            setIsLoadingPrompt(false);
        }
    } else if (appMode === 'text-to-image') {
        setWorkflowStep('review');
    }

  }, [style, appMode, sourceImage, textInput]);


  const handleFilesUpload = useCallback(async (files: { base64: string, mimeType: string, file: File }[]) => {
    if (appMode === 'image-to-prompt') {
        const firstFile = files[0];
        if (!firstFile) return;
        
        const dataUrl = `data:${firstFile.mimeType};base64,${firstFile.base64}`;
        resetAllStates();
        setSourceImage({ base64: firstFile.base64, mimeType: firstFile.mimeType, dataUrl });
        setWorkflowStep('style');

    } else { // Batch mode
        resetAllStates();
        const initialResults: BatchResult[] = await Promise.all(
            files.map(async ({ file }) => ({
                id: `${file.name}-${Date.now()}`,
                dataUrl: await fileToDataUrl(file),
                prompt: '',
                isLoading: true,
                error: null,
                isGeneratingImage: false,
                generatedImageUrl: null,
                imageError: null,
            }))
        );
        setBatchResults(initialResults);

        const promises = files.map(async ({ base64, mimeType }) => {
            try {
                const allStyles = [...PRIMARY_STYLES.filter(s => s !== 'None'), ...SECONDARY_STYLES];
                const randomStyle = allStyles[Math.floor(Math.random() * allStyles.length)];
                const generated = await generateImagePrompt(base64, mimeType, randomStyle);
                return { prompt: generated, error: null };
            } catch (e: any) {
                return { prompt: '', error: e.message || 'Failed to generate prompt' };
            }
        });

        const settledResults = await Promise.all(promises);

        let finalResults: BatchResult[] = [];
        setBatchResults(prev => {
            const updatedResults = prev.map((item, index) => ({
                ...item,
                prompt: settledResults[index].prompt,
                error: settledResults[index].error,
                isLoading: false,
            }));
            finalResults = updatedResults;
            return updatedResults;
        });

        const newBatchHistoryItem: BatchHistoryItem = {
            id: `batch-${Date.now()}`,
            timestamp: new Date().toISOString(),
            results: finalResults.map(({ id, dataUrl, prompt, generatedImageUrl }) => ({ id, dataUrl, prompt, generatedImageUrl })),
        };
        setBatchHistory(prev => [newBatchHistoryItem, ...prev]);
    }
  }, [appMode, resetAllStates]);

  const confirmModalAction = () => {
    pendingAction?.();
    setIsModalOpen(false);
    setPendingAction(null);
  };

  const cancelModalAction = () => {
      setIsModalOpen(false);
      setPendingAction(null);
  };

  const handleGenerateImage = useCallback(async () => {
    const finalPrompt = appMode === 'text-to-image' ? `${textInput} ${style !== 'None' ? `, ${style} style` : ''}` : prompt;
    if (!finalPrompt) return;

    setIsGeneratingImage(true);
    setImageError(null);
    try {
      const imageUrl = await generateImage(finalPrompt);
      setGeneratedImages(prev => [imageUrl, ...prev]);

      if (appMode === 'image-to-prompt' && sourceImage) {
        const newHistoryItem: HistoryItem = {
          id: new Date().toISOString(),
          prompt: finalPrompt,
          imageUrl,
          sourceImageUrl: sourceImage.dataUrl,
          rating,
        };
        setHistory(prev => [newHistoryItem, ...prev]);
      }

    } catch (e: any) {
      setImageError(e.message || 'Failed to generate image.');
    } finally {
      setIsGeneratingImage(false);
    }
  }, [prompt, textInput, style, sourceImage, rating, appMode]);
  
  const handleGenerateBatchImage = useCallback(async (resultId: string) => {
    const resultToUpdate = batchResults.find(r => r.id === resultId);
    if (!resultToUpdate || !resultToUpdate.prompt) return;

    setBatchResults(prev => prev.map(r => r.id === resultId ? { ...r, isGeneratingImage: true, imageError: null } : r));

    try {
        const imageUrl = await generateImage(resultToUpdate.prompt);
        setBatchResults(prev => prev.map(r => r.id === resultId ? { ...r, generatedImageUrl: imageUrl, isGeneratingImage: false } : r));
    } catch (e: any) {
        setBatchResults(prev => prev.map(r => r.id === resultId ? { ...r, imageError: e.message || 'Failed to generate image', isGeneratingImage: false } : r));
    }
  }, [batchResults]);

  const handleRefine = async (level: 'concise' | 'descriptive') => {
    const currentPrompt = appMode === 'text-to-image' ? textInput : prompt;
    if (!currentPrompt) return;
    
    setIsLoadingPrompt(true);
    setError(null);
    try {
        const refinedPrompt = await refinePrompt(currentPrompt, level);
        if (appMode === 'text-to-image') {
            setTextInput(refinedPrompt);
        } else {
            setPrompt(refinedPrompt);
        }
    } catch (e: any) {
        setError(e.message || 'Failed to refine prompt.');
    } finally {
        setIsLoadingPrompt(false);
    }
  }

  const handleResetRefinement = () => {
    if (appMode !== 'text-to-image') setPrompt(originalPrompt);
  }
  
  const handleHistorySelect = (item: HistoryItem) => {
    handleModeChange('image-to-prompt');
    setWorkflowStep('review');
    setPrompt(item.prompt);
    setOriginalPrompt(item.prompt);
    setGeneratedImages([item.imageUrl]);
    setRating(item.rating);
    setSourceImage({
        base64: item.sourceImageUrl.split(',')[1],
        mimeType: item.sourceImageUrl.split(';')[0].split(':')[1],
        dataUrl: item.sourceImageUrl
    });
  }

  const handleBatchHistorySelect = (item: BatchHistoryItem) => {
    handleModeChange('batch');
    setBatchResults(item.results.map(r => ({ 
        ...r, 
        isLoading: false, 
        error: null,
        isGeneratingImage: false,
        imageError: null,
    })));
  }

  const handleDeleteHistory = (id: string, type: 'single' | 'batch') => {
    if (type === 'single') {
        setHistory(prev => prev.filter(item => item.id !== id));
    } else {
        setBatchHistory(prev => prev.filter(item => item.id !== id));
    }
  }
  
  useEffect(() => {
    const promptToAnalyze = appMode === 'text-to-image' ? debouncedTextInput : prompt;

    if (workflowStep === 'review' && promptToAnalyze && !isLoadingPrompt) {
        setIsRating(true);
        ratePrompt(promptToAnalyze)
          .then(setRating)
          .catch(err => {
            console.error("Rating failed:", err);
            setRating(null);
          })
          .finally(() => setIsRating(false));
    } else if (!promptToAnalyze) {
        setRating(null);
    }
  }, [prompt, debouncedTextInput, appMode, workflowStep, isLoadingPrompt]);
  
  const AppNavigator = () => (
    <div className="w-full bg-surface/50 backdrop-blur-sm border-b border-accent-secondary/30 shadow-panel">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-3">
                <SparklesIcon className="w-8 h-8 text-accent" />
                <h1 className="text-3xl font-bold text-primary tracking-tight">PromptPix</h1>
            </div>

            <div className="p-1 bg-background rounded-full flex items-center space-x-1">
                {[
                    { mode: 'image-to-prompt', label: 'Image → Prompt', icon: PhotoIcon },
                    { mode: 'text-to-image', label: 'Prompt → Image', icon: PencilIcon },
                    { mode: 'batch', label: 'Batch Mode', icon: CollectionIcon },
                ].map(({ mode, label, icon: Icon }) => (
                     <button
                        key={mode}
                        onClick={() => handleModeChange(mode as AppMode)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 flex items-center space-x-2 ${
                            appMode === mode
                                ? 'bg-accent text-background shadow-glow-accent'
                                : 'text-secondary hover:bg-highlight-hover/20 hover:text-primary'
                        }`}
                     >
                        <Icon className="w-5 h-5" />
                        <span>{label}</span>
                    </button>
                ))}
            </div>

             <button 
                onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                className="p-2 rounded-full text-secondary hover:bg-surface hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label={isSidebarVisible ? "Hide history" : "Show history"}
            >
                {isSidebarVisible ? <SidebarCloseIcon className="w-6 h-6" /> : <HistoryIcon className="w-6 h-6" />}
            </button>
        </div>
    </div>
  );

  const renderContent = () => {
    // Batch mode is a separate flow
    if (appMode === 'batch') {
        return (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                <div className="flex flex-col items-center p-8 space-y-6 overflow-y-auto">
                     <div className="w-full max-w-lg text-center">
                        <h2 className="text-xl font-bold text-primary mb-2">1️⃣ Provide Input</h2>
                        <ImageUploader onFilesUpload={handleFilesUpload} mode='batch' isDisabled={isLoadingPrompt} />
                    </div>
                     {batchResults.length === 0 && (
                        <div className="text-center text-secondary pt-8">
                            <CollectionIcon className="w-16 h-16 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-primary">Batch Mode</h3>
                            <p className="mt-1">Upload multiple images to generate a prompt for each.</p>
                        </div>
                     )}
                </div>
                <div className="bg-surface border-l border-accent-secondary/30 flex flex-col p-8 overflow-hidden">
                    <h2 className="text-xl font-bold text-primary mb-4 flex-shrink-0">2️⃣ See Your Output</h2>
                    <BatchResultsDisplay results={batchResults} onGenerateBatchImage={handleGenerateBatchImage} />
                </div>
            </div>
        );
    }
    
    // Single modes (image or text) follow the workflow steps
    return (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
            <div className="flex flex-col items-center p-8 space-y-6 overflow-y-auto">
                {workflowStep === 'input' && (
                    <div className="w-full max-w-lg text-center">
                        <h2 className="text-xl font-bold text-primary mb-2">1️⃣ Provide Input</h2>
                        {appMode === 'image-to-prompt' ? (
                            <ImageUploader onFilesUpload={handleFilesUpload} mode='single' isDisabled={false} />
                        ) : (
                            <PromptInput onContinue={handleTextContinue} />
                        )}
                        <Welcome />
                    </div>
                )}
                {workflowStep === 'style' && (
                     <div className="w-full max-w-lg text-left">
                         <StyleSelectionPanel
                             inputPreview={
                                 appMode === 'image-to-prompt' && sourceImage
                                     ? { type: 'image', url: sourceImage.dataUrl }
                                     : { type: 'text', text: textInput }
                             }
                             selectedStyle={style}
                             onStyleChange={setStyle}
                             onContinue={handleStyleSelectionContinue}
                             isGenerating={isLoadingPrompt}
                         />
                     </div>
                )}
                {workflowStep === 'review' && (
                    <div className="w-full max-w-lg text-left">
                        <h2 className="text-xl font-bold text-primary mb-2">2️⃣ Review & Refine Prompt</h2>
                        <PromptDisplay 
                            prompt={appMode === 'image-to-prompt' ? prompt : textInput} 
                            isLoading={isLoadingPrompt} 
                            error={error} 
                            isGeneratingImage={isGeneratingImage} 
                            onGenerateImage={handleGenerateImage} 
                            rating={rating} isRating={isRating} 
                            onRefine={handleRefine} 
                            onResetRefinement={handleResetRefinement} 
                        />
                    </div>
                )}
            </div>
            <div className="bg-surface border-l border-accent-secondary/30 flex flex-col items-center justify-center p-8">
                <h2 className="text-xl font-bold text-primary mb-4 self-start">
                    {workflowStep === 'review' ? '3️⃣ ' : ' '}See Your Output
                </h2>
                <ImageResultDisplay imageUrls={generatedImages} isLoading={isGeneratingImage} error={imageError} hasPrompt={workflowStep === 'review'} />
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background font-sans text-primary overflow-hidden">
      <AppNavigator />
      <main className="flex-grow flex overflow-hidden">
        <div className={`flex-shrink-0 transition-all duration-300 ease-in-out ${isSidebarVisible ? 'w-80 border-r border-accent-secondary/30' : 'w-0'}`}>
           <HistorySidebar 
                history={history} 
                batchHistory={batchHistory}
                isVisible={isSidebarVisible} 
                onSelect={handleHistorySelect}
                onSelectBatch={handleBatchHistorySelect}
                onDelete={handleDeleteHistory}
            />
        </div>
        
        {renderContent()}

        <ConfirmationModal
            isOpen={isModalOpen}
            onConfirm={confirmModalAction}
            onCancel={cancelModalAction}
            title="Start a new job?"
        >
            This will clear your current work. Are you sure you want to continue?
        </ConfirmationModal>
      </main>
    </div>
  );
};

export default App;
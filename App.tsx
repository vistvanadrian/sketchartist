import React, { useState, useEffect } from 'react';
import { AppState } from './types';
import { TRANSLATIONS, SKETCH_STYLES, SKETCH_STYLE_NAMES } from './constants';
import { generateSketch, refineSketch, generateImageFromPrompt } from './sketchService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    language: 'HU',
    theme: 'LIGHT',
    sourceImage: null,
    resultImage: null,
    isProcessing: false,
    sketchStyle: 'vector-pencil',
    detailLevel: 93, 
    shadingIntensity: 40,
    strokeWidth: 50,
    roughness: 50,
    editPrompt: '',
    fileFormat: 'png',
    error: null,
    history: [],
    generationPrompt: '',
    uploadMode: 'upload',
    batchSourceImages: [],
    batchResultImages: [],
    isBatchProcessing: false,
    batchProgress: null,
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'DARK');
  }, [state.theme]);

  const handleCreateSketch = async () => {
    if (!state.sourceImage) return;
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const result = await generateSketch(
        state.sourceImage,
        state.sketchStyle,
        state.detailLevel,
        state.shadingIntensity,
        state.strokeWidth,
        state.roughness,
      );
      setState(prev => ({ ...prev, resultImage: result, isProcessing: false }));
    } catch (error: any) {
      alert("HIBA: " + error.message);
      setState(prev => ({ ...prev, isProcessing: false, error: error.message }));
    }
  };

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const dataUrl = await resizeImage(files[0]);
    setState(prev => ({ ...prev, sourceImage: dataUrl, resultImage: null, error: null }));
  };

  const resetApp = () => {
    setState(prev => ({ ...prev, sourceImage: null, resultImage: null, error: null }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4">
      <header className="max-w-4xl mx-auto flex justify-between items-center py-6">
        <h1 className="text-xl font-black uppercase">Sketch AI</h1>
        <button onClick={() => setState(p => ({ ...p, theme: p.theme === 'LIGHT' ? 'DARK' : 'LIGHT' }))}>
          {state.theme === 'LIGHT' ? '🌙' : '☀️'}
        </button>
      </header>

      <main className="max-w-4xl mx-auto">
        {!state.sourceImage ? (
          <div className="border-4 border-dashed p-10 text-center rounded-3xl bg-white dark:bg-slate-900">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4" />
            <p>Tölts fel egy fotót!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl">
              <img src={state.resultImage || state.sourceImage} className="w-full rounded-xl" alt="Preview" />
            </div>
            
            {state.isProcessing ? (
              <div className="text-center p-10 font-bold animate-pulse">A művész dolgozik...</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button onClick={handleCreateSketch} className="bg-amber-500 text-white p-4 rounded-xl font-bold">
                  RAJZOLÁS
                </button>
                <button onClick={resetApp} className="bg-slate-200 dark:bg-slate-800 p-4 rounded-xl">
                  ÚJ KÉP
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

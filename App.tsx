
import React, { useState, useEffect } from 'react';
import { AppState, SketchStyle, FileFormat } from './types';
import { TRANSLATIONS, SKETCH_STYLES, SKETCH_STYLE_NAMES } from './constants';
import { generateSketch, refineSketch, generateImageFromPrompt } from '.sketchService';

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
    setState(prev => ({ ...prev, isProcessing: true, error: null, resultImage: null, history: [] }));

    try {
      const result = await generateSketch(
        state.sourceImage,
        state.sketchStyle,
        state.detailLevel,
        state.shadingIntensity,
        state.strokeWidth,
        state.roughness,
      );
      setState(prev => ({ ...prev, resultImage: result, history: [result], isProcessing: false }));
    } catch (error: any) {
      console.error(error);
      setState(prev => ({ ...prev, isProcessing: false, error: error.message || "Ismeretlen hiba történt a rajz készítése közben." }));
    }
  };

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 2048;
          const MAX_HEIGHT = 2048;
          let { width, height } = img;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * (MAX_WIDTH / width));
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * (MAX_HEIGHT / height));
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error("Failed to get canvas context"));
          
          ctx.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        };
        img.onerror = reject;
        if (event.target?.result) {
          img.src = event.target.result as string;
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length === 1) {
      const dataUrl = await resizeImage(files[0]);
      setState(prev => ({ ...prev, sourceImage: dataUrl, resultImage: null, error: null }));
    } else {
      setState(prev => ({ ...prev, isProcessing: true, batchSourceImages: [], batchResultImages: [], error: null }));
      const resizedUrls = await Promise.all(Array.from(files).map(file => resizeImage(file as File)));
      setState(prev => ({ ...prev, isProcessing: false, batchSourceImages: resizedUrls }));
    }
  };
  
  const handleStartBatchProcessing = async () => {
      if (state.batchSourceImages.length === 0) return;
      setState(prev => ({ ...prev, isBatchProcessing: true, batchProgress: { current: 0, total: state.batchSourceImages.length }, batchResultImages: [], error: null }));
      const results = [];
      for (let i = 0; i < state.batchSourceImages.length; i++) {
        const source = state.batchSourceImages[i];
        setState(prev => ({ ...prev, batchProgress: { current: i + 1, total: state.batchSourceImages.length } }));
        try {
          const result = await generateSketch(source, state.sketchStyle, state.detailLevel, state.shadingIntensity, state.strokeWidth, state.roughness);
          results.push({ source, result });
        } catch (error: any) {
          results.push({ source, result: '', error: error.message || 'Ismeretlen hiba' });
        }
        setState(prev => ({ ...prev, batchResultImages: [...results] }));
      }
      setState(prev => ({ ...prev, isBatchProcessing: false, batchProgress: null }));
    };

  const handleGenerateFromPrompt = async () => {
    if (!state.generationPrompt) return;
    setState(prev => ({ ...prev, isProcessing: true, error: null, sourceImage: null }));
    try {
      const result = await generateImageFromPrompt(state.generationPrompt);
      setState(prev => ({ ...prev, sourceImage: result, resultImage: null, isProcessing: false, error: null }));
    } catch (error: any) {
      console.error(error);
      setState(prev => ({ ...prev, isProcessing: false, error: error.message || "Ismeretlen hiba történt a kép generálása közben." }));
    }
  };

  const handleRegenerateSketch = async () => {
    if (!state.sourceImage) return;
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    try {
      const result = await generateSketch(state.sourceImage, state.sketchStyle, state.detailLevel, state.shadingIntensity, state.strokeWidth, state.roughness);
      setState(prev => ({ ...prev, resultImage: result, history: [...prev.history, result], isProcessing: false }));
    } catch (error: any) {
      console.error(error);
      setState(prev => ({ ...prev, isProcessing: false, error: error.message || "Ismeretlen hiba történt az újragenerálás közben." }));
    }
  };

  const handleRefine = async () => {
    if (!state.resultImage || !state.editPrompt) return;
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    try {
      const refined = await refineSketch(state.resultImage, state.editPrompt, state.sketchStyle);
      setState(prev => ({ ...prev, resultImage: refined, sourceImage: refined, history: [...prev.history, refined], isProcessing: false, editPrompt: '' }));
    } catch (error: any) {
      console.error(error);
      setState(prev => ({ ...prev, isProcessing: false, error: error.message || "Ismeretlen hiba történt a módosítás során." }));
    }
  };
  
  const handleDownload = async (imageUrl: string) => {
    if (!imageUrl) return;
    
    // SVG Handling
    if (state.fileFormat === 'svg') {
       try {
          const img = new Image();
          img.src = imageUrl;
          // Fix: Added error handling to the promise so it doesn't hang if image fails to load
          await new Promise((resolve, reject) => { 
              img.onload = resolve; 
              img.onerror = () => reject(new Error("Kép betöltése sikertelen az SVG generáláshoz."));
          });
          
          // Create SVG wrapper around the image
          const svgContent = `<svg width="${img.width}" height="${img.height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <image href="${imageUrl}" x="0" y="0" width="${img.width}" height="${img.height}" />
          </svg>`;
          
          const blob = new Blob([svgContent], {type: 'image/svg+xml'});
          const url = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = `sketch-artist-ai-result-${Date.now()}.svg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
       } catch (e) {
         console.error("Failed to create SVG", e);
         alert("Nem sikerült az SVG generálás. Kérlek próbáld újra vagy válassz más formátumot.");
       }
       return;
    }

    // Default handling for PNG/JPEG
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `sketch-artist-ai-result-${Date.now()}.${state.fileFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVersionSelect = (imageUrl: string) => {
    setState(prev => ({ ...prev, resultImage: imageUrl, sourceImage: imageUrl }));
  };
  
  const resetApp = () => {
    setState(prev => ({
      ...prev, sourceImage: null, resultImage: null, error: null, history: [], generationPrompt: '', editPrompt: '', batchSourceImages: [],
      batchResultImages: [], isBatchProcessing: false, batchProgress: null,
    }));
  };

  const showMainView = state.sourceImage && !state.batchSourceImages.length;
  const showBatchView = state.batchSourceImages.length > 0 || state.batchResultImages.length > 0;
  const showUpload = !state.sourceImage && !showBatchView;

  const StyleSelector = () => {
    const getButtonStyle = (style: SketchStyle) => {
        const isSelected = state.sketchStyle === style;
        
        // Special styling for Ghibli
        if (style === 'ghibli') {
            return isSelected 
                ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/30'
                : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:border-purple-400';
        }

        return isSelected
            ? 'bg-amber-500 border-amber-500 text-white shadow-md'
            : 'bg-slate-100 dark:bg-slate-800 border-transparent hover:border-amber-400 text-slate-600 dark:text-slate-300';
    };

    return (
    <div className='space-y-3'>
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">{TRANSLATIONS.HU.sketchStyle}</h4>
        <div className="grid grid-cols-4 gap-2">
            {SKETCH_STYLES.map(style => (
                <button
                    key={style}
                    onClick={() => setState(p => ({...p, sketchStyle: style}))}
                    disabled={state.isBatchProcessing || state.isProcessing}
                    className={`px-3 py-2 text-sm font-bold rounded-lg transition-all duration-200 border-2 ${getButtonStyle(style)} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {SKETCH_STYLE_NAMES.HU[style]}
                </button>
            ))}
        </div>
    </div>
  )};

  const Sliders = () => {
    // Cast to string[] to avoid strict type checking issues with includes
    const shadingDisabledStyles: string[] = ['outline', 'flat', 'line', 'hatching', 'stipple', 'coloring-book'];
    const roughnessDisabledStyles: string[] = ['outline', 'flat', 'line', 'coloring-book', 'ghibli'];

    const isShadingDisabled = shadingDisabledStyles.includes(state.sketchStyle);
    const isRoughnessDisabled = roughnessDisabledStyles.includes(state.sketchStyle);

    return (
        <div className="space-y-6">
            {[
                { label: 'Részletgazdagság', value: state.detailLevel, key: 'detailLevel', icon: 'fa-search-plus', disabled: false },
                { label: 'Árnyékolás', value: state.shadingIntensity, key: 'shadingIntensity', icon: 'fa-adjust', disabled: isShadingDisabled },
                { label: 'Vonalvastagság', value: state.strokeWidth, key: 'strokeWidth', icon: 'fa-pen', disabled: false },
                { label: 'Vázlatosság', value: state.roughness, key: 'roughness', icon: 'fa-signature', disabled: isRoughnessDisabled }
            ].map((control) => (
                <div key={control.key} className={`${control.disabled ? 'opacity-50' : ''}`}>
                    <div className="flex justify-between mb-2 text-sm">
                        <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2"><i className={`fas ${control.icon} text-slate-400 w-4`}></i> {control.label}</span>
                        <span className="text-amber-500 font-bold bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded text-xs">{control.value}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={control.value}
                        disabled={state.isBatchProcessing || state.isProcessing || control.disabled}
                        onChange={(e) => setState(prev => ({ ...prev, [control.key]: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none accent-amber-500 cursor-pointer hover:accent-amber-400 transition-colors disabled:cursor-not-allowed"
                    />
                    {control.disabled && <p className="text-xs text-slate-400 mt-1 italic">Ez a beállítás ennél a stílusnál nem alkalmazható.</p>}
                </div>
            ))}
        </div>
    );
};

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans">
      <header className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20 shadow-sm backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={resetApp}>
            <div className="p-2 bg-amber-500 rounded-lg text-white shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform"><i className="fas fa-pen-nib text-2xl"></i></div>
            <h1 className="text-2xl font-black tracking-tight uppercase">Sketch Artist <span className="text-amber-500">AI</span></h1>
          </div>
          <button onClick={() => setState(prev => ({ ...prev, theme: prev.theme === 'LIGHT' ? 'DARK' : 'LIGHT' }))} className="p-3 w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">{state.theme === 'LIGHT' ? '🌙' : '☀️'}</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {showBatchView && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center"><h2 className="text-3xl font-bold">Kötegelt Feldolgozás</h2><button onClick={resetApp} className="group text-slate-500 hover:text-amber-500 font-bold flex items-center gap-2 transition-colors px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><i className="fas fa-times"></i> {TRANSLATIONS.HU.clearBatch}</button></div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                {state.isBatchProcessing && state.batchProgress && (<div className="mb-6 bg-slate-100 dark:bg-slate-800 p-4 rounded-xl"><p className="text-center font-bold mb-2">{TRANSLATIONS.HU.processingBatch.replace('{current}', String(state.batchProgress.current)).replace('{total}', String(state.batchProgress.total))}</p><div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5"><div className="bg-amber-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(state.batchProgress.current / state.batchProgress.total) * 100}%` }}></div></div></div>)}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {(state.batchResultImages.length > 0 ? state.batchResultImages : state.batchSourceImages.map(s => ({ source: s, result: '', error: undefined }))).map((item, index) => (
                    <div key={index} className="relative group bg-slate-100 dark:bg-slate-800/50 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in">
                      {item.error ? (<div className="aspect-square flex flex-col items-center justify-center text-center p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"><i className="fas fa-exclamation-triangle text-2xl mb-2"></i><p className="text-xs font-bold">Hiba</p><p className="text-xs opacity-80">{item.error}</p></div>) : item.result ? (<img src={item.result} className="w-full h-full object-cover aspect-square" alt="Result" />) : (<img src={item.source} className="w-full h-full object-cover aspect-square" alt="Source" />)}
                      {!item.result && state.batchProgress?.current === index + 1 && (<div className="absolute inset-0 bg-black/60 flex items-center justify-center"><div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div></div>)}
                      {item.result && (<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 flex justify-end"><button onClick={() => handleDownload(item.result)} className="w-8 h-8 flex items-center justify-center bg-emerald-500 text-white rounded-full hover:bg-emerald-400 transition-colors shadow-lg"><i className="fas fa-download text-sm"></i></button></div>)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-4">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 sticky top-28 space-y-8"><h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100"><i className="fas fa-sliders-h text-amber-500"></i> Közös Beállítások</h3><StyleSelector /><hr className="border-slate-200 dark:border-slate-700" /><Sliders />{!state.isBatchProcessing && (<button onClick={handleStartBatchProcessing} className="w-full pt-4 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-amber-500 dark:to-amber-600 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-3"><i className="fas fa-play"></i> {TRANSLATIONS.HU.startBatch}</button>)}</div>
              </div>
            </div>
          </div>
        )}

        {showUpload && (
          <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl min-h-[400px] flex flex-col justify-center animate-fade-in border border-slate-100 dark:border-slate-800">
             <div className="space-y-8">
              <div className="flex justify-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-sm mx-auto"><button onClick={() => setState(p => ({ ...p, uploadMode: 'upload' }))} className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all duration-300 ${state.uploadMode === 'upload' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm scale-100' : 'text-slate-500 scale-95 opacity-70'}`}>Fotó Feltöltése</button><button onClick={() => setState(p => ({ ...p, uploadMode: 'generate' }))} className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all duration-300 ${state.uploadMode === 'generate' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm scale-100' : 'text-slate-500 scale-95 opacity-70'}`}>Generálás Prompttal</button></div>
              {state.uploadMode === 'upload' ? (<div className="text-center space-y-6 animate-fade-in"><div className="border-4 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-12 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group relative overflow-hidden"><input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" multiple /><div className="text-6xl mb-6 text-slate-300 dark:text-slate-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">🖼️</div><h2 className="text-xl font-bold mb-2">Húzd ide a fotóidat</h2><p className="text-slate-500 dark:text-slate-400">Egy vagy több képet is feltölthetsz egyszerre.</p></div></div>) : (<div className="text-center space-y-6 pt-2 animate-fade-in"><div><h2 className="text-2xl font-bold mb-2">Mit rajzoljak neked?</h2><p className="text-slate-500 dark:text-slate-400">Írd le részletesen, és azonnal elkészítem a vázlatot.</p></div><div className="relative"><textarea value={state.generationPrompt} onChange={(e) => setState(prev => ({...prev, generationPrompt: e.target.value}))} placeholder="Pl: 'Egy steampunk stílusú léghajó felhőkarcolók között...'" className="w-full h-32 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 ring-amber-500 transition-all resize-none shadow-inner text-lg" /><div className="absolute bottom-4 right-4 text-slate-400 text-xs font-bold pointer-events-none">AI</div></div><button onClick={handleGenerateFromPrompt} disabled={!state.generationPrompt} className="w-full py-4 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-amber-500 dark:to-amber-600 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-3"><i className="fas fa-magic"></i> KÉP GENERÁLÁSA</button></div>)}
              {state.error && !state.isProcessing && <div className="text-red-600 dark:text-red-400 mt-4 text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-900/50 flex items-center justify-center gap-2"><i className="fas fa-exclamation-circle"></i> {state.error}</div>}
              {state.isProcessing && !state.sourceImage && <div className="text-slate-500 mt-4 text-center p-4 flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div> Betöltés...</div>}
            </div>
          </div>
        )}
        
        {/* MAIN VIEW */}
        {showMainView && (
           <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <button onClick={resetApp} className="group mb-2 text-slate-500 hover:text-amber-500 font-bold flex items-center gap-2 transition-colors pl-2"><i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> Újrakezdés</button>
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800">
             {(state.isProcessing && !state.resultImage) ? (<div className="py-32 text-center"><div className="relative w-24 h-24 mx-auto mb-8"><div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div><div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div><i className="fas fa-pencil-alt absolute inset-0 flex items-center justify-center text-3xl text-slate-400 animate-pulse"></i></div><h3 className="text-2xl font-bold animate-pulse text-slate-800 dark:text-slate-100">{TRANSLATIONS.HU.artistAtWork}</h3><p className="text-slate-500 dark:text-slate-400 mt-3">Kérlek várj, amíg a remekmű elkészül.</p></div>) : state.error ? (<div className="text-center py-20"><div className="text-red-500 text-5xl mb-6"><i className="fas fa-heart-broken"></i></div><h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Hoppá, valami nem sikerült</h3><p className="text-slate-500 dark:text-slate-400 mt-2 mb-8 max-w-md mx-auto">{state.error}</p><button onClick={resetApp} className="px-8 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/30">Próbáld újra</button></div>) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-7 space-y-6">
                    <div className={`relative bg-slate-100 dark:bg-slate-950 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden group ${state.isProcessing ? 'opacity-90 pointer-events-none' : ''}`}>
                       <img src={state.resultImage ?? state.sourceImage!} className="w-full h-auto rounded-lg shadow-lg" alt="Sketch Result" />
                       {state.isProcessing && state.resultImage && (<div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10 transition-opacity"><div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-3"></div><span className="font-bold text-white shadow-black drop-shadow-md">Frissítés...</span></div>)}
                    </div>
                     {state.history.length > 1 && (<div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800"><label className="block text-xs font-bold mb-3 uppercase text-slate-400 tracking-wider">Verzió Előzmények</label><div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">{state.history.map((version, index) => (<button key={index} onClick={() => handleVersionSelect(version)} className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all border-2 ${version === state.resultImage ? 'border-amber-500 scale-105 shadow-md ring-2 ring-amber-500/20' : 'border-transparent opacity-60 hover:opacity-100'}`}><img src={version} alt={`v${index}`} className="w-full h-full object-cover" /></button>))}</div></div>)}
                  </div>
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-slate-800 dark:text-slate-100"><i className="fas fa-sliders-h text-amber-500"></i> {TRANSLATIONS.HU.styleSettings}</h3>
                        <div className="space-y-8 mb-8">
                          <StyleSelector />
                          <hr className="border-slate-200 dark:border-slate-700" />
                          <Sliders />
                          {state.resultImage ? 
                            (<button onClick={handleRegenerateSketch} disabled={state.isProcessing} className="w-full py-3 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-bold text-sm hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 shadow-sm active:translate-y-0.5"><i className="fas fa-sync-alt mr-2"></i> Beállítások Alkalmazása</button>)
                          :
                            (<button onClick={handleCreateSketch} disabled={state.isProcessing} className="w-full py-4 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-amber-500 dark:to-amber-600 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-3"><i className="fas fa-pencil-ruler"></i> {TRANSLATIONS.HU.createSketch}</button>)
                          }
                        </div>
                        {state.resultImage && (
                          <>
                            <hr className="border-slate-200 dark:border-slate-700 mb-6" />
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-300">Szöveges módosítás</label>
                                <div className="relative"><textarea value={state.editPrompt} onChange={(e) => setState(prev => ({ ...prev, editPrompt: e.target.value }))} placeholder="Pl: 'legyen sötétebb a háttér' vagy 'adj hozzá egy kalapot'..." disabled={state.isProcessing} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleRefine())} className="w-full p-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 outline-none focus:ring-2 ring-amber-500 text-sm h-24 resize-none" /><button onClick={handleRefine} disabled={!state.editPrompt || state.isProcessing} className="absolute bottom-2 right-2 p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:bg-slate-400 transition-colors shadow-md"><i className="fas fa-paper-plane"></i></button></div>
                            </div>
                          </>
                        )}
                    </div>
                    {state.resultImage && (
                      <div className="flex flex-col gap-3">
                           <div className="flex gap-2">
                                <select 
                                    value={state.fileFormat} 
                                    onChange={(e) => setState(prev => ({ ...prev, fileFormat: e.target.value as FileFormat }))}
                                    className="px-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
                                >
                                    <option value="png">PNG</option>
                                    <option value="jpeg">JPG</option>
                                    <option value="svg">SVG</option>
                                </select>
                                <button onClick={() => handleDownload(state.resultImage!)} disabled={state.isProcessing} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50 active:scale-[0.98] transform text-lg"><i className="fas fa-download"></i> KÉP LETÖLTÉSE</button>
                           </div>
                           <button onClick={resetApp} disabled={state.isProcessing} className="w-full py-3 bg-transparent text-slate-500 dark:text-slate-400 font-bold flex items-center justify-center gap-2 hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-sm"><i className="fas fa-plus-circle"></i> Új alkotás kezdése</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;

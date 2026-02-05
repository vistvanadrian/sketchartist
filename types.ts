
export type SketchStyle = 'vector-pencil' | 'line' | 'drawing' | 'engraving' | 'outline' | 'flat' | 'hatching' | 'stipple' | 'coloring-book' | 'ghibli';

// FIX: Added 'svg' to FileFormat
export type FileFormat = 'png' | 'jpeg' | 'svg';

export type Language = 'HU' | 'EN';

export type Theme = 'LIGHT' | 'DARK';

export interface AppState {
  language: Language;
  theme: Theme;
  sourceImage: string | null;
  resultImage: string | null;
  isProcessing: boolean; // For AI processing
  sketchStyle: SketchStyle;
  detailLevel: number;
  shadingIntensity: number;
  strokeWidth: number;
  roughness: number;
  editPrompt: string;
  fileFormat: FileFormat;
  error: string | null;
  history: string[];
  generationPrompt: string;
  uploadMode: 'upload' | 'generate';
  // Batch processing state
  batchSourceImages: string[];
  batchResultImages: { source: string; result: string; error?: string }[];
  isBatchProcessing: boolean;
  batchProgress: { current: number; total: number } | null;
}

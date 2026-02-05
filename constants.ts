
import { SketchStyle } from './types';

export const SKETCH_STYLES: SketchStyle[] = ['vector-pencil', 'line', 'drawing', 'engraving', 'outline', 'flat', 'hatching', 'stipple', 'coloring-book', 'ghibli'];

export const SKETCH_STYLE_NAMES: { HU: Record<SketchStyle, string>, EN: Record<SketchStyle, string> } = {
  HU: {
    'vector-pencil': 'Grafit',
    'line': 'Vonalrajz',
    'drawing': 'Rajz',
    'engraving': 'Metszet',
    'outline': 'Körvonal',
    'flat': 'Sík',
    'hatching': 'Vonalkázás',
    'stipple': 'Pontozás',
    'coloring-book': 'Kifestő',
    'ghibli': 'Ghibli Stílus',
  },
  EN: {
    'vector-pencil': 'Pencil Sketch',
    'line': 'Line Art',
    'drawing': 'Drawing',
    'engraving': 'Engraving',
    'outline': 'Outline',
    'flat': 'Flat',
    'hatching': 'Hatching',
    'stipple': 'Stipple',
    'coloring-book': 'Coloring Book',
    'ghibli': 'Ghibli Style',
  }
};

export const SKETCH_STYLE_DETAILS: Record<SketchStyle, { description: string; imageUrl: string }> = {
  'hatching': {
    description: 'Klasszikus technika, ahol az árnyékokat párhuzamos és keresztezett vonalak alkotják. Tökéletes gravírozáshoz.',
    imageUrl: 'https://storage.googleapis.com/maker-media-project-files-prod/3e680a42-7297-4217-a5e2-4158622956f2/3e680a42-7297-4217-a5e2-4158622956f2.png'
  },
  'stipple': {
    description: 'A képet apró pontok ezrei építik fel. Ahol a pontok sűrűbbek, ott a tónus sötétebb.',
    imageUrl: 'https://storage.googleapis.com/maker-media-project-files-prod/d40d32e5-4a25-4638-8d48-185458a2d590/d40d32e5-4a25-4638-8d48-185458a2d590.png'
  },
  'engraving': {
    description: 'Részletgazdag, finom vonalvezetésű stílus, amely a régi fametszetek hangulatát idézi.',
    imageUrl: 'https://storage.googleapis.com/maker-media-project-files-prod/7e74f42e-a228-444a-9391-53673de08a20/7e74f42e-a228-444a-9391-53673de08a20.png'
  },
  'vector-pencil': {
    description: 'Autentikus grafitceruza-hatás, amely ideális portrékhoz és részletes vázlatokhoz.',
    imageUrl: 'https://storage.googleapis.com/maker-media-project-files-prod/e18b877a-225e-4c71-a477-88950d29d84d/e18b877a-225e-4c71-a477-88950d29d84d.png'
  },
  'line': {
    description: 'Tiszta, részletes vonalrajz, amely az árnyékolás helyett a formákra és a kontúrokra fókuszál.',
    imageUrl: 'https://storage.googleapis.com/maker-media-project-files-prod/9e623b97-8e68-4903-9118-86715a372134/9e623b97-8e68-4903-9118-86715a372134.png'
  },
  'drawing': {
    description: 'Tiszta, klasszikus tollrajz-illusztráció, határozott vonalakkal és formákkal.',
    imageUrl: 'https://storage.googleapis.com/maker-media-project-files-prod/07248b61-463c-4890-863a-23136293375c/07248b61-463c-4890-863a-23136293375c.png'
  },
  'outline': {
    description: 'Minimalista, letisztult stílus, amely csak a téma fő kontúrvonalaira fókuszál.',
    imageUrl: 'https://storage.googleapis.com/maker-media-project-files-prod/d855ad23-d3d6-4e52-b8b8-50e56f4d812d/d855ad23-d3d6-4e52-b8b8-50e56f4d812d.png'
  },
  'flat': {
    description: 'Merész, 2D grafikai stílus, amely csak tiszta fekete és fehér felületeket használ.',
    imageUrl: 'https://storage.googleapis.com/maker-media-project-files-prod/1a74d4d5-5d15-44bc-876a-2975993b1373/1a74d4d5-5d15-44bc-876a-2975993b1373.png'
  },
  'coloring-book': {
     description: 'Tiszta fekete körvonalak fehér kitöltéssel, színezéshez előkészítve.',
     imageUrl: 'https://storage.googleapis.com/maker-media-project-files-prod/1a74d4d5-5d15-44bc-876a-2975993b1373/1a74d4d5-5d15-44bc-876a-2975993b1373.png'
  },
  'ghibli': {
      description: 'Varázslatos, színes anime stílus, részletgazdag festett hátterekkel, a Studio Ghibli filmek hangulatában.',
      imageUrl: 'https://storage.googleapis.com/maker-media-project-files-prod/1a74d4d5-5d15-44bc-876a-2975993b1373/1a74d4d5-5d15-44bc-876a-2975993b1373.png' // Placeholder
  }
};

export const TRANSLATIONS = {
  HU: {
    upload: 'Feltöltés',
    styleSettings: 'Stílus Beállítások',
    artisticSketch: 'Művészi Rajz',
    dragAndDrop: 'Húzd ide a fotódat',
    sketchDescription: 'Bármilyen portréból vagy tájképből vázlatot készítünk',
    sketchStyle: 'Rajz Stílusa',
    pencil: 'Grafit',
    charcoal: 'Szén',
    ink: 'Tus',
    watercolor: 'Akvarell',
    fineTuning: 'Finomhangolás',
    detailLevel: 'Részletgazdagság',
    shadingIntensity: 'Árnyékolás',
    createSketch: 'RAJZ ELKÉSZÍTÉSE',
    artistAtWork: 'A művész éppen dolgozik...',
    saveSketch: 'RAJZ MENTÉSE',
    noImage: 'Nincs még elkészült kép.',
    // Batch processing translations
    batchUpload: "Több kép feltöltése",
    startBatch: "Feldgozás Indítása",
    processingBatch: "{current} / {total} kép feldgozása...",
    batchResults: "Kötegelt Feldgozás Eredményei",
    clearBatch: "Új köteg indítása",
  },
  EN: {
    // English translations could go here
  },
};

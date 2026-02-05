import { GoogleGenerativeAI } from "@google/generative-ai";

// A kulcsodat a .env.local fájlból veszi (VITE_ prefixszel)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || "");

// Segédfüggvény: a képet átalakítja a Google számára érthető formátumra
const dataUrlToPart = (dataUrl: string) => {
    return {
        inlineData: {
            data: dataUrl.split(',')[1],
            mimeType: "image/png"
        }
    };
};

// 1. KÉP ÁTALAKÍTÁSA (Ez fut le, amikor feltöltesz)
export const generateSketch = async (
    image: string, 
    style: string, 
    detail: number, 
    shading: number
) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Alakítsd át ezt a képet ${style} stílusú vázlattá. 
                    Részletesség: ${detail}%, Árnyékolás: ${shading}%. 
                    Kérlek, egy részletes leírást adj az új képről.`;

    const result = await model.generateContent([prompt, dataUrlToPart(image)]);
    const response = await result.response;
    
    // Mivel a Gemini szöveges, itt egyelőre a szöveges leírást kapod vissza
    // Később ide kötjük be a tényleges képgenerálót
    console.log("AI Válasza:", response.text());
    return image; // Egyelőre az eredetit adja vissza, hogy ne szálljon el a program
};

// 2. MÓDOSÍTÁS PROMPTTAL (Ez fut le a kis szövegdoboznál)
export const refineSketch = async (image: string, editPrompt: string, style: string) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
        `Módosítsd ezt a ${style} vázlatot: ${editPrompt}`, 
        dataUrlToPart(image)
    ]);
    return image; 
};

// 3. KÉP GENERÁLÁSA SZÖVEGBŐL
export const generateImageFromPrompt = async (prompt: string) => {
    // Itt hívnánk meg az Imagen-t vagy más generátort
    console.log("Generálás ebből:", prompt);
    return "https://via.placeholder.com/1024"; // Ideiglenes kép
};

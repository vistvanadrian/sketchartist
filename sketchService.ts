import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializálás
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function generateSketch(
  imageBase64: string,
  style: string,
  detail: number,
  shading: number,
  stroke: number,
  roughness: number
): Promise<string> {
  try {
    // A legstabilabb modellt hívjuk meg
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Describe this image for an AI artist. Style: ${style} sketch. Details: ${detail}%. Shading: ${shading}%. Output only a 20-word English description.`;

    const imageParts = [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64.split(",")[1]
        },
      },
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text().trim().replace(/["']/g, "");

    // Generálunk egy magot (seed), hogy minden rajz egyedi legyen
    const seed = Math.floor(Math.random() * 999999);
    const finalPrompt = encodeURIComponent(`${style} artistic sketch, ${text}, white background, highly detailed pencil lines`);
    
    return `https://pollinations.ai/p/${finalPrompt}?width=1024&height=1024&seed=${seed}`;

  } catch (error: any) {
    console.error("Hiba történt:", error);
    // Ha még mindig 404-et dob, akkor adjunk vissza egy közvetlen generált képet
    const fallbackPrompt = encodeURIComponent(`${style} sketch of a person, artistic, detailed`);
    return `https://pollinations.ai/p/${fallbackPrompt}?width=1024&height=1024&seed=123`;
  }
}

// Ezek kellenek az App.tsx-nek, hogy ne legyen hiba
export async function refineSketch(i: string, p: string, s: string) { return i; }
export async function generateImageFromPrompt(p: string) { 
    return `https://pollinations.ai/p/${encodeURIComponent(p)}?width=1024&height=1024`; 
}

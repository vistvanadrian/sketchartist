import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function generateSketch(
  imageBase64: string,
  style: string,
  detail: number,
  shading: number,
  stroke: number,
  roughness: number
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // 1. Lépés: Megkérjük a Geminit, hogy írja le a képet vázlat formájában
  const prompt = `Describe this image as a ${style} sketch. Focus on details: ${detail}%, shading: ${shading}%, stroke width: ${stroke}%. Output only a detailed English prompt for an image generator.`;

  const parts = [
    { text: prompt },
    {
      inlineData: {
        mimeType: "image/png",
        data: imageBase64.split(",")[1],
      },
    },
  ];

  const result = await model.generateContent(parts);
  const aiDescription = result.response.text();

  // 2. Lépés: Az AI leírását elküldjük egy ingyenes rajzoló motornak
  // A Pollinations AI-t használjuk, ami azonnal képet ad vissza
  const encodedPrompt = encodeURIComponent(`${style} sketch, ${aiDescription}, white background, artistic lines, high quality`);
  const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000)}`;

  return imageUrl;
}

export async function refineSketch(image: string, prompt: string, style: string): Promise<string> {
    const encodedPrompt = encodeURIComponent(`${style} sketch, ${prompt}, high detail`);
    return `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000)}`;
}

export async function generateImageFromPrompt(prompt: string): Promise<string> {
    const encodedPrompt = encodeURIComponent(prompt);
    return `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000)}`;
}

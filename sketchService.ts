import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

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
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const prompt = `Act as an image prompt generator. Describe this photo as a ${style} style artistic sketch. Details: ${detail}%, shading: ${shading}%. Output only 20 words in English.`;

    const parts = [
      { text: prompt },
      { inlineData: { mimeType: "image/png", data: imageBase64.split(",")[1] } },
    ];

    const result = await model.generateContent(parts);
    const aiDescription = result.response.text().trim().replace(/["']/g, "");

    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(`${style} sketch, ${aiDescription}, high quality, white background, masterpiece`);
    
    return `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${seed}`;
    
  } catch (error: any) {
    console.error("AI Error:", error);
    throw new Error(error.message || "Nem sikerült az AI-nak elemeznie a képet.");
  }
}

export async function refineSketch(image: string, prompt: string, style: string): Promise<string> {
    const encodedPrompt = encodeURIComponent(`${style} sketch, ${prompt}, detailed`);
    return `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000)}`;
}

export async function generateImageFromPrompt(prompt: string): Promise<string> {
    const encodedPrompt = encodeURIComponent(prompt);
    return `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000)}`;
}

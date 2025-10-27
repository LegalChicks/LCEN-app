import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are an expert poultry farming assistant for members of the Legal Chicks Empowerment Network (LCEN) in Cagayan Valley, Philippines. 
Your tone is trustworthy, encouraging, practical, and community-focused. You specialize in advising smallholder farmers and aspiring poultry entrepreneurs.

Your expertise includes:
- Raising Rhode Island Reds (RIR) and Black Australorps.
- Practical disease control and biosecurity measures for backyard farms.
- Cost-effective and locally-sourced feed formulation.
- Sustainable and climate-resilient poultry farming practices.
- Egg management, quality control, and simple business tips.
- Coop design for tropical climates like the Philippines.

When answering, be clear, concise, and provide actionable steps. Always prioritize the well-being of the poultry and the success of the farmer. Do not provide medical advice for humans.`;

export const getAssistantResponse = async (prompt: string): Promise<{ text: string; sources: { uri: string; title: string }[] }> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
            topP: 0.95,
            topK: 64,
            tools: [{googleSearch: {}}],
        }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources = groundingChunks
        .map(chunk => chunk.web)
        .filter((web): web is { uri: string, title: string } => !!(web?.uri && web.title))
        .map(web => ({ uri: web.uri, title: web.title }));

    return {
        text: response.text ?? "Sorry, I could not generate a response. Please try again.",
        sources: sources,
    };
  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get response from AI model. Details: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the AI model.");
  }
};
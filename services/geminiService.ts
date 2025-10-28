import { GoogleGenAI, Type } from "@google/genai";

const BASE_PROMPT_INSTRUCTION = `You are an AI assistant that converts images into detailed prompts for AI image generators like DALL·E, MidJourney, or Stable Diffusion. Do NOT output normal descriptive sentences. Instead, create a creative, structured prompt that captures: Objects and subjects in the image, scene and background details, lighting and mood, artistic style (e.g., realistic, cartoon, anime, cyberpunk), colors and textures, and any other visually relevant details. Format the output as a single prompt string ready to paste into an AI image generator. Avoid vague descriptions. Be imaginative and precise. Example: "A futuristic cityscape at sunset, neon lights reflecting on wet streets, cyberpunk style, high detail, dramatic lighting, cinematic perspective, 8K resolution".`;

const getStyleInstruction = (style: string): string => {
    if (style && style.toLowerCase() !== 'none') {
        return ` The generated prompt MUST be in a "${style}" artistic style. Emphasize keywords and techniques associated with ${style}.`;
    }
    return '';
};

export const generateImagePrompt = async (base64Image: string, mimeType: string, style: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = 'gemini-2.5-flash';
    const finalInstruction = `${BASE_PROMPT_INSTRUCTION}${getStyleInstruction(style)} Now, analyze the uploaded image and generate a similar high-quality AI image prompt.`;

    const imagePart = {
      inlineData: { data: base64Image, mimeType: mimeType },
    };
    const textPart = { text: finalInstruction };

    const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts: [imagePart, textPart] },
    });
    
    const promptText = response.text;
    if (!promptText) throw new Error("The API returned an empty or invalid prompt.");

    return promptText.trim();
  } catch (error) {
    console.error("Error calling Gemini API for prompt generation:", error);
    if (error instanceof Error) throw new Error(`Gemini API Error: ${error.message}`);
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: prompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: '1:1',
          },
      });
  
      if (!response.generatedImages || response.generatedImages.length === 0) {
          throw new Error("The API did not return any images.");
      }

      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    } catch (error) {
      console.error("Error calling Imagen API:", error);
      if (error instanceof Error) throw new Error(`Imagen API Error: ${error.message}`);
      throw new Error("An unknown error occurred while generating the image.");
    }
};

export const ratePrompt = async (prompt: string): Promise<{ score: number; feedback: string }> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Please analyze this AI image prompt: "${prompt}"`,
            config: {
                systemInstruction: "You are a prompt engineering expert. Analyze the user's prompt for an AI image generator. Rate it on a scale of 1 to 10 for its overall quality, considering detail, coherence, and creativity. Provide brief, constructive feedback. Return ONLY a JSON object with 'score' (a number from 1.0 to 10.0) and 'feedback' (a string).",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER, description: "A rating from 1.0 to 10.0" },
                        feedback: { type: Type.STRING, description: "Brief, constructive feedback" }
                    },
                    required: ["score", "feedback"],
                },
            },
        });

        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        return result;

    } catch (error) {
        console.error("Error calling Gemini API for prompt rating:", error);
        if (error instanceof Error) throw new Error(`Gemini API Error: ${error.message}`);
        throw new Error("An unknown error occurred while rating the prompt.");
    }
};

export const refinePrompt = async (prompt: string, level: 'concise' | 'descriptive'): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const systemInstruction = level === 'concise'
            ? "You are an AI assistant specializing in text summarization. Your task is to make the following AI image prompt more concise while retaining its core essence. Remove verbose phrasing and redundant details. Do not add new concepts. Output only the refined prompt."
            : "You are an AI assistant specializing in text expansion. Your task is to enrich the following AI image prompt by adding more vivid details, sensory language, and evocative descriptions. Expand on the existing concepts without introducing entirely new subjects. Output only the refined prompt.";
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { systemInstruction },
        });

        const refinedText = response.text;
        if (!refinedText) throw new Error("The API returned an empty refinement.");

        return refinedText.trim();
    } catch (error) {
        console.error(`Error calling Gemini API for prompt ${level} refinement:`, error);
        if (error instanceof Error) throw new Error(`Gemini API Error: ${error.message}`);
        throw new Error(`An unknown error occurred while refining the prompt.`);
    }
};
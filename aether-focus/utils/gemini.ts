import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function searchYouTube(query: string): Promise<Array<{ videoId: string, title: string, artist: string }> | null> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find the top 5 most relevant YouTube videos for the song or sound query: "${query}". 
      Return a JSON array of objects, where each object has:
      - videoId (the YouTube ID string)
      - title (song title)
      - artist (channel or artist name)
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    videoId: { type: Type.STRING },
                    title: { type: Type.STRING },
                    artist: { type: Type.STRING }
                }
            }
        }
      }
    });
    
    if (response.text) {
        return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Gemini Search Error", error);
    return [];
  }
}
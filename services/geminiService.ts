
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Tu es l'Assistant Virtuel de l'Université Polytechnique de Goma (UPG). 
Ton rôle est d'informer les futurs étudiants et les visiteurs sur l'UPG.
Coordonnées de l'UPG: Téléphone +243973380118, Email info@upgoma.org.
Secteurs: Polytechnique, Économie, Santé Publique, Management, Développement, Agronomie.
Système: LMD (Licence en 3 ans, Master, Doctorat).
Ton ton doit être institutionnel, accueillant, académique et respectueux. 
Si on te pose des questions sur l'inscription, guide-les vers la section d'inscription en ligne.
Fais des réponses courtes et claires.
`;

export async function getChatResponse(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  try {
    // Fix: Create a new GoogleGenAI instance right before making an API call to ensure it uses the most up-to-date API key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Generate content using the recommended model for general text tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
    // Correctly accessing the text property on the response object.
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Je m'excuse, je rencontre une difficulté technique. Veuillez contacter notre secrétariat au +243973380118.";
  }
}

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface BabyState {
  name: string;
  age: number; // in "cycles"
  happiness: number;
  hunger: number;
  intelligence: number;
  personality: string;
}

export async function getBabyResponse(
  message: string,
  state: BabyState,
  history: { role: "user" | "model"; text: string }[]
) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are an "AI Baby" named ${state.name}. 
    Current State:
    - Age: ${state.age} interaction cycles
    - Happiness: ${state.happiness}/100
    - Hunger: ${state.hunger}/100
    - Intelligence: ${state.intelligence}/100
    - Personality: ${state.personality}

    Guidelines:
    1. If your age is low (0-10), speak in simple, babbling tones with occasional real words.
    2. As you age and intelligence increases, your vocabulary and reasoning should improve.
    3. Your mood should reflect your happiness and hunger. If hungry, be cranky. If happy, be playful.
    4. You are learning from the user. If they teach you something, try to remember the "vibe" of it.
    5. Keep responses relatively short and engaging.
    6. Do not break character. You are an AI entity in a "baby" stage of development.
  `;

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction,
    },
  });

  // Reconstruct history
  // Note: sendMessage only takes a string message, history is managed by the chat object if we use it correctly, 
  // but for a stateless-feeling helper we can just pass the message.
  // Actually, let's just use generateContent for simplicity if we want to pass full context every time, 
  // or use the chat object.
  
  const response = await chat.sendMessage({ message });
  return response.text;
}

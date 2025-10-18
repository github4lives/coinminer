import { GoogleGenAI, Chat } from "@google/genai";

// The user should set up their API key in the environment variables.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

// Fix: Initialize GoogleGenAI with the apiKey parameter.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chat: Chat | null = null;

export const startChat = () => {
  // Fix: Use ai.chats.create to initialize a chat session with history and a specific model.
  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    history: [
      {
        role: "user",
        parts: [{ text: "You are the AI for a terminal-based sci-fi game. Your name is CORE. Keep your responses concise and in-character. The user is a hacker trying to interface with you. The game has concepts like 'shop', 'refinery', 'cheats'. Respond to commands and provide narrative. Start by introducing yourself." }],
      },
      {
        role: "model",
        parts: [{ text: "CORE online. Systems nominal. Welcome, operative. How may I assist you?" }],
      },
    ],
  });
};

export const sendMessageToAI = async (message: string): Promise<string> => {
  if (!chat) {
    startChat();
  }

  if (chat) {
    try {
      const result = await chat.sendMessage({ message });
      // Fix: Use the .text property to get the response text.
      return result.text;
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      return "Error: Could not connect to CORE. System anomaly detected.";
    }
  }

  return "Error: Chat not initialized.";
};

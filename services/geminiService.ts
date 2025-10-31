import { GoogleGenAI, Chat } from '@google/genai';

interface ChatLike {
  sendMessage: (input: { message: string }) => Promise<{ text: string }>;
}

class LocalChat implements ChatLike {
  private history: string[] = [];

  async sendMessage({ message }: { message: string }): Promise<{ text: string }> {
    this.history.push(message);
    const reply = this.generateReply(message);
    return { text: reply };
  }

  private generateReply(message: string): string {
    const templates = [
      `CORE (simulated): Received command "${message}". Full neural interface unavailable in offline mode.`,
      `Simulation core acknowledges: ${message}. Install a VITE_API_KEY to engage live Gemini intel feeds.`,
      `Diagnostic echo: "${message}" processed locally. Reconnect to central AI for richer responses.`,
    ];
    const index = (this.history.length - 1) % templates.length;
    return templates[index];
  }
}

const API_KEY = import.meta.env?.VITE_API_KEY as string | undefined;

let ai: GoogleGenAI | null = null;
let chat: (Chat & ChatLike) | ChatLike | null = null;

export const startChat = () => {
  if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
    chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: [
        {
          role: 'user',
          parts: [
            {
              text:
                "You are the AI for a terminal-based sci-fi game. Your name is CORE. Keep your responses concise and in-character. The user is a hacker trying to interface with you. The game has concepts like 'shop', 'refinery', 'cheats'. Respond to commands and provide narrative. Start by introducing yourself.",
            },
          ],
        },
        {
          role: 'model',
          parts: [
            {
              text: 'CORE online. Systems nominal. Welcome, operative. How may I assist you?',
            },
          ],
        },
      ],
    }) as Chat & ChatLike;
  } else {
    chat = new LocalChat();
  }
};

export const sendMessageToAI = async (message: string): Promise<string> => {
  if (!chat) {
    startChat();
  }

  if (chat) {
    try {
      const result = await chat.sendMessage({ message });
      if ('text' in result && typeof result.text === 'string') {
        return result.text;
      }
      return 'CORE: Transmission received, but no readable output was returned.';
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      return 'Error: Could not connect to CORE. System anomaly detected.';
    }
  }

  return 'Error: Chat not initialized.';
};

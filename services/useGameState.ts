import { create } from 'zustand';

interface GameState {
  credits: number;
  inventory: string[];
  lastRefineryClaim: number;
  addCredits: (amount: number) => void;
  removeCredits: (amount: number) => void;
  addToInventory: (item: string) => void;
  setLastRefineryClaim: (timestamp: number) => void;
}

export const useGameState = create<GameState>((set) => ({
  credits: 1000,
  inventory: [],
  lastRefineryClaim: 0,
  addCredits: (amount) => set((state) => ({ credits: state.credits + amount })),
  removeCredits: (amount) => set((state) => ({ credits: state.credits - amount })),
  addToInventory: (item) => set((state) => ({ inventory: [...state.inventory, item] })),
  setLastRefineryClaim: (timestamp) => set({ lastRefineryClaim: timestamp }),
}));

export interface HistoryEntry {
  id: number;
  type: 'input' | 'output' | 'error' | 'system';
  text: string;
}

export type PickaxeType = 'stone' | 'iron' | 'steel' | 'diamond';

export interface GameState {
  coins: number;
  energy: number;
  maxEnergy: number;
  pickaxe: PickaxeType;
  inventory: Record<string, number>; // e.g., { coal: 50, iron: 20 }
}

export interface MiningResult {
  description: string;
  foundMaterial: string | null;
  quantity: number;
}

export interface Upgrade {
    id: string;
    name: string;
    description: string;
    cost: (level: number) => number;
    maxLevel?: number;
    currentLevel: number;
}

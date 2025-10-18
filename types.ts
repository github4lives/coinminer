export interface HistoryEntry {
  id: number;
  type: 'input' | 'output' | 'error' | 'system';
  text: string;
}

export type PickaxeType = 'stone' | 'iron' | 'steel' | 'diamond';

export interface GameState {
  coins: number;
  energy: number;
  pickaxe: PickaxeType;
  inventory: Record<string, number>; // e.g., { coal: 50, iron: 20 }
  isInfiniteEnergy: boolean;
}

export type MiningEventType = 'treasure' | 'geode' | 'relic' | 'spring' | 'cave_in';

export interface MiningResult {
  type: 'material' | 'event' | 'nothing';
  description: string;
  // For 'material' type
  foundMaterial?: string;
  quantity?: number;
  // For 'event' type
  eventName?: MiningEventType;
  coinsFound?: number;
  energyChange?: number;
  foundItem?: string; // For relic, geode
}

export interface Upgrade {
    id: string;
    name: string;
    description: string;
    cost: (level: number) => number;
    maxLevel?: number;
    currentLevel: number;
}

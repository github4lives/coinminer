export type HistoryEntryType = 'input' | 'output' | 'error' | 'system' | 'event';

export interface HistoryEntry {
  id: number;
  type: HistoryEntryType;
  text: string;
  timestamp: string;
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  description: string;
  benefit: string;
}

export interface RefineryJobBlueprint {
  id: string;
  name: string;
  durationMs: number;
  reward: number;
  description: string;
}

export interface RefineryJobProgress extends RefineryJobBlueprint {
  startedAt: number;
  completesAt: number;
  completedAt?: number;
  status: 'running' | 'completed';
}

export interface CheatCode {
  code: string;
  name: string;
  description: string;
  effectSummary: string;
}

export interface PlayerState {
  credits: number;
  inventory: string[];
  heat: number;
  rank: string;
  activeJob: RefineryJobProgress | null;
  completedJobs: RefineryJobProgress[];
  unlockedCheats: string[];
}

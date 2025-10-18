export type HistoryEntryType = 'input' | 'output' | 'error' | 'system';

export interface HistoryEntry {
  id: number;
  type: HistoryEntryType;
  text: string;
}

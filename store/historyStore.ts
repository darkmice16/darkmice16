import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TripRecord } from '../types';

interface HistoryStore {
  records: TripRecord[];
  streak: number;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addRecord: (r: TripRecord) => void;
  clearAll: () => void;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  records: [],
  streak: 0,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem('drift:history');
      if (raw) {
        const records: TripRecord[] = JSON.parse(raw);
        const streak = computeStreak(records);
        set({ records, streak, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },

  addRecord: (r) => {
    const records = [r, ...get().records].slice(0, 100);
    const streak = computeStreak(records);
    set({ records, streak });
    AsyncStorage.setItem('drift:history', JSON.stringify(records)).catch(() => {});
  },

  clearAll: () => {
    set({ records: [], streak: 0 });
    AsyncStorage.removeItem('drift:history').catch(() => {});
  },
}));

function computeStreak(records: TripRecord[]): number {
  let streak = 0;
  for (const r of records) {
    if (r.outcome === 'arrived') streak++;
    else break;
  }
  return streak;
}

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Settings } from '../types';

interface SettingsStore {
  settings: Settings;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => void;
}

const DEFAULTS: Settings = {
  onboardingComplete: false,
  defaultWakeOffsetMinutes: 5,
  hapticEnabled: true,
  smsEnabled: true,
  smsGraceSeconds: 90,
  batterySaverEnabled: false,
  emergencyContact: null,
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULTS,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem('drift:settings');
      if (raw) {
        const saved = JSON.parse(raw);
        set({ settings: { ...DEFAULTS, ...saved }, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },

  updateSettings: (patch) => {
    const next = { ...get().settings, ...patch };
    set({ settings: next });
    AsyncStorage.setItem('drift:settings', JSON.stringify(next)).catch(() => {});
  },
}));

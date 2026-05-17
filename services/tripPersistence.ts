import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Trip } from '../types';

const KEY = 'drift:active-trip';

export async function loadActiveTrip(): Promise<Trip | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Trip) : null;
  } catch {
    return null;
  }
}

export async function saveActiveTrip(trip: Trip | null): Promise<void> {
  try {
    if (trip) {
      await AsyncStorage.setItem(KEY, JSON.stringify(trip));
    } else {
      await AsyncStorage.removeItem(KEY);
    }
  } catch {
    // best-effort
  }
}

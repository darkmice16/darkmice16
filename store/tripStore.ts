import { create } from 'zustand';
import type { Trip, TripStatus, GpsConfidence, Stop } from '../types';
import { saveActiveTrip, loadActiveTrip } from '../services/tripPersistence';

interface LiveTripState {
  trip: Trip | null;
  currentStopIndex: number;
  minutesLeft: number | null;
  stopsLeft: number | null;
  gpsConfidence: GpsConfidence;
  smsCountdownSeconds: number | null;
  captchaSolved: number; // 0..3
  pickedStop: Stop | null;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  startTrip: (trip: Trip) => void;
  updatePosition: (stopIndex: number, minutesLeft: number, stopsLeft: number) => void;
  setStatus: (status: TripStatus) => void;
  setGpsConfidence: (c: GpsConfidence) => void;
  setSmsCountdown: (seconds: number | null) => void;
  solveCaptchaDot: (n: number) => void;
  setPickedStop: (s: Stop | null) => void;
  snoozeTrip: (minutes: number) => void;
  resetTrip: () => void;
}

export const useTripStore = create<LiveTripState>((set, get) => ({
  trip: null,
  currentStopIndex: 0,
  minutesLeft: null,
  stopsLeft: null,
  gpsConfidence: 'high',
  smsCountdownSeconds: null,
  captchaSolved: 0,
  pickedStop: null,
  hydrated: false,

  hydrate: async () => {
    const trip = await loadActiveTrip();
    set({
      trip,
      hydrated: true,
      stopsLeft: trip ? trip.stops.length - 1 : null,
    });
  },

  setPickedStop: (s) => set({ pickedStop: s }),

  startTrip: (trip) => {
    set({
      trip,
      currentStopIndex: 0,
      minutesLeft: null,
      stopsLeft: trip.stops.length - 1,
      gpsConfidence: 'high',
      smsCountdownSeconds: null,
      captchaSolved: 0,
    });
    saveActiveTrip(trip);
  },

  updatePosition: (stopIndex, minutesLeft, stopsLeft) => {
    set({ currentStopIndex: stopIndex, minutesLeft, stopsLeft });
  },

  setStatus: (status) => {
    const { trip } = get();
    if (!trip) return;
    const next = { ...trip, status };
    set({ trip: next });
    saveActiveTrip(next);
  },

  setGpsConfidence: (c) => set({ gpsConfidence: c }),

  setSmsCountdown: (seconds) => set({ smsCountdownSeconds: seconds }),

  solveCaptchaDot: (n) => {
    const { captchaSolved } = get();
    if (n === captchaSolved + 1) {
      set({ captchaSolved: captchaSolved + 1 });
    } else {
      set({ captchaSolved: 0 });
    }
  },

  snoozeTrip: (minutes) => {
    const { trip } = get();
    if (!trip) return;
    const nextOffset = Math.max(0, trip.wakeOffsetMinutes - minutes);
    const next: Trip = { ...trip, status: 'active', wakeOffsetMinutes: nextOffset };
    set({ trip: next });
    saveActiveTrip(next);
  },

  resetTrip: () => {
    set({
      trip: null,
      currentStopIndex: 0,
      minutesLeft: null,
      stopsLeft: null,
      captchaSolved: 0,
      smsCountdownSeconds: null,
    });
    saveActiveTrip(null);
  },
}));

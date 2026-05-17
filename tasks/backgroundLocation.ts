import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { loadActiveTrip, saveActiveTrip } from '../services/tripPersistence';
import { useTripStore } from '../store/tripStore';
import type { Trip, TripStatus } from '../types';

export const BACKGROUND_LOCATION_TASK = 'drift-background-location';

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fireWarmupNotification(stopName: string, minutesBefore: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Wake up soon',
      body: `${stopName} in ~${minutesBefore} min. Open your eyes.`,
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null,
  });
}

async function fireAlarmNotification(stopName: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚠️ WAKE UP',
      body: `${stopName} — get off NOW`,
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.MAX,
      ...(Platform.OS === 'ios' && { interruptionLevel: 'critical' as const }),
      data: { type: 'alarm' },
    },
    trigger: null,
  });
}

function computeProgress(trip: Trip, latitude: number, longitude: number) {
  const { stops, destination, wakeOffsetMinutes } = trip;
  let nearestIdx = 0;
  let nearestDist = Infinity;
  stops.forEach((stop, i) => {
    const d = haversine(latitude, longitude, stop.lat, stop.lng);
    if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
  });

  const destIdx = stops.findIndex(s => s.id === destination.id);
  const stopsLeft = Math.max(0, destIdx - nearestIdx);
  const distToDestKm = destIdx >= 0
    ? haversine(latitude, longitude, destination.lat, destination.lng)
    : stopsLeft * 0.8;
  const minutesLeft = Math.round((distToDestKm / 30) * 60);

  let nextStatus: TripStatus = trip.status;
  if (trip.status === 'active') {
    if (minutesLeft <= wakeOffsetMinutes - 2 || stopsLeft === 0) nextStatus = 'alarm';
    else if (minutesLeft <= wakeOffsetMinutes) nextStatus = 'prealarm';
  } else if (trip.status === 'prealarm' && (minutesLeft <= 0 || stopsLeft === 0)) {
    nextStatus = 'alarm';
  } else if (trip.status === 'alarm' && distToDestKm > 0.5 && minutesLeft < 0) {
    nextStatus = 'overshoot';
  }

  return { nearestIdx, stopsLeft, minutesLeft, distToDestKm, nextStatus };
}

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.warn('[BG Location]', error.message);
    return;
  }

  const { locations } = (data ?? {}) as { locations?: Location.LocationObject[] };
  if (!locations?.length) return;

  const loc = locations[locations.length - 1];
  const { latitude, longitude, accuracy } = loc.coords;

  // Reject wildly inaccurate fixes — they jitter the state machine
  if (accuracy != null && accuracy > 150) {
    try { useTripStore.getState().setGpsConfidence('low'); } catch {}
    return;
  }

  const trip = await loadActiveTrip();
  if (!trip || trip.status === 'arrived' || trip.status === 'idle') return;

  const progress = computeProgress(trip, latitude, longitude);
  const prevStatus = trip.status;

  // Persist new status if it changed
  if (progress.nextStatus !== prevStatus) {
    const updated: Trip = {
      ...trip,
      status: progress.nextStatus,
      events: [
        ...trip.events,
        { type: progress.nextStatus === 'prealarm' ? 'warmup' : progress.nextStatus === 'alarm' ? 'alarm' : 'overshoot', timestamp: Date.now(), position: { lat: latitude, lng: longitude } },
      ],
    };
    await saveActiveTrip(updated);

    if (progress.nextStatus === 'prealarm') {
      await fireWarmupNotification(trip.destination.name, progress.minutesLeft);
    } else if (progress.nextStatus === 'alarm') {
      await fireAlarmNotification(trip.destination.name);
    }
  }

  // Best-effort live UI update (only effective if foreground)
  try {
    const store = useTripStore.getState();
    const conf = accuracy == null || accuracy > 100 ? 'low' : accuracy > 40 ? 'medium' : 'high';
    store.setGpsConfidence(conf);
    store.updatePosition(progress.nearestIdx + 0.5, progress.minutesLeft, progress.stopsLeft);
    if (progress.nextStatus !== prevStatus) {
      store.setStatus(progress.nextStatus);
    }
  } catch {
    // store not available in headless context — that's fine, persistence is the source of truth
  }
});

export async function startBackgroundTracking() {
  const fg = await Location.getForegroundPermissionsAsync();
  if (fg.status !== 'granted') {
    const req = await Location.requestForegroundPermissionsAsync();
    if (req.status !== 'granted') return false;
  }
  const bg = await Location.getBackgroundPermissionsAsync();
  if (bg.status !== 'granted') {
    const req = await Location.requestBackgroundPermissionsAsync();
    if (req.status !== 'granted') return false;
  }

  const already = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
  if (!already) {
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.High,
      timeInterval: 15000,
      distanceInterval: 50,
      pausesUpdatesAutomatically: false,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Drift is watching',
        notificationBody: "We'll wake you at your stop.",
        notificationColor: '#5EEAD4',
      },
    });
  }
  return true;
}

export async function stopBackgroundTracking() {
  const already = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
  if (already) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }
}

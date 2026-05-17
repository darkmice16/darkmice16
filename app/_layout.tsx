import { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { useSettingsStore } from '../store/settingsStore';
import { useHistoryStore } from '../store/historyStore';
import { useTripStore } from '../store/tripStore';
import '../tasks/backgroundLocation';

export default function RootLayout() {
  const hydrateSettings = useSettingsStore(s => s.hydrate);
  const hydrateHistory = useHistoryStore(s => s.hydrate);
  const hydrateTrip = useTripStore(s => s.hydrate);

  useEffect(() => {
    hydrateSettings();
    hydrateHistory();
    hydrateTrip();
  }, []);

  // Re-hydrate trip on foreground — the BG task may have updated status while we were away
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        useTripStore.getState().hydrate();
      }
    });
    return () => sub.remove();
  }, []);

  // Notification tap → open alarm screen if it was an alarm
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.type === 'alarm') {
        router.replace('/trip/alarm');
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="trip/setup" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="trip/picker" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="trip/active" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="trip/prealarm" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="trip/alarm" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="trip/arrived" options={{ animation: 'fade' }} />
        <Stack.Screen name="trip/overshoot" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="trip-history/[id]" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

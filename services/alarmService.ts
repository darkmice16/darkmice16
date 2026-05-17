import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
      allowCriticalAlerts: true,
    },
  });
  return status === 'granted';
}

export async function scheduleWarmupNotification(stopName: string, minutesBefore: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Wake up soon',
      body: `${stopName} in ~${minutesBefore} min. Open your eyes.`,
      sound: false,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 },
  });
}

export async function fireAlarmNotification(stopName: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚠️ WAKE UP',
      body: `${stopName} — get off NOW`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
      ...(Platform.OS === 'ios' && { interruptionLevel: 'critical' }),
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 },
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export function triggerAlarmHaptics(): ReturnType<typeof setInterval> {
  return setInterval(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  }, 300);
}

export function triggerWarmupHaptics(): ReturnType<typeof setInterval> {
  return setInterval(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, 4000);
}

export function stopAlarmHaptics(interval: ReturnType<typeof setInterval>) {
  clearInterval(interval);
}

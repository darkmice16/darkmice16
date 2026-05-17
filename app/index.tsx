import { Redirect } from 'expo-router';
import { useSettingsStore } from '../store/settingsStore';
import { useTripStore } from '../store/tripStore';

export default function Index() {
  const settings = useSettingsStore(s => s.settings);
  const settingsHydrated = useSettingsStore(s => s.hydrated);
  const tripHydrated = useTripStore(s => s.hydrated);
  const trip = useTripStore(s => s.trip);

  if (!settingsHydrated || !tripHydrated) return null;

  if (trip) {
    switch (trip.status) {
      case 'alarm': return <Redirect href="/trip/alarm" />;
      case 'prealarm': return <Redirect href="/trip/prealarm" />;
      case 'active': return <Redirect href="/trip/active" />;
      case 'overshoot': return <Redirect href="/trip/overshoot" />;
    }
  }

  return <Redirect href={settings.onboardingComplete ? '/(tabs)' : '/(onboarding)/welcome'} />;
}

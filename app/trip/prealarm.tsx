import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue, withRepeat, withTiming, Easing, useAnimatedStyle, withSequence
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { useTripStore } from '../../store/tripStore';
import { useHistoryStore } from '../../store/historyStore';
import { COLORS } from '../../constants/theme';
import { PillButton } from '../../components/PillButton';
import { triggerWarmupHaptics } from '../../services/alarmService';
import { stopBackgroundTracking } from '../../tasks/backgroundLocation';

export default function PreAlarm() {
  const trip = useTripStore(s => s.trip);
  const tripHydrated = useTripStore(s => s.hydrated);
  const minutesLeft = useTripStore(s => s.minutesLeft);
  const stopsLeft = useTripStore(s => s.stopsLeft);
  const setStatus = useTripStore(s => s.setStatus);
  const snoozeTrip = useTripStore(s => s.snoozeTrip);
  const addRecord = useHistoryStore(s => s.addRecord);
  const hapticRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const borderPulse = useSharedValue(0);
  const ripple1 = useSharedValue(0);
  const ripple2 = useSharedValue(0);

  useEffect(() => {
    borderPulse.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }), -1, true);

    const startRipple = (sv: SharedValue<number>, delay: number) => {
      setTimeout(() => {
        sv.value = withRepeat(
          withSequence(withTiming(1, { duration: 1400, easing: Easing.out(Easing.ease) }), withTiming(0, { duration: 0 })),
          -1
        );
      }, delay);
    };
    startRipple(ripple1, 0);
    startRipple(ripple2, 700);

    hapticRef.current = triggerWarmupHaptics();
    return () => { if (hapticRef.current) clearInterval(hapticRef.current); };
  }, []);

  useEffect(() => {
    if (!trip) {
      if (tripHydrated) router.replace('/(tabs)');
      return;
    }
    if (trip.status === 'alarm') router.replace('/trip/alarm');
    else if (trip.status === 'arrived') router.replace('/trip/arrived');
    else if (trip.status === 'overshoot') router.replace('/trip/overshoot');
  }, [trip?.status, tripHydrated]);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(251,191,36,${0.4 + borderPulse.value * 0.6})`,
    shadowOpacity: 0.3 + borderPulse.value * 0.4,
  }));

  const rippleStyle1 = useAnimatedStyle(() => ({
    opacity: 1 - ripple1.value,
    transform: [{ scale: 1 + ripple1.value * 0.8 }],
  }));
  const rippleStyle2 = useAnimatedStyle(() => ({
    opacity: 1 - ripple2.value,
    transform: [{ scale: 1 + ripple2.value * 0.8 }],
  }));

  if (!trip) return null;

  const handleAwake = async () => {
    if (hapticRef.current) clearInterval(hapticRef.current);
    await stopBackgroundTracking();
    addRecord({
      id: trip.id,
      destination: trip.destination,
      startedAt: trip.startedAt,
      endedAt: Date.now(),
      minutesSlept: Math.round((Date.now() - trip.startedAt) / 60000),
      outcome: 'arrived',
      transportMode: trip.transportMode,
    });
    setStatus('arrived');
    router.replace('/trip/arrived');
  };

  const handleSnooze = () => {
    snoozeTrip(5);
    router.replace('/trip/active');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.border, borderStyle]}>
        {/* Ripple rings */}
        <View style={styles.rippleContainer}>
          <Animated.View style={[styles.ripple, rippleStyle1]} />
          <Animated.View style={[styles.ripple, rippleStyle2]} />
        </View>

        <View style={styles.body}>
          <Text style={styles.eyebrow}>Heads up</Text>
          <Text style={styles.headline}>
            {stopsLeft !== null ? `${stopsLeft} stop${stopsLeft !== 1 ? 's' : ''} away` : 'Almost there'}
          </Text>

          <View style={styles.destCard}>
            <Text style={styles.destEmoji}>📍</Text>
            <View>
              <Text style={styles.destName}>{trip.destination.name}</Text>
              {minutesLeft !== null && (
                <Text style={styles.destTime}>{minutesLeft} min · {trip.destination.line}</Text>
              )}
            </View>
          </View>

          <View style={styles.vibeIcon}>
            <Text style={{ fontSize: 52 }}>🔔</Text>
          </View>

          <Text style={styles.sub}>
            We're about to wake you. Sit tight — your stop is coming up.
          </Text>
        </View>

        <View style={styles.ctas}>
          <PillButton label="I'm awake" onPress={handleAwake} color={COLORS.warn} full size="lg" />
          <PillButton label="+5 min more" onPress={handleSnooze} color="rgba(255,255,255,0.1)" dark size="md" />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  border: {
    flex: 1,
    borderWidth: 3,
    borderRadius: 0,
    borderColor: COLORS.warn,
    shadowColor: COLORS.warn,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 12,
  },
  rippleContainer: { position: 'absolute', top: '30%', left: 0, right: 0, alignItems: 'center' },
  ripple: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 2, borderColor: `${COLORS.warn}44` },
  body: { flex: 1, padding: 32, paddingTop: 48, alignItems: 'center' },
  eyebrow: { fontFamily: 'Courier', fontSize: 10, letterSpacing: 2, color: COLORS.warn, textTransform: 'uppercase', marginBottom: 8 },
  headline: { fontSize: 36, fontWeight: '700', letterSpacing: -1.4, color: COLORS.text, marginBottom: 20, textAlign: 'center' },
  destCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: `${COLORS.warn}14`, borderWidth: 1, borderColor: `${COLORS.warn}44`, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 32 },
  destEmoji: { fontSize: 20 },
  destName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  destTime: { fontSize: 11, color: COLORS.textSecondary, fontFamily: 'Courier', marginTop: 2 },
  vibeIcon: { marginBottom: 24 },
  sub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 21, maxWidth: 280 },
  ctas: { padding: 24, paddingBottom: 32, gap: 10 },
});

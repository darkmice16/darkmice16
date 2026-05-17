import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, withRepeat, withTiming, Easing, useAnimatedStyle } from 'react-native-reanimated';
import { useTripStore } from '../../store/tripStore';
import { useHistoryStore } from '../../store/historyStore';
import { COLORS } from '../../constants/theme';
import { PillButton } from '../../components/PillButton';
import { stopBackgroundTracking } from '../../tasks/backgroundLocation';

export default function Overshoot() {
  const trip = useTripStore(s => s.trip);
  const tripHydrated = useTripStore(s => s.hydrated);
  const resetTrip = useTripStore(s => s.resetTrip);
  const addRecord = useHistoryStore(s => s.addRecord);

  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: 0.5 + pulse.value * 0.5 }));

  useEffect(() => {
    if (tripHydrated && !trip) router.replace('/(tabs)');
  }, [tripHydrated, trip]);

  if (!trip) return null;

  const acknowledge = async (outcome: 'overshoot' | 'cancelled') => {
    await stopBackgroundTracking();
    addRecord({
      id: trip.id,
      destination: trip.destination,
      startedAt: trip.startedAt,
      endedAt: Date.now(),
      minutesSlept: Math.round((Date.now() - trip.startedAt) / 60000),
      outcome,
      transportMode: trip.transportMode,
    });
    resetTrip();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <Animated.View style={[styles.iconWrap, pulseStyle]}>
          <Text style={styles.iconText}>⚠️</Text>
        </Animated.View>

        <Text style={styles.eyebrow}>Overshoot</Text>
        <Text style={styles.headline}>You passed{'\n'}your stop</Text>
        <Text style={styles.sub}>
          We didn't manage to wake you in time. Head back when you can — your stop was{' '}
          <Text style={styles.bold}>{trip.destination.name}</Text>.
        </Text>

        <View style={styles.tipCard}>
          <Text style={styles.tipLabel}>What now?</Text>
          <Text style={styles.tipText}>• Get off at the next stop{'\n'}• Take the train back in the other direction{'\n'}• We'll set a slightly earlier wake-up next time</Text>
        </View>
      </View>

      <View style={styles.ctas}>
        <PillButton label="Got it — log overshoot" onPress={() => acknowledge('overshoot')} color={COLORS.warn} full size="lg" />
        <PillButton label="Cancel trip" onPress={() => acknowledge('cancelled')} color="rgba(255,255,255,0.08)" dark size="md" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  body: { flex: 1, padding: 32, paddingTop: 48, alignItems: 'center' },
  iconWrap: { width: 120, height: 120, borderRadius: 60, backgroundColor: `${COLORS.warn}1f`, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  iconText: { fontSize: 56 },
  eyebrow: { fontFamily: 'Courier', fontSize: 10, letterSpacing: 2, color: COLORS.warn, textTransform: 'uppercase', marginBottom: 12 },
  headline: { fontSize: 36, fontWeight: '700', letterSpacing: -1.2, lineHeight: 42, color: COLORS.text, textAlign: 'center', marginBottom: 16 },
  sub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 21, marginBottom: 28 },
  bold: { color: COLORS.text, fontWeight: '600' },
  tipCard: { alignSelf: 'stretch', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 16, gap: 8 },
  tipLabel: { fontFamily: 'Courier', fontSize: 9, letterSpacing: 1.4, color: COLORS.textTertiary, textTransform: 'uppercase' },
  tipText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 22 },
  ctas: { padding: 24, paddingBottom: 32, gap: 10 },
});

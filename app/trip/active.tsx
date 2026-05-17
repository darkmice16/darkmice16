import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, withRepeat, withTiming, Easing, useAnimatedStyle } from 'react-native-reanimated';
import { useTripStore } from '../../store/tripStore';
import { useHistoryStore } from '../../store/historyStore';
import { COLORS } from '../../constants/theme';
import { TransitLine } from '../../components/TransitLine';
import { PillButton } from '../../components/PillButton';
import { stopBackgroundTracking } from '../../tasks/backgroundLocation';

export default function ActiveTrip() {
  const trip = useTripStore(s => s.trip);
  const tripHydrated = useTripStore(s => s.hydrated);
  const minutesLeft = useTripStore(s => s.minutesLeft);
  const stopsLeft = useTripStore(s => s.stopsLeft);
  const gpsConfidence = useTripStore(s => s.gpsConfidence);
  const currentStopIndex = useTripStore(s => s.currentStopIndex);
  const resetTrip = useTripStore(s => s.resetTrip);
  const addRecord = useHistoryStore(s => s.addRecord);

  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.06, { duration: 2400, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  useEffect(() => {
    if (!trip) {
      if (tripHydrated) router.replace('/(tabs)');
      return;
    }
    if (trip.status === 'prealarm') router.replace('/trip/prealarm');
    else if (trip.status === 'alarm') router.replace('/trip/alarm');
    else if (trip.status === 'arrived') router.replace('/trip/arrived');
    else if (trip.status === 'overshoot') router.replace('/trip/overshoot');
  }, [trip?.status, tripHydrated]);

  if (!trip) return null;

  const handleStop = () => {
    Alert.alert('End trip?', 'Your trip will be cancelled and the alarm turned off.', [
      { text: 'Keep going', style: 'cancel' },
      {
        text: 'End trip', style: 'destructive', onPress: async () => {
          await stopBackgroundTracking();
          addRecord({
            id: trip.id,
            destination: trip.destination,
            startedAt: trip.startedAt,
            endedAt: Date.now(),
            minutesSlept: Math.round((Date.now() - trip.startedAt) / 60000),
            outcome: 'cancelled',
            transportMode: trip.transportMode,
          });
          resetTrip();
          router.replace('/(tabs)');
        }
      },
    ]);
  };

  const targetIdx = trip.stops.length - 1;
  const gpsColor = gpsConfidence === 'high' ? COLORS.success : gpsConfidence === 'medium' ? COLORS.warn : COLORS.alarm;


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Active trip</Text>
        <View style={[styles.gpsDot, { backgroundColor: gpsColor }]} />
      </View>

      {/* Big sleep indicator */}
      <View style={styles.heroWrap}>
        <Animated.View style={[styles.heroOuter, pulseStyle]}>
          <View style={styles.heroInner}>
            <Text style={styles.heroEmoji}>💤</Text>
          </View>
        </Animated.View>

        <Text style={styles.destLabel}>Heading to</Text>
        <Text style={styles.destName}>{trip.destination.name}</Text>

        {minutesLeft !== null ? (
          <View style={styles.timeRow}>
            <Text style={styles.timeValue}>{minutesLeft}</Text>
            <Text style={styles.timeUnit}>min away</Text>
          </View>
        ) : (
          <Text style={styles.locating}>Locating…</Text>
        )}
      </View>

      {/* Transit line visualization */}
      <View style={styles.lineWrap}>
        <TransitLine
          stops={trip.stops}
          currentIdx={currentStopIndex}
          targetIdx={targetIdx}
          state="calm"
          height={100}
        />
      </View>

      {/* Stats strip */}
      <View style={styles.statsStrip}>
        <Stat label="Stops left" value={stopsLeft !== null ? String(stopsLeft) : '—'} />
        <View style={styles.statDivider} />
        <Stat label="Mode" value={trip.transportMode} />
        <View style={styles.statDivider} />
        <Stat label="Alarm at" value={`${trip.wakeOffsetMinutes}m before`} />
      </View>

      {/* Reassurance */}
      <View style={styles.reassure}>
        <Text style={styles.reassureText}>We'll wake you up. Go ahead and rest 😌</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <PillButton label="End trip" onPress={handleStop} color={COLORS.alarm} size="md" />
      </View>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 },
  eyebrow: { fontFamily: 'Courier', fontSize: 10, letterSpacing: 2, color: COLORS.textTertiary, textTransform: 'uppercase' },
  gpsDot: { width: 8, height: 8, borderRadius: 4 },
  heroWrap: { alignItems: 'center', paddingTop: 24, paddingBottom: 16 },
  heroOuter: { width: 120, height: 120, borderRadius: 60, backgroundColor: `${COLORS.calm}1f`, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  heroInner: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.calm, alignItems: 'center', justifyContent: 'center' },
  heroEmoji: { fontSize: 36 },
  destLabel: { fontFamily: 'Courier', fontSize: 9, letterSpacing: 1.4, color: COLORS.textTertiary, textTransform: 'uppercase', marginBottom: 6 },
  destName: { fontSize: 18, fontWeight: '600', color: COLORS.text, letterSpacing: -0.4, textAlign: 'center', paddingHorizontal: 32 },
  timeRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 10 },
  timeValue: { fontSize: 52, fontWeight: '700', color: COLORS.calm, letterSpacing: -2 },
  timeUnit: { fontSize: 16, color: COLORS.textSecondary },
  locating: { fontSize: 14, color: COLORS.textTertiary, marginTop: 10 },
  lineWrap: { paddingHorizontal: 24, marginBottom: 8 },
  statsStrip: { flexDirection: 'row', backgroundColor: COLORS.surface, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border, paddingVertical: 12, paddingHorizontal: 24 },
  stat: { flex: 1, alignItems: 'center' },
  statLabel: { fontFamily: 'Courier', fontSize: 8, letterSpacing: 1.2, color: COLORS.textTertiary, textTransform: 'uppercase', marginBottom: 4 },
  statValue: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  reassure: { paddingHorizontal: 32, paddingVertical: 16, alignItems: 'center' },
  reassureText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  controls: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 32, alignItems: 'center' },
});

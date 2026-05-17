import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, withRepeat, withTiming, Easing, useAnimatedStyle } from 'react-native-reanimated';
import { useTripStore } from '../../store/tripStore';
import { useHistoryStore } from '../../store/historyStore';
import { COLORS } from '../../constants/theme';
import { PillButton } from '../../components/PillButton';

export default function Arrived() {
  const trip = useTripStore(s => s.trip);
  const resetTrip = useTripStore(s => s.resetTrip);
  const records = useHistoryStore(s => s.records);
  const streak = useHistoryStore(s => s.streak);

  const breathe = useSharedValue(1);
  useEffect(() => {
    breathe.value = withRepeat(withTiming(1.08, { duration: 2800, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);
  const breatheStyle = useAnimatedStyle(() => ({ transform: [{ scale: breathe.value }] }));

  const latestRecord = records[0];
  const displayDest = trip?.destination ?? latestRecord?.destination;
  const displayMode = trip?.transportMode ?? latestRecord?.transportMode;

  const handleDone = () => {
    resetTrip();
    router.replace('/(tabs)');
  };

  const handleViewHistory = () => {
    resetTrip();
    router.replace('/(tabs)/history');
  };

  const minutesSlept = latestRecord?.minutesSlept ?? (trip ? Math.round((Date.now() - trip.startedAt) / 60000) : 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        {/* Check */}
        <Animated.View style={[styles.checkOuter, breatheStyle]}>
          <View style={styles.checkInner}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </Animated.View>

        <Text style={styles.eyebrow}>You made it</Text>
        <Text style={styles.headline}>
          {displayDest?.name.split('—')[0].trim() ?? 'Destination'}
        </Text>
        <Text style={styles.destFull}>{displayDest?.name}</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatItem icon="💤" label="Slept" value={`${minutesSlept}m`} />
          <View style={styles.statDivider} />
          <StatItem icon="🚇" label="Mode" value={displayMode ?? '—'} />
          {streak > 0 && (
            <>
              <View style={styles.statDivider} />
              <StatItem icon="🔥" label="Streak" value={`${streak} trips`} />
            </>
          )}
        </View>

        {latestRecord?.outcome === 'arrived' && (
          <View style={styles.successNote}>
            <Text style={styles.successText}>Successfully woken at your stop 🎉</Text>
          </View>
        )}
      </View>

      <View style={styles.ctas}>
        <PillButton label="Done" onPress={handleDone} color={COLORS.success} full size="lg" />
        <PillButton label="View in history" onPress={handleViewHistory} color="rgba(255,255,255,0.08)" dark size="md" />
      </View>
    </SafeAreaView>
  );
}

function StatItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  body: { flex: 1, alignItems: 'center', paddingTop: 48, paddingHorizontal: 32 },
  checkOuter: { width: 140, height: 140, borderRadius: 70, backgroundColor: `${COLORS.success}1a`, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  checkInner: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.success, alignItems: 'center', justifyContent: 'center' },
  checkmark: { fontSize: 44, color: COLORS.bg, fontWeight: '700' },
  eyebrow: { fontFamily: 'Courier', fontSize: 10, letterSpacing: 2, color: COLORS.success, textTransform: 'uppercase', marginBottom: 10 },
  headline: { fontSize: 28, fontWeight: '700', letterSpacing: -1, color: COLORS.text, textAlign: 'center', marginBottom: 4 },
  destFull: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 32 },
  statsRow: { flexDirection: 'row', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 8, alignSelf: 'stretch', marginBottom: 16 },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  statLabel: { fontFamily: 'Courier', fontSize: 8, letterSpacing: 1, color: COLORS.textTertiary, textTransform: 'uppercase' },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  successNote: { backgroundColor: `${COLORS.success}12`, borderWidth: 1, borderColor: `${COLORS.success}30`, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  successText: { fontSize: 13, color: COLORS.success, textAlign: 'center' },
  ctas: { paddingHorizontal: 24, paddingBottom: 32, gap: 10 },
});

import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useHistoryStore } from '../../store/historyStore';
import { COLORS } from '../../constants/theme';
import { TripRecord } from '../../types';

export default function TripDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const records = useHistoryStore(s => s.records);
  const record: TripRecord | undefined = records.find(r => r.id === id);

  if (!record) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Trip not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>← Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const outcomeColor = record.outcome === 'arrived' ? COLORS.success : record.outcome === 'overshoot' ? COLORS.warn : COLORS.alarm;
  const outcomeEmoji = record.outcome === 'arrived' ? '✅' : record.outcome === 'overshoot' ? '⚠️' : '⏹';
  const outcomeLabel = record.outcome === 'arrived' ? 'Arrived safely' : record.outcome === 'overshoot' ? 'Overshot stop' : 'Trip cancelled';
  const tripDuration = Math.round((record.endedAt - record.startedAt) / 60000);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Outcome banner */}
        <View style={[styles.outcomeBanner, { backgroundColor: `${outcomeColor}12`, borderColor: `${outcomeColor}40` }]}>
          <Text style={styles.outcomeEmoji}>{outcomeEmoji}</Text>
          <View>
            <Text style={[styles.outcomeLabel, { color: outcomeColor }]}>{outcomeLabel}</Text>
            <Text style={styles.outcomeSub}>{formatFullDate(record.startedAt)}</Text>
          </View>
        </View>

        {/* Destination */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Destination</Text>
          <View style={styles.destRow}>
            <View style={styles.destIcon}>
              <Text style={{ fontSize: 20 }}>📍</Text>
            </View>
            <View>
              <Text style={styles.destName}>{record.destination.name}</Text>
              <Text style={styles.destLine}>{record.destination.line}</Text>
            </View>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatBox icon="💤" label="Slept" value={`${record.minutesSlept}m`} />
          <StatBox icon="⏱" label="Total trip" value={`${tripDuration}m`} />
          <StatBox icon="🚇" label="Mode" value={record.transportMode} />
          <StatBox icon="📅" label="Time" value={formatTime(record.startedAt)} />
        </View>

        {/* Map placeholder */}
        <View style={styles.mapCard}>
          <Text style={styles.cardLabel}>Route</Text>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>🗺️</Text>
            <Text style={styles.mapNote}>Map view coming soon</Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Timeline</Text>
          <TimelineItem icon="🚀" label="Trip started" time={formatTime(record.startedAt)} first />
          <TimelineItem icon="💤" label="Monitoring active" time={formatTime(record.startedAt + 60000)} />
          <TimelineItem icon="🔔" label="Pre-alarm triggered" time={formatTime(record.startedAt + (record.endedAt - record.startedAt) * 0.8)} />
          <TimelineItem icon={outcomeEmoji} label={outcomeLabel} time={formatTime(record.endedAt)} last />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={{ fontSize: 22, marginBottom: 6 }}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function TimelineItem({ icon, label, time, first, last }: { icon: string; label: string; time: string; first?: boolean; last?: boolean }) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineLeft}>
        {!first && <View style={styles.timelineLine} />}
        <View style={styles.timelineDot}>
          <Text style={{ fontSize: 12 }}>{icon}</Text>
        </View>
        {!last && <View style={[styles.timelineLine, styles.timelineLineBottom]} />}
      </View>
      <View style={styles.timelineContent}>
        <Text style={styles.timelineLabel}>{label}</Text>
        <Text style={styles.timelineTime}>{time}</Text>
      </View>
    </View>
  );
}

function formatFullDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  nav: { paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 4 },
  backText: { fontSize: 14, color: COLORS.calm },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },
  outcomeBanner: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderRadius: 16, padding: 16 },
  outcomeEmoji: { fontSize: 32 },
  outcomeLabel: { fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
  outcomeSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  card: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 16 },
  cardLabel: { fontFamily: 'Courier', fontSize: 9, letterSpacing: 1.4, color: COLORS.textTertiary, textTransform: 'uppercase', marginBottom: 12 },
  destRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  destIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: `${COLORS.calm}1f`, alignItems: 'center', justifyContent: 'center' },
  destName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  destLine: { fontSize: 11, color: COLORS.textSecondary, fontFamily: 'Courier', marginTop: 2 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statBox: { flex: 1, minWidth: '45%', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 14, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: COLORS.text, letterSpacing: -0.5 },
  statLabel: { fontFamily: 'Courier', fontSize: 9, letterSpacing: 1, color: COLORS.textTertiary, textTransform: 'uppercase', marginTop: 2 },
  mapCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 16 },
  mapPlaceholder: { height: 140, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
  mapPlaceholderText: { fontSize: 36 },
  mapNote: { fontSize: 12, color: COLORS.textTertiary },
  timelineRow: { flexDirection: 'row', gap: 14, minHeight: 52 },
  timelineLeft: { width: 28, alignItems: 'center' },
  timelineLine: { width: 1, flex: 1, backgroundColor: COLORS.border },
  timelineLineBottom: { flex: 1 },
  timelineDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  timelineContent: { flex: 1, paddingTop: 4, paddingBottom: 16 },
  timelineLabel: { fontSize: 13, fontWeight: '500', color: COLORS.text },
  timelineTime: { fontSize: 10, color: COLORS.textTertiary, fontFamily: 'Courier', marginTop: 2 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, color: COLORS.textSecondary },
  backLink: { fontSize: 14, color: COLORS.calm },
});

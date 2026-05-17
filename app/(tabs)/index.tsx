import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useHistoryStore } from '../../store/historyStore';
import { COLORS } from '../../constants/theme';
import { PillButton } from '../../components/PillButton';

const RECENTS = [
  { id: 's1', label: 'Home — Atlantic Av', sub: 'Last used 2h ago · B train', count: 23 },
  { id: 's2', label: 'Work — 96 St Cornell Med', sub: '4 train · weekday only', count: 18 },
  { id: 's3', label: "Mom's — Forest Hills", sub: 'Q train · last Sunday', count: 4 },
];

export default function Home() {
  const records = useHistoryStore(s => s.records);
  const streak = useHistoryStore(s => s.streak);

  const thisWeek = records.filter(r => r.startedAt > Date.now() - 7 * 24 * 3600 * 1000);
  const sleptMinutes = thisWeek.reduce((s, r) => s + r.minutesSlept, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.wordmark}>drift</Text>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
        </View>

        <View style={styles.greeting}>
          <Text style={styles.timeLabel}>{getDayLabel()}</Text>
          <Text style={styles.greetingText}>
            {getGreeting()}{'\n'}
            <Text style={{ color: COLORS.textSecondary }}>Where are we{'\n'}headed?</Text>
          </Text>
        </View>

        {/* Hero CTA */}
        <TouchableOpacity style={styles.heroCta} onPress={() => router.push('/trip/setup')} activeOpacity={0.9}>
          <View style={styles.heroIcon}>
            <Text style={{ fontSize: 24 }}>💤</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>New trip</Text>
            <Text style={styles.heroSub}>Pick a stop · sleep · we wake you</Text>
          </View>
          <Text style={{ color: COLORS.bg, fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        {/* Recents */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Recent stops</Text>
            <Text style={styles.sectionAction}>See all</Text>
          </View>
          {RECENTS.map((r, i) => (
            <TouchableOpacity
              key={r.id}
              style={styles.recentRow}
              onPress={() => router.push({ pathname: '/trip/setup', params: { destinationId: r.id } })}
              activeOpacity={0.7}
            >
              <View style={[styles.recentIcon, i === 0 && { backgroundColor: `${COLORS.calm}1f` }]}>
                <Text style={{ fontSize: 16 }}>📍</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.recentLabel} numberOfLines={1}>{r.label}</Text>
                <Text style={styles.recentSub}>{r.sub}</Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{r.count}×</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats */}
        {thisWeek.length > 0 && (
          <View style={styles.statsCard}>
            <View>
              <Text style={styles.statsLabel}>This week</Text>
              <Text style={styles.statsValue}>
                <Text style={{ color: COLORS.calm }}>{thisWeek.length} trips</Text>
                <Text style={styles.statsMuted}>  · {sleptMinutes}m slept</Text>
              </Text>
            </View>
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>🔥 {streak}-day streak</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getDayLabel() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', hour: '2-digit', minute: '2-digit' });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning.';
  if (h < 17) return 'Afternoon.';
  return 'Evening.';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 12 },
  wordmark: { fontSize: 18, fontWeight: '700', color: COLORS.text, letterSpacing: -0.5 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.calm, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '600', color: COLORS.bg },
  greeting: { paddingHorizontal: 24, marginBottom: 24 },
  timeLabel: { fontFamily: 'Courier', fontSize: 10, letterSpacing: 2, color: COLORS.textTertiary, textTransform: 'uppercase', marginBottom: 8 },
  greetingText: { fontSize: 32, fontWeight: '600', letterSpacing: -1.2, lineHeight: 38, color: COLORS.text },
  heroCta: { marginHorizontal: 20, marginBottom: 8, backgroundColor: COLORS.calm, borderRadius: 22, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(8,11,20,0.18)', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 18, fontWeight: '700', color: COLORS.bg, letterSpacing: -0.4 },
  heroSub: { fontSize: 12, color: 'rgba(8,11,20,0.7)', marginTop: 2 },
  section: { padding: 24, paddingTop: 16, gap: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sectionLabel: { fontFamily: 'Courier', fontSize: 10, letterSpacing: 1.4, color: COLORS.textTertiary, textTransform: 'uppercase' },
  sectionAction: { fontSize: 12, color: COLORS.calm },
  recentRow: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  recentIcon: { width: 36, height: 36, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  recentLabel: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  recentSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
  countBadge: { backgroundColor: 'rgba(255,255,255,0.04)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5 },
  countText: { fontFamily: 'Courier', fontSize: 10, color: COLORS.textTertiary },
  statsCard: { marginHorizontal: 24, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statsLabel: { fontFamily: 'Courier', fontSize: 9, letterSpacing: 1.4, color: COLORS.textTertiary, textTransform: 'uppercase' },
  statsValue: { fontSize: 18, fontWeight: '600', marginTop: 4, letterSpacing: -0.3 },
  statsMuted: { fontSize: 13, fontWeight: '400', color: COLORS.textSecondary },
  streakBadge: { backgroundColor: `${COLORS.success}14`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  streakText: { fontFamily: 'Courier', fontSize: 10, color: COLORS.success, letterSpacing: 0.6 },
});

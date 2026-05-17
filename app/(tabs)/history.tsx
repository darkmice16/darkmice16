import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useHistoryStore } from '../../store/historyStore';
import { COLORS } from '../../constants/theme';

export default function History() {
  const records = useHistoryStore(s => s.records);
  const streak = useHistoryStore(s => s.streak);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Your trips</Text>
          <Text style={styles.title}>History</Text>
          {streak > 0 && <Text style={styles.streak}>🔥 {streak}-trip streak</Text>}
        </View>

        {records.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💤</Text>
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptySub}>Start your first trip to see your history here.</Text>
          </View>
        ) : (
          records.map(r => (
            <TouchableOpacity
              key={r.id}
              style={styles.card}
              onPress={() => router.push({ pathname: '/trip-history/[id]', params: { id: r.id } })}
              activeOpacity={0.7}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.outcomeIcon, { backgroundColor: r.outcome === 'arrived' ? `${COLORS.success}22` : `${COLORS.alarm}22` }]}>
                  <Text>{r.outcome === 'arrived' ? '✅' : r.outcome === 'overshoot' ? '⚠️' : '⏹'}</Text>
                </View>
                <View>
                  <Text style={styles.cardDest} numberOfLines={1}>{r.destination.name}</Text>
                  <Text style={styles.cardMeta}>{formatDate(r.startedAt)} · {r.minutesSlept}m slept</Text>
                </View>
              </View>
              <View style={[styles.outcomeBadge, { borderColor: r.outcome === 'arrived' ? COLORS.success : COLORS.alarm }]}>
                <Text style={[styles.outcomeText, { color: r.outcome === 'arrived' ? COLORS.success : COLORS.alarm }]}>
                  {r.outcome === 'arrived' ? 'arrived' : r.outcome === 'overshoot' ? 'overshoot' : 'cancelled'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 32 },
  header: { padding: 24, paddingTop: 12 },
  eyebrow: { fontFamily: 'Courier', fontSize: 10, letterSpacing: 2, color: COLORS.textTertiary, textTransform: 'uppercase', marginBottom: 6 },
  title: { fontSize: 28, fontWeight: '600', letterSpacing: -1, color: COLORS.text },
  streak: { marginTop: 8, fontSize: 13, color: COLORS.success, fontWeight: '500' },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  card: { marginHorizontal: 16, marginBottom: 8, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  outcomeIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardDest: { fontSize: 14, fontWeight: '600', color: COLORS.text, maxWidth: 180 },
  cardMeta: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  outcomeBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  outcomeText: { fontFamily: 'Courier', fontSize: 10, letterSpacing: 0.6 },
});

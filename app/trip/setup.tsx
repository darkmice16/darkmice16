import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTripStore } from '../../store/tripStore';
import { useSettingsStore } from '../../store/settingsStore';
import { COLORS } from '../../constants/theme';
import { PillButton } from '../../components/PillButton';
import { TransportMode, Stop } from '../../types';
import { startBackgroundTracking } from '../../tasks/backgroundLocation';

const MOCK_STOPS: Stop[] = [
  { id: 's1', name: 'Atlantic Av — Barclays Ctr', lat: 40.6843, lng: -73.9774, line: 'B/Q/2/3/4/5', distanceKm: 0 },
  { id: 's2', name: '96 St — Cornell Medical', lat: 40.7838, lng: -73.9534, line: '4/5/6', distanceKm: 0 },
  { id: 's3', name: 'Forest Hills — 71 Av', lat: 40.7189, lng: -73.8447, line: 'E/F/M/R', distanceKm: 0 },
  { id: 's4', name: 'Times Sq — 42 St', lat: 40.7558, lng: -73.9871, line: '1/2/3/7/N/Q/R/W', distanceKm: 0 },
  { id: 's5', name: 'Grand Central — 42 St', lat: 40.7527, lng: -73.9772, line: '4/5/6/7/S', distanceKm: 0 },
];

const MODES: { id: TransportMode; label: string; emoji: string }[] = [
  { id: 'train', label: 'Train', emoji: '🚇' },
  { id: 'bus', label: 'Bus', emoji: '🚌' },
  { id: 'car', label: 'Car', emoji: '🚗' },
  { id: 'walking', label: 'Walk', emoji: '🚶' },
];

export default function TripSetup() {
  const { destinationId } = useLocalSearchParams<{ destinationId?: string }>();
  const settings = useSettingsStore(s => s.settings);
  const startTrip = useTripStore(s => s.startTrip);
  const pickedStop = useTripStore(s => s.pickedStop);
  const setPickedStop = useTripStore(s => s.setPickedStop);

  const preselected = destinationId ? MOCK_STOPS.find(s => s.id === destinationId) ?? null : null;
  const [destination, setDestination] = useState<Stop | null>(preselected);
  const [mode, setMode] = useState<TransportMode>('train');
  const [wakeOffset, setWakeOffset] = useState(settings.defaultWakeOffsetMinutes);
  const [smsEnabled, setSmsEnabled] = useState(settings.smsEnabled);

  useEffect(() => {
    if (pickedStop) {
      setDestination(pickedStop);
      setPickedStop(null);
    }
  }, [pickedStop]);

  const canStart = destination !== null;

  const handleStart = async () => {
    if (!destination) return;

    const ok = await startBackgroundTracking();
    if (!ok) {
      Alert.alert(
        'Location permission needed',
        "Drift can't wake you at your stop without Always-Allow location. Open Settings to enable it.",
        [{ text: 'OK' }]
      );
      return;
    }

    const stops: Stop[] = [
      { id: 'current', name: 'Current location', lat: 40.7128, lng: -74.006, line: '', distanceKm: 0 },
      ...MOCK_STOPS.slice(0, 3),
      destination,
    ];

    startTrip({
      id: Date.now().toString(),
      destination,
      stops,
      transportMode: mode,
      wakeOffsetMinutes: wakeOffset,
      smsEnabled,
      startedAt: Date.now(),
      status: 'active' as const,
      events: [],
    });

    router.replace('/trip/active');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>New trip</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Destination */}
        <View style={styles.block}>
          <Text style={styles.blockLabel}>Destination stop</Text>
          {destination ? (
            <TouchableOpacity
              style={styles.destinationCard}
              onPress={() => router.push('/trip/picker')}
              activeOpacity={0.8}
            >
              <View style={styles.destIconWrap}>
                <Text style={{ fontSize: 20 }}>📍</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.destName}>{destination.name}</Text>
                <Text style={styles.destLine}>{destination.line}</Text>
              </View>
              <Text style={styles.changeBtn}>Change</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.pickDestBtn}
              onPress={() => router.push('/trip/picker')}
              activeOpacity={0.8}
            >
              <Text style={styles.pickDestIcon}>🔍</Text>
              <Text style={styles.pickDestText}>Search for your stop…</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Transport mode */}
        <View style={styles.block}>
          <Text style={styles.blockLabel}>Getting there by</Text>
          <View style={styles.modeRow}>
            {MODES.map(m => (
              <TouchableOpacity
                key={m.id}
                style={[styles.modeChip, mode === m.id && styles.modeChipActive]}
                onPress={() => setMode(m.id)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 18 }}>{m.emoji}</Text>
                <Text style={[styles.modeLabel, mode === m.id && styles.modeLabelActive]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Wake offset */}
        <View style={styles.block}>
          <View style={styles.blockHeader}>
            <Text style={styles.blockLabel}>Wake me up</Text>
            <Text style={styles.offsetValue}>{wakeOffset} min before</Text>
          </View>
          <View style={styles.offsetTrack}>
            {[2, 3, 5, 7, 10, 15].map(v => (
              <TouchableOpacity
                key={v}
                style={[styles.offsetBtn, wakeOffset === v && styles.offsetBtnActive]}
                onPress={() => setWakeOffset(v)}
              >
                <Text style={[styles.offsetBtnText, wakeOffset === v && styles.offsetBtnTextActive]}>{v}m</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SMS toggle */}
        {settings.emergencyContact && (
          <View style={styles.block}>
            <TouchableOpacity
              style={styles.smsRow}
              onPress={() => setSmsEnabled(!smsEnabled)}
              activeOpacity={0.8}
            >
              <View style={[styles.smsIcon, smsEnabled && styles.smsIconActive]}>
                <Text style={{ fontSize: 18 }}>💬</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Emergency SMS</Text>
                <Text style={styles.rowSub}>
                  Text {settings.emergencyContact.name} if alarm goes unacknowledged
                </Text>
              </View>
              <View style={[styles.toggle, smsEnabled && styles.toggleOn]}>
                <View style={[styles.toggleDot, smsEnabled && styles.toggleDotOn]} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick picks (shown when no destination set) */}
        {!destination && (
          <View style={styles.block}>
            <Text style={styles.blockLabel}>Recent stops</Text>
            {MOCK_STOPS.slice(0, 3).map(stop => (
              <TouchableOpacity
                key={stop.id}
                style={styles.recentRow}
                onPress={() => setDestination(stop)}
                activeOpacity={0.7}
              >
                <Text style={styles.recentEmoji}>📍</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentName}>{stop.name}</Text>
                  <Text style={styles.recentLine}>{stop.line}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PillButton
          label={canStart ? `Sleep to ${destination!.name.split('—')[0].trim()}` : 'Pick a destination first'}
          onPress={handleStart}
          color={COLORS.calm}
          full
          size="lg"
          disabled={!canStart}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 4 },
  backText: { fontSize: 14, color: COLORS.calm },
  navTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  scroll: { padding: 16, gap: 8, paddingBottom: 24 },
  block: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 16, marginBottom: 8 },
  blockLabel: { fontFamily: 'Courier', fontSize: 9, letterSpacing: 1.4, color: COLORS.textTertiary, textTransform: 'uppercase', marginBottom: 12 },
  blockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  destinationCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  destIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: `${COLORS.calm}1f`, alignItems: 'center', justifyContent: 'center' },
  destName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  destLine: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2, fontFamily: 'Courier' },
  changeBtn: { fontSize: 12, color: COLORS.calm },
  pickDestBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 14 },
  pickDestIcon: { fontSize: 18 },
  pickDestText: { fontSize: 14, color: COLORS.textSecondary },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: COLORS.border, gap: 4 },
  modeChipActive: { backgroundColor: `${COLORS.calm}1f`, borderColor: COLORS.calm },
  modeLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '500' },
  modeLabelActive: { color: COLORS.calm },
  offsetValue: { fontSize: 14, fontWeight: '600', color: COLORS.calm },
  offsetTrack: { flexDirection: 'row', gap: 8 },
  offsetBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: COLORS.border },
  offsetBtnActive: { backgroundColor: `${COLORS.calm}1f`, borderColor: COLORS.calm },
  offsetBtnText: { fontFamily: 'Courier', fontSize: 11, color: COLORS.textSecondary },
  offsetBtnTextActive: { color: COLORS.calm },
  smsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  smsIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  smsIconActive: { backgroundColor: `${COLORS.calm}1f` },
  rowLabel: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  rowSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: COLORS.border, justifyContent: 'center', paddingHorizontal: 2 },
  toggleOn: { backgroundColor: `${COLORS.calm}88` },
  toggleDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.textTertiary },
  toggleDotOn: { backgroundColor: COLORS.calm, alignSelf: 'flex-end' },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  recentEmoji: { fontSize: 18 },
  recentName: { fontSize: 13, fontWeight: '500', color: COLORS.text },
  recentLine: { fontSize: 10, color: COLORS.textSecondary, fontFamily: 'Courier', marginTop: 1 },
  footer: { padding: 20, paddingBottom: 32 },
});

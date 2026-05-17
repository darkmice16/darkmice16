import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { COLORS } from '../../constants/theme';
import { PillButton } from '../../components/PillButton';

const DOTS = [
  { current: 1, total: 5 }
];

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 20 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ width: i === current ? 24 : 6, height: 4, borderRadius: 2, backgroundColor: i <= current ? COLORS.calm : 'rgba(255,255,255,0.12)' }} />
      ))}
    </View>
  );
}

export default function LocationPermission() {
  const handleContinue = async () => {
    await Location.requestForegroundPermissionsAsync();
    await Location.requestBackgroundPermissionsAsync();
    router.push('/(onboarding)/notifications');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProgressDots current={1} total={5} />

      <View style={styles.body}>
        <Text style={styles.step}>1 of 2 permissions</Text>
        <Text style={styles.headline}>Allow location{'\n'}while you sleep.</Text>

        {/* Mock iOS permission sheet */}
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <View style={styles.pinIcon}>
              <Text style={{ color: COLORS.calm, fontSize: 18 }}>📍</Text>
            </View>
            <Text style={styles.sheetTitle}>Allow "Drift" to use your location?</Text>
            <Text style={styles.sheetBody}>
              We only track during active trips — so we can wake you at the right stop, even when your phone is asleep.
            </Text>
          </View>
          {['Allow Once', 'Allow While Using App', 'Allow Always'].map((label, i) => (
            <View key={i} style={[styles.sheetRow, i < 2 && styles.sheetRowBorder]}>
              <Text style={[styles.sheetRowText, i === 2 && { color: COLORS.calm, fontWeight: '600' }]}>
                {label}
              </Text>
              {i === 2 && (
                <View style={styles.recBadge}>
                  <Text style={styles.recText}>RECOMMENDED</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.privacyNote}>
          <Text style={styles.shieldIcon}>🔒</Text>
          <Text style={styles.privacyText}>Your location stays on your device. We never share your trips.</Text>
        </View>
      </View>

      <View style={styles.ctas}>
        <PillButton label="Continue" onPress={handleContinue} color={COLORS.calm} full size="lg" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  body: { flex: 1, padding: 24, paddingTop: 28 },
  step: { fontFamily: 'Courier', fontSize: 10, letterSpacing: 2, color: COLORS.textTertiary, textTransform: 'uppercase', marginBottom: 10 },
  headline: { fontSize: 32, fontWeight: '600', letterSpacing: -1.2, lineHeight: 38, color: COLORS.text, marginBottom: 24 },
  sheet: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: COLORS.border, borderRadius: 18, overflow: 'hidden', marginBottom: 18 },
  sheetHeader: { padding: 18, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  pinIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: `${COLORS.calm}22`, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  sheetTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, textAlign: 'center', marginBottom: 6 },
  sheetBody: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 18 },
  sheetRow: { padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  sheetRowText: { fontSize: 15, color: COLORS.text },
  recBadge: { backgroundColor: `${COLORS.calm}22`, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5 },
  recText: { fontFamily: 'Courier', fontSize: 9, letterSpacing: 1, color: COLORS.calm },
  privacyNote: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  shieldIcon: { fontSize: 14 },
  privacyText: { flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
  ctas: { paddingHorizontal: 24, paddingBottom: 32 },
});

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, withRepeat, withTiming, Easing, useAnimatedStyle } from 'react-native-reanimated';
import { useSettingsStore } from '../../store/settingsStore';
import { COLORS } from '../../constants/theme';
import { PillButton } from '../../components/PillButton';

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 20 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ width: i === current ? 24 : 6, height: 4, borderRadius: 2, backgroundColor: i <= current ? COLORS.calm : 'rgba(255,255,255,0.12)' }} />
      ))}
    </View>
  );
}

export default function Ready() {
  const updateSettings = useSettingsStore(s => s.updateSettings);
  const emergencyContact = useSettingsStore(s => s.settings.emergencyContact);

  const breathe = useSharedValue(1);
  React.useEffect(() => {
    breathe.value = withRepeat(withTiming(1.04, { duration: 3000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);
  const breatheStyle = useAnimatedStyle(() => ({ transform: [{ scale: breathe.value }] }));

  const handleStart = () => {
    updateSettings({ onboardingComplete: true });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProgressDots current={4} total={5} />

      <View style={styles.body}>
        {/* Big check */}
        <Animated.View style={[styles.checkOuter, breatheStyle]}>
          <View style={styles.checkInner}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </Animated.View>

        <Text style={styles.eyebrow}>You're all set</Text>
        <Text style={styles.headline}>Sleep tight.</Text>
        <Text style={styles.sub}>Set up your first trip when you're ready to board. We'll handle the rest.</Text>

        {/* Checklist */}
        <View style={styles.checklist}>
          {[
            'Location · Always',
            'Critical alerts · On',
            emergencyContact ? `Emergency contact · ${emergencyContact.name}` : 'Emergency contact · skipped',
          ].map((item, i) => (
            <View key={i} style={styles.checkRow}>
              <Text style={{ color: COLORS.calm, fontWeight: '700' }}>✓</Text>
              <Text style={styles.checkItem}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.ctas}>
        <PillButton label="Plan my first trip" onPress={handleStart} color={COLORS.calm} full size="lg" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  body: { flex: 1, padding: 24, paddingTop: 16, alignItems: 'center' },
  checkOuter: { width: 140, height: 140, borderRadius: 70, backgroundColor: `${COLORS.calm}1f`, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  checkInner: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.calm, alignItems: 'center', justifyContent: 'center' },
  checkmark: { fontSize: 44, color: COLORS.bg, fontWeight: '700' },
  eyebrow: { fontFamily: 'Courier', fontSize: 10, letterSpacing: 2, color: COLORS.calm, textTransform: 'uppercase', marginBottom: 10 },
  headline: { fontSize: 36, fontWeight: '600', letterSpacing: -1.4, color: COLORS.text, marginBottom: 14 },
  sub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 21, maxWidth: 280, marginBottom: 32 },
  checklist: { width: '100%', backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkItem: { fontSize: 13, color: COLORS.text },
  ctas: { paddingHorizontal: 24, paddingBottom: 32 },
});

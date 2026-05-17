import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { requestNotificationPermissions } from '../../services/alarmService';
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

export default function NotificationsPermission() {
  const shake = useSharedValue(0);
  React.useEffect(() => {
    shake.value = withRepeat(withTiming(1, { duration: 180 }), -1, true);
  }, []);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value * 4 - 2 }],
  }));

  const handleEnable = async () => {
    await requestNotificationPermissions();
    router.push('/(onboarding)/contact');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProgressDots current={2} total={5} />

      <View style={styles.body}>
        <Text style={styles.step}>2 of 2 permissions</Text>
        <Text style={styles.headline}>Let us interrupt{'\n'}Do Not Disturb.</Text>

        {/* Demo notification */}
        <View style={styles.notifCard}>
          <Animated.View style={[styles.notifIcon, shakeStyle]}>
            <Text style={{ fontSize: 14 }}>🔔</Text>
          </Animated.View>
          <View style={{ flex: 1 }}>
            <Text style={styles.notifAppName}>drift</Text>
            <Text style={styles.notifTime}>NOW · CRITICAL</Text>
            <Text style={styles.notifBody}><Text style={{ color: COLORS.alarm, fontWeight: '700' }}>WAKE UP</Text> — Atlantic Av, get off NOW</Text>
          </View>
          <View style={styles.dndBadge}><Text>🌙</Text></View>
        </View>

        {/* Benefits */}
        <View style={styles.benefits}>
          {[
            'Wake you even on silent or Do Not Disturb',
            'Use system audio at full volume',
            'Show on lock screen + Dynamic Island',
          ].map((txt, i) => (
            <View key={i} style={styles.benefitRow}>
              <View style={styles.checkCircle}>
                <Text style={{ color: COLORS.calm, fontWeight: '700' }}>✓</Text>
              </View>
              <Text style={styles.benefitText}>{txt}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.ctas}>
        <PillButton label="Enable Critical Alerts" onPress={handleEnable} color={COLORS.calm} full size="lg" />
        <Text style={styles.skip} onPress={() => router.push('/(onboarding)/contact')}>Not now</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  body: { flex: 1, padding: 24, paddingTop: 28 },
  step: { fontFamily: 'Courier', fontSize: 10, letterSpacing: 2, color: COLORS.textTertiary, textTransform: 'uppercase', marginBottom: 10 },
  headline: { fontSize: 32, fontWeight: '600', letterSpacing: -1.2, lineHeight: 38, color: COLORS.text, marginBottom: 24 },
  notifCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 14, marginBottom: 24, flexDirection: 'row', gap: 10, alignItems: 'flex-start', position: 'relative' },
  notifIcon: { width: 28, height: 28, borderRadius: 6, backgroundColor: COLORS.alarm, alignItems: 'center', justifyContent: 'center' },
  notifAppName: { fontSize: 11, fontWeight: '600', color: COLORS.text },
  notifTime: { fontFamily: 'Courier', fontSize: 9, color: COLORS.textTertiary, letterSpacing: 0.8 },
  notifBody: { fontSize: 12, color: COLORS.text, lineHeight: 18, marginTop: 4 },
  dndBadge: { position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  benefits: { gap: 14 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: `${COLORS.calm}22`, alignItems: 'center', justifyContent: 'center' },
  benefitText: { fontSize: 14, color: COLORS.text, flex: 1 },
  ctas: { paddingHorizontal: 24, paddingBottom: 32, gap: 12 },
  skip: { textAlign: 'center', fontSize: 12, color: COLORS.textTertiary },
});

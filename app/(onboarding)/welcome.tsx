import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, withRepeat, withTiming, Easing, useAnimatedStyle } from 'react-native-reanimated';
import { COLORS } from '../../constants/theme';
import { PillButton } from '../../components/PillButton';

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, { width: i === current ? 24 : 6, backgroundColor: i <= current ? COLORS.calm : 'rgba(255,255,255,0.12)' }]}
        />
      ))}
    </View>
  );
}

export default function Welcome() {
  const breathe = useSharedValue(1);
  React.useEffect(() => {
    breathe.value = withRepeat(withTiming(1.04, { duration: 3000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);
  const glowStyle = useAnimatedStyle(() => ({ transform: [{ scale: breathe.value }] }));

  return (
    <SafeAreaView style={styles.container}>
      <ProgressDots current={0} total={5} />

      {/* Animated orbit */}
      <View style={styles.orbitContainer}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.ring, { inset: i * 40 }]} />
        ))}
        <Animated.View style={[styles.centerDot, glowStyle]}>
          <Text style={styles.zz}>zzz</Text>
        </Animated.View>
        <View style={styles.satellite} />
      </View>

      <View style={styles.content}>
        <Text style={styles.wordmark}>drift</Text>
        <Text style={styles.headline}>Sleep on the train.{'\n'}We'll wake you.</Text>
        <Text style={styles.sub}>
          A GPS alarm for commuters, travelers, and night-shift workers.
          Pinned to your stop, not the clock.
        </Text>
      </View>

      <View style={styles.ctas}>
        <PillButton label="Get started" onPress={() => router.push('/(onboarding)/location')} color={COLORS.calm} full size="lg" />
        <Text style={styles.signin}>
          Already have an account?{' '}
          <Text style={{ color: COLORS.calm, fontWeight: '600' }}>Sign in</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 20, marginBottom: 4 },
  dot: { height: 4, borderRadius: 2 },
  orbitContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  ring: {
    position: 'absolute', borderRadius: 999,
    borderWidth: 1, borderColor: `${COLORS.calm}33`,
    top: 40, left: 40, right: 40, bottom: 40,
  },
  centerDot: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.calm,
    alignItems: 'center', justifyContent: 'center',
  },
  zz: { fontSize: 20, color: COLORS.bg, fontWeight: '700' },
  satellite: {
    position: 'absolute', top: 40, width: 10, height: 10,
    borderRadius: 5, backgroundColor: COLORS.warn,
  },
  content: { paddingHorizontal: 24, paddingBottom: 28, alignItems: 'center' },
  wordmark: { fontSize: 22, fontWeight: '700', color: COLORS.text, letterSpacing: -0.5, marginBottom: 16 },
  headline: { fontSize: 36, fontWeight: '600', color: COLORS.text, letterSpacing: -1.4, lineHeight: 40, textAlign: 'center', marginBottom: 14 },
  sub: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 16 },
  ctas: { paddingHorizontal: 24, paddingBottom: 32, gap: 14 },
  signin: { textAlign: 'center', fontSize: 12, color: COLORS.textTertiary },
});

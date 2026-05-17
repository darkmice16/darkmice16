import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue, withRepeat, withTiming, Easing, useAnimatedStyle,
  withSequence, interpolateColor
} from 'react-native-reanimated';
import { useTripStore } from '../../store/tripStore';
import { useHistoryStore } from '../../store/historyStore';
import { useSettingsStore } from '../../store/settingsStore';
import { COLORS } from '../../constants/theme';
import { CaptchaChallenge } from '../../components/CaptchaChallenge';
import { PillButton } from '../../components/PillButton';
import { triggerAlarmHaptics, stopAlarmHaptics } from '../../services/alarmService';
import { sendEmergencySms } from '../../services/smsService';
import { stopBackgroundTracking } from '../../tasks/backgroundLocation';

export default function AlarmScreen() {
  const trip = useTripStore(s => s.trip);
  const tripHydrated = useTripStore(s => s.hydrated);
  const captchaSolved = useTripStore(s => s.captchaSolved);
  const smsCountdown = useTripStore(s => s.smsCountdownSeconds);
  const solveCaptchaDot = useTripStore(s => s.solveCaptchaDot);
  const setSmsCountdown = useTripStore(s => s.setSmsCountdown);
  const setStatus = useTripStore(s => s.setStatus);
  const addRecord = useHistoryStore(s => s.addRecord);
  const settings = useSettingsStore(s => s.settings);

  const hapticRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const smsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [smsSent, setSmsSent] = useState(false);
  const smsSecondsRef = useRef(settings.smsGraceSeconds);

  const strobe = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    strobe.value = withRepeat(withTiming(1, { duration: 600, easing: Easing.linear }), -1, true);
    shake.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(6, { duration: 60 }),
        withTiming(0, { duration: 60 }),
        withTiming(0, { duration: 300 }),
      ),
      -1
    );

    hapticRef.current = triggerAlarmHaptics();

    if (trip?.smsEnabled && settings.emergencyContact) {
      smsSecondsRef.current = settings.smsGraceSeconds;
      setSmsCountdown(settings.smsGraceSeconds);
      smsTimerRef.current = setInterval(() => {
        smsSecondsRef.current -= 1;
        setSmsCountdown(smsSecondsRef.current);
        if (smsSecondsRef.current <= 0) {
          clearInterval(smsTimerRef.current!);
        }
      }, 1000);
    }

    return () => {
      if (hapticRef.current) stopAlarmHaptics(hapticRef.current);
      if (smsTimerRef.current) clearInterval(smsTimerRef.current);
    };
  }, []);

  // Send SMS when countdown hits 0
  useEffect(() => {
    if (smsCountdown === 0 && !smsSent && settings.emergencyContact && trip) {
      setSmsSent(true);
      sendEmergencySms(settings.emergencyContact, 'Your friend', trip.destination.name, null);
    }
  }, [smsCountdown]);

  // Handle solved captcha → arrived
  useEffect(() => {
    if (captchaSolved >= 3) {
      handleDismiss();
    }
  }, [captchaSolved]);

  const handleDismiss = async () => {
    if (hapticRef.current) stopAlarmHaptics(hapticRef.current);
    if (smsTimerRef.current) clearInterval(smsTimerRef.current);
    if (!trip) return;
    await stopBackgroundTracking();
    addRecord({
      id: trip.id,
      destination: trip.destination,
      startedAt: trip.startedAt,
      endedAt: Date.now(),
      minutesSlept: Math.round((Date.now() - trip.startedAt) / 60000),
      outcome: 'arrived',
      transportMode: trip.transportMode,
    });
    setStatus('arrived');
    router.replace('/trip/arrived');
  };

  const bgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(strobe.value, [0, 1], [COLORS.bg, '#1a0500']),
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  useEffect(() => {
    if (!trip && tripHydrated) router.replace('/(tabs)');
    else if (trip?.status === 'overshoot') router.replace('/trip/overshoot');
  }, [trip?.status, tripHydrated]);

  if (!trip) return null;

  return (
    <Animated.View style={[styles.container, bgStyle]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.body}>
          {/* Top indicator */}
          <View style={styles.topRow}>
            <View style={styles.alarmBadge}>
              <Text style={styles.alarmBadgeText}>ALARM</Text>
            </View>
            {smsCountdown !== null && smsCountdown > 0 && (
              <View style={styles.smsBadge}>
                <Text style={styles.smsBadgeText}>SMS in {smsCountdown}s</Text>
              </View>
            )}
            {smsSent && (
              <View style={[styles.smsBadge, { borderColor: COLORS.success }]}>
                <Text style={[styles.smsBadgeText, { color: COLORS.success }]}>SMS sent ✓</Text>
              </View>
            )}
          </View>

          {/* Wake up hero */}
          <Animated.View style={[styles.hero, shakeStyle]}>
            <Text style={styles.heroEmoji}>⏰</Text>
            <Text style={styles.heroText}>WAKE UP</Text>
            <Text style={styles.heroSub}>{trip.destination.name}</Text>
          </Animated.View>

          {/* Captcha */}
          <View style={styles.captchaWrap}>
            <Text style={styles.captchaLabel}>Tap 1 · 2 · 3 to confirm you're awake</Text>
            <CaptchaChallenge solved={captchaSolved} onTap={solveCaptchaDot} />
          </View>

          {/* Progress */}
          {captchaSolved > 0 && (
            <Text style={styles.captchaProgress}>{captchaSolved} / 3 confirmed</Text>
          )}
        </View>

        <View style={styles.footer}>
          <PillButton
            label="I'm awake — skip captcha"
            onPress={handleDismiss}
            color="rgba(255,59,48,0.2)"
            dark
            size="md"
          />
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 24, paddingTop: 16 },
  topRow: { flexDirection: 'row', gap: 8, alignSelf: 'stretch', justifyContent: 'center' },
  alarmBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6, borderWidth: 1.5, borderColor: COLORS.alarm },
  alarmBadgeText: { fontFamily: 'Courier', fontSize: 10, letterSpacing: 2, color: COLORS.alarm, fontWeight: '700' },
  smsBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: COLORS.warn },
  smsBadgeText: { fontFamily: 'Courier', fontSize: 10, letterSpacing: 1, color: COLORS.warn },
  hero: { alignItems: 'center' },
  heroEmoji: { fontSize: 72, marginBottom: 12 },
  heroText: { fontSize: 52, fontWeight: '900', letterSpacing: 4, color: COLORS.alarm, marginBottom: 8 },
  heroSub: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center' },
  captchaWrap: { alignItems: 'center', gap: 16 },
  captchaLabel: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  captchaProgress: { fontSize: 12, color: COLORS.warn, fontFamily: 'Courier' },
  footer: { padding: 24, paddingBottom: 32, alignItems: 'center' },
});

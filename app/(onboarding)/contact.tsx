import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
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

export default function EmergencyContact() {
  const updateSettings = useSettingsStore(s => s.updateSettings);
  const [name, setName] = useState('Maya Chen');
  const [phone, setPhone] = useState('+1 (917) 555-4421');

  const handleSave = () => {
    if (name && phone) {
      updateSettings({ emergencyContact: { name, phone } });
    }
    router.push('/(onboarding)/ready');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProgressDots current={3} total={5} />

      <View style={styles.body}>
        <Text style={styles.step}>Safety net · optional</Text>
        <Text style={styles.headline}>Who should we{'\n'}text if you{'\n'}sleep through?</Text>
        <Text style={styles.sub}>
          Pick one person. We'll only text them if you don't wake up within 90 seconds of the alarm.
        </Text>

        {/* Contact card */}
        <View style={styles.contactCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name ? name[0] : '?'}</Text>
          </View>
          <View style={{ flex: 1, gap: 8 }}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Contact name"
              placeholderTextColor={COLORS.textTertiary}
              style={styles.input}
            />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              placeholderTextColor={COLORS.textTertiary}
              keyboardType="phone-pad"
              style={[styles.input, { fontFamily: 'Courier', fontSize: 12 }]}
            />
          </View>
        </View>

        {/* SMS preview */}
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>They will receive</Text>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>
              Hi — this is Drift on your friend's phone. They didn't wake up at their stop. They're currently at [location]. Reply STOP to opt out.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.ctas}>
        <PillButton label="Looks good" onPress={handleSave} color={COLORS.calm} full size="lg" />
        <Text style={styles.skip} onPress={() => router.push('/(onboarding)/ready')}>
          Skip — I'll ride solo
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  body: { flex: 1, padding: 24, paddingTop: 28 },
  step: { fontFamily: 'Courier', fontSize: 10, letterSpacing: 2, color: COLORS.textTertiary, textTransform: 'uppercase', marginBottom: 10 },
  headline: { fontSize: 32, fontWeight: '600', letterSpacing: -1.2, lineHeight: 38, color: COLORS.text, marginBottom: 12 },
  sub: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 21, marginBottom: 24 },
  contactCard: { backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.calm, borderRadius: 18, padding: 16, marginBottom: 14, flexDirection: 'row', gap: 14, alignItems: 'center' },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '600', color: '#fff' },
  input: { color: COLORS.text, fontSize: 15, fontWeight: '500', borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 4 },
  preview: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 14 },
  previewLabel: { fontFamily: 'Courier', fontSize: 9, letterSpacing: 1.4, color: COLORS.textTertiary, textTransform: 'uppercase', marginBottom: 8 },
  bubble: { backgroundColor: `${COLORS.calm}14`, padding: 10, borderRadius: 12, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 12, color: COLORS.text, lineHeight: 18 },
  ctas: { paddingHorizontal: 24, paddingBottom: 32, gap: 12 },
  skip: { textAlign: 'center', fontSize: 12, color: COLORS.textTertiary },
});

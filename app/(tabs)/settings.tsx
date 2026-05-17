import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, SafeAreaView, Alert, TextInput, Modal } from 'react-native';
import { useSettingsStore } from '../../store/settingsStore';
import { useHistoryStore } from '../../store/historyStore';
import { COLORS } from '../../constants/theme';
import { PillButton } from '../../components/PillButton';

export default function Settings() {
  const settings = useSettingsStore(s => s.settings);
  const updateSettings = useSettingsStore(s => s.updateSettings);
  const clearAll = useHistoryStore(s => s.clearAll);
  const recordCount = useHistoryStore(s => s.records.length);

  const [contactOpen, setContactOpen] = useState(false);
  const [contactName, setContactName] = useState(settings.emergencyContact?.name ?? '');
  const [contactPhone, setContactPhone] = useState(settings.emergencyContact?.phone ?? '');

  const openContactEdit = () => {
    setContactName(settings.emergencyContact?.name ?? '');
    setContactPhone(settings.emergencyContact?.phone ?? '');
    setContactOpen(true);
  };

  const saveContact = () => {
    if (contactName.trim() && contactPhone.trim()) {
      updateSettings({ emergencyContact: { name: contactName.trim(), phone: contactPhone.trim() } });
    }
    setContactOpen(false);
  };

  const removeContact = () => {
    updateSettings({ emergencyContact: null });
    setContactOpen(false);
  };

  const confirmClearHistory = () => {
    if (recordCount === 0) return;
    Alert.alert(
      'Clear trip history?',
      `Delete ${recordCount} saved trip${recordCount === 1 ? '' : 's'}? This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => clearAll() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Preferences</Text>
          <Text style={styles.title}>Settings</Text>
        </View>

        <Section label="Wake-up">
          <SliderRow
            label="Wake me up"
            sub={`${settings.defaultWakeOffsetMinutes} min before my stop`}
            value={settings.defaultWakeOffsetMinutes}
            min={2}
            max={15}
            onChange={v => updateSettings({ defaultWakeOffsetMinutes: v })}
          />
          <ToggleRow
            label="Escalating alarm"
            sub="Teal → amber → red over 3 minutes"
            value={true}
            onChange={() => {}}
          />
          <ToggleRow
            label="Haptic feedback"
            sub="Vibration with the alarm"
            value={settings.hapticEnabled}
            onChange={v => updateSettings({ hapticEnabled: v })}
          />
        </Section>

        <Section label="Emergency contact">
          {settings.emergencyContact ? (
            <>
              <InfoRow
                label={settings.emergencyContact.name}
                sub={settings.emergencyContact.phone}
                action="Change"
                onPress={openContactEdit}
              />
              <ToggleRow
                label="Send SMS if I don't wake"
                sub={`After ${settings.smsGraceSeconds}s of unacknowledged alarm`}
                value={settings.smsEnabled}
                onChange={v => updateSettings({ smsEnabled: v })}
              />
            </>
          ) : (
            <InfoRow
              label="No contact set"
              sub="Tap to add an emergency contact"
              action="Add"
              onPress={openContactEdit}
            />
          )}
        </Section>

        <Section label="Battery & background">
          <InfoRow label="Location" sub="Always — required for background tracking" action={null} onPress={() => {}} />
          <InfoRow label="Background app refresh" sub="Required to detect your stop" action="Check" onPress={() => {}} />
          <ToggleRow
            label="Power saver mode"
            sub="Slightly less accurate, uses less battery"
            value={false}
            onChange={() => {}}
          />
        </Section>

        <Section label="Accessibility">
          <ToggleRow
            label="Increase alarm contrast"
            sub="Higher contrast colors during alarm"
            value={false}
            onChange={() => {}}
          />
          <ToggleRow
            label="Larger wake-up text"
            sub="Bigger text on alarm screen"
            value={false}
            onChange={() => {}}
          />
        </Section>

        <Section label="Privacy">
          <InfoRow label="Location data" sub="Stored locally, never uploaded" action={null} onPress={() => {}} />
          <InfoRow
            label="Clear trip history"
            sub={recordCount > 0 ? `${recordCount} saved trip${recordCount === 1 ? '' : 's'}` : 'No trips to clear'}
            action={recordCount > 0 ? 'Clear' : null}
            onPress={confirmClearHistory}
          />
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Drift v1.0.0</Text>
          <Text style={styles.footerSub}>Your stop. Your sleep. Our job.</Text>
        </View>
      </ScrollView>

      <Modal visible={contactOpen} transparent animationType="fade" onRequestClose={() => setContactOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Emergency contact</Text>
            <Text style={styles.modalSub}>We'll text them if you sleep through the alarm.</Text>
            <TextInput
              value={contactName}
              onChangeText={setContactName}
              placeholder="Name"
              placeholderTextColor={COLORS.textTertiary}
              style={styles.modalInput}
            />
            <TextInput
              value={contactPhone}
              onChangeText={setContactPhone}
              placeholder="Phone"
              placeholderTextColor={COLORS.textTertiary}
              keyboardType="phone-pad"
              style={[styles.modalInput, { fontFamily: 'Courier' }]}
            />
            <View style={styles.modalBtns}>
              <PillButton label="Cancel" onPress={() => setContactOpen(false)} color="rgba(255,255,255,0.08)" dark size="md" />
              <PillButton label="Save" onPress={saveContact} color={COLORS.calm} size="md" />
            </View>
            {settings.emergencyContact && (
              <TouchableOpacity onPress={removeContact} style={styles.removeBtn}>
                <Text style={styles.removeText}>Remove contact</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function ToggleRow({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: COLORS.border, true: `${COLORS.calm}88` }}
        thumbColor={value ? COLORS.calm : COLORS.textTertiary}
      />
    </View>
  );
}

function InfoRow({ label, sub, action, onPress }: { label: string; sub: string; action: string | null; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={action ? 0.7 : 1}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      {action && <Text style={styles.rowAction}>{action}</Text>}
    </TouchableOpacity>
  );
}

function SliderRow({ label, sub, value, min, max, onChange }: {
  label: string; sub: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <View style={styles.sliderRow}>
      <View style={styles.sliderHeader}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{value}m</Text>
      </View>
      <Text style={styles.rowSub}>{sub}</Text>
      <View style={styles.sliderTrack}>
        {Array.from({ length: max - min + 1 }).map((_, i) => {
          const v = min + i;
          const active = v <= value;
          return (
            <TouchableOpacity key={v} onPress={() => onChange(v)} style={[styles.sliderDot, active && styles.sliderDotActive]} />
          );
        })}
      </View>
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabelText}>{min}m</Text>
        <Text style={styles.sliderLabelText}>{max}m</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 48 },
  header: { padding: 24, paddingTop: 12 },
  eyebrow: { fontFamily: 'Courier', fontSize: 10, letterSpacing: 2, color: COLORS.textTertiary, textTransform: 'uppercase', marginBottom: 6 },
  title: { fontSize: 28, fontWeight: '600', letterSpacing: -1, color: COLORS.text },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionLabel: { fontFamily: 'Courier', fontSize: 9, letterSpacing: 1.4, color: COLORS.textTertiary, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 },
  sectionCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowLabel: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  rowSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  rowAction: { fontSize: 12, color: COLORS.calm, fontWeight: '500' },
  sliderRow: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sliderValue: { fontSize: 14, fontWeight: '600', color: COLORS.calm },
  sliderTrack: { flexDirection: 'row', gap: 4, marginTop: 12, alignItems: 'center' },
  sliderDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: COLORS.border },
  sliderDotActive: { backgroundColor: COLORS.calm },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  sliderLabelText: { fontSize: 9, color: COLORS.textTertiary, fontFamily: 'Courier' },
  footer: { alignItems: 'center', paddingTop: 8 },
  footerText: { fontSize: 12, color: COLORS.textTertiary },
  footerSub: { fontSize: 10, color: `${COLORS.textTertiary}88`, marginTop: 4, fontStyle: 'italic' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, padding: 20, gap: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, letterSpacing: -0.4 },
  modalSub: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  modalInput: { color: COLORS.text, fontSize: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: 8 },
  modalBtns: { flexDirection: 'row', gap: 8, marginTop: 8, justifyContent: 'flex-end' },
  removeBtn: { alignItems: 'center', paddingVertical: 8 },
  removeText: { fontSize: 12, color: COLORS.alarm },
});

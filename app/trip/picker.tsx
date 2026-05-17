import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useTripStore } from '../../store/tripStore';
import { COLORS } from '../../constants/theme';
import { Stop } from '../../types';

const ALL_STOPS: Stop[] = [
  { id: 's1', name: 'Atlantic Av — Barclays Ctr', lat: 40.6843, lng: -73.9774, line: 'B/Q/2/3/4/5', distanceKm: 3.2 },
  { id: 's2', name: '96 St — Cornell Medical', lat: 40.7838, lng: -73.9534, line: '4/5/6', distanceKm: 5.8 },
  { id: 's3', name: 'Forest Hills — 71 Av', lat: 40.7189, lng: -73.8447, line: 'E/F/M/R', distanceKm: 9.1 },
  { id: 's4', name: 'Times Sq — 42 St', lat: 40.7558, lng: -73.9871, line: '1/2/3/7/N/Q/R/W', distanceKm: 1.4 },
  { id: 's5', name: 'Grand Central — 42 St', lat: 40.7527, lng: -73.9772, line: '4/5/6/7/S', distanceKm: 1.9 },
  { id: 's6', name: 'Union Sq — 14 St', lat: 40.7356, lng: -73.9906, line: '4/5/6/L/N/Q/R/W', distanceKm: 2.3 },
  { id: 's7', name: 'Fulton St', lat: 40.7098, lng: -74.0075, line: '2/3/4/5/A/C/J/Z', distanceKm: 4.7 },
  { id: 's8', name: 'Chambers St', lat: 40.7148, lng: -74.0087, line: '1/2/3/A/C', distanceKm: 4.3 },
  { id: 's9', name: '72 St — Central Park West', lat: 40.7753, lng: -73.9814, line: 'B/C', distanceKm: 4.1 },
  { id: 's10', name: 'Coney Island — Stillwell Av', lat: 40.5776, lng: -73.9815, line: 'B/D/F/N/Q', distanceKm: 12.4 },
  { id: 's11', name: 'Jamaica — 179 St', lat: 40.7122, lng: -73.7839, line: 'F', distanceKm: 14.2 },
  { id: 's12', name: 'Flushing — Main St', lat: 40.7596, lng: -73.8301, line: '7', distanceKm: 11.8 },
];

export default function StopPicker() {
  const setPickedStop = useTripStore(s => s.setPickedStop);
  const [query, setQuery] = useState('');

  const filtered = ALL_STOPS.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.line.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (stop: Stop) => {
    setPickedStop(stop);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Choose stop</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search stops, lines…"
          placeholderTextColor={COLORS.textTertiary}
          style={styles.searchInput}
          autoFocus
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {query.length === 0 && (
        <View style={styles.nearbyHeader}>
          <Text style={styles.nearbyLabel}>Nearby stops</Text>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.stopRow} onPress={() => handleSelect(item)} activeOpacity={0.7}>
            <View style={styles.stopIcon}>
              <Text style={{ fontSize: 18 }}>📍</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stopName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.stopLine}>{item.line}</Text>
            </View>
            <Text style={styles.stopDist}>{item.distanceKm.toFixed(1)} km</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔇</Text>
            <Text style={styles.emptyText}>No stops match "{query}"</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  cancelBtn: { padding: 4 },
  cancelText: { fontSize: 14, color: COLORS.calm },
  navTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, marginHorizontal: 16, paddingHorizontal: 12, height: 48, gap: 8, marginBottom: 12 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text },
  clearBtn: { fontSize: 14, color: COLORS.textTertiary, padding: 4 },
  nearbyHeader: { paddingHorizontal: 20, marginBottom: 8 },
  nearbyLabel: { fontFamily: 'Courier', fontSize: 9, letterSpacing: 1.4, color: COLORS.textTertiary, textTransform: 'uppercase' },
  stopRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  stopIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center' },
  stopName: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  stopLine: { fontSize: 10, color: COLORS.textSecondary, fontFamily: 'Courier', marginTop: 2 },
  stopDist: { fontSize: 11, color: COLORS.textTertiary, fontFamily: 'Courier' },
  separator: { height: 1, backgroundColor: COLORS.border, marginLeft: 68 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 36, marginBottom: 12 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },
});

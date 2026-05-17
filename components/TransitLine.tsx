import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { COLORS } from '../constants/theme';
import type { Stop } from '../types';

interface Props {
  stops: Stop[];
  currentIdx: number; // float
  targetIdx: number;
  state?: 'calm' | 'warn' | 'alarm' | 'past';
  height?: number;
}

export function TransitLine({ stops, currentIdx, targetIdx, state = 'calm', height = 300 }: Props) {
  const accent = state === 'alarm' || state === 'past' ? COLORS.alarm
    : state === 'warn' ? COLORS.warn
    : COLORS.calm;

  const pulseScale = useSharedValue(1);
  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.08, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const PAD_V = 28;
  const INNER_H = height - PAD_V * 2;
  const n = stops.length;
  const yOf = (i: number) => PAD_V + (INNER_H * i) / (n - 1);
  const progressY = yOf(Math.min(currentIdx, n - 1));
  const X_LINE = 28;

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={{ height, position: 'relative' }}>
      {/* Track line */}
      <View style={[styles.trackLine, { left: X_LINE - 1.5, top: PAD_V, height: INNER_H }]} />
      {/* Progress line */}
      <View
        style={[
          styles.progressLine,
          {
            left: X_LINE - 1.5,
            top: PAD_V,
            height: Math.max(0, progressY - PAD_V),
            backgroundColor: accent,
          },
        ]}
      />

      {/* Stops */}
      {stops.map((stop, i) => {
        const isPast = i < currentIdx;
        const isTarget = i === targetIdx;
        const dotSize = isTarget ? 14 : 8;
        const y = yOf(i);
        const dotColor = isPast ? accent : isTarget ? COLORS.bg : 'rgba(255,255,255,0.35)';

        return (
          <React.Fragment key={stop.id}>
            <View
              style={{
                position: 'absolute',
                left: X_LINE - dotSize / 2,
                top: y - dotSize / 2,
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: dotColor,
                borderWidth: isTarget ? 3 : 0,
                borderColor: accent,
                zIndex: 2,
              }}
            />
            <Text
              style={[
                styles.stopName,
                {
                  position: 'absolute',
                  left: X_LINE + 22,
                  top: y - 11,
                  color: isPast ? COLORS.textSecondary : COLORS.text,
                  fontSize: isTarget ? 15 : 14,
                  fontWeight: isTarget ? '600' : '500',
                  opacity: isPast ? 0.5 : 1,
                  textDecorationLine: isPast ? 'line-through' : 'none',
                },
              ]}
            >
              {stop.name}
              {isTarget ? (
                <Text style={[styles.wakeTag, { color: accent }]}> WAKE</Text>
              ) : null}
            </Text>
            {stop.sub ? (
              <Text
                style={{
                  position: 'absolute',
                  left: X_LINE + 22,
                  top: y + 6,
                  fontSize: 10,
                  color: COLORS.textTertiary,
                  letterSpacing: 0.5,
                  fontFamily: 'Courier',
                }}
              >
                {stop.sub}
              </Text>
            ) : null}
          </React.Fragment>
        );
      })}

      {/* Live position marker */}
      {currentIdx >= 0 && currentIdx <= n - 1 && (
        <Animated.View
          style={[
            styles.posMarker,
            pulseStyle,
            {
              left: X_LINE - 12,
              top: progressY - 12,
              backgroundColor: accent,
            },
          ]}
        >
          <View style={[styles.posMarkerInner, { backgroundColor: COLORS.bg }]} />
          <View style={[styles.posMarkerDot, { backgroundColor: accent }]} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  trackLine: {
    position: 'absolute',
    width: 3,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 2,
  },
  progressLine: {
    position: 'absolute',
    width: 3,
    borderRadius: 2,
  },
  stopName: {
    letterSpacing: -0.2,
  },
  wakeTag: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  posMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    zIndex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posMarkerInner: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  posMarkerDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

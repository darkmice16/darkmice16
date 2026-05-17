import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

interface Props {
  solved: number; // 0, 1, 2, or 3
  onTap: (n: number) => void;
}

export function CaptchaChallenge({ solved, onTap }: Props) {
  const glowScale = useSharedValue(1);
  React.useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 600 }),
        withTiming(1, { duration: 600 }),
      ),
      -1,
    );
  }, []);

  const activeGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.instruction}>TAP DOTS IN ORDER TO DISMISS</Text>
        <Text style={styles.progress}>{solved} / 3</Text>
      </View>
      <View style={styles.dots}>
        {[1, 2, 3].map((n) => {
          const isDone = n <= solved;
          const isActive = n === solved + 1;
          return isDone ? (
            <View key={n} style={[styles.dot, styles.dotDone]}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          ) : isActive ? (
            <Animated.View key={n} style={[styles.dot, styles.dotActive, activeGlowStyle]}>
              <TouchableOpacity onPress={() => onTap(n)} style={styles.dotTouchable}>
                <Text style={[styles.dotNumber, { color: COLORS.alarm }]}>{n}</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <TouchableOpacity key={n} onPress={() => onTap(n)} style={[styles.dot, styles.dotDim]}>
              <Text style={[styles.dotNumber, { color: 'rgba(255,255,255,0.4)' }]}>{n}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  instruction: {
    fontFamily: 'Courier',
    fontSize: 10,
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.7)',
  },
  progress: {
    fontFamily: 'Courier',
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dot: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    backgroundColor: COLORS.success,
  },
  dotActive: {
    backgroundColor: '#fff',
  },
  dotDim: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    borderStyle: 'dashed',
  },
  dotTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotNumber: {
    fontSize: 28,
    fontWeight: '700',
  },
  checkmark: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '700',
  },
});

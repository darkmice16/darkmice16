import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  color?: string;
  dark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  full?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function PillButton({ label, onPress, color = COLORS.calm, dark = false, size = 'md', full = false, disabled, style }: Props) {
  const height = size === 'sm' ? 38 : size === 'lg' ? 56 : 48;
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 17 : 15;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: dark ? 'rgba(255,255,255,0.08)' : color,
          width: full ? '100%' : undefined,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { fontSize, color: dark ? color : COLORS.bg }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});

export const COLORS = {
  // Surfaces
  bg: '#080B14',
  surface: '#0F1524',
  surface2: '#1A2238',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.14)',

  // Text
  text: '#F5F6FA',
  textSecondary: 'rgba(245,246,250,0.62)',
  textTertiary: 'rgba(245,246,250,0.36)',

  // State accents
  calm: '#5EEAD4',
  calmDim: '#0D9488',
  warn: '#FBBF24',
  warnDim: '#92580C',
  alarm: '#FF3B30',
  alarmDim: '#7A1010',
  success: '#22C55E',
} as const;

export const FONTS = {
  display: 'System',
  mono: 'Courier',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

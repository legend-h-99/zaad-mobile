/**
 * زاد — Design Tokens
 * RTL-first Arabic therapeutic nutrition app
 * Brand: medical-green primary, warm-amber accent
 */

export const Colors = {
  // Primary — deep botanical green with Alma's bright nutrition accent.
  primary: '#385C2E',
  primaryLight: '#F1F6ED',
  primaryBorder: '#D9E6D2',
  primaryDark: '#294523',
  lime: '#B8EE31',
  limeSoft: '#EFF8D2',
  burgundy: '#351A18',

  // Accent — warm food cue, restrained so it complements the medical palette
  amber: '#EDB92E',
  amberLight: '#FFF8D9',
  amberBorder: '#F1DEA0',
  coral: '#F27D58',
  sky: '#5E9898',
  skyLight: '#ECF7F6',
  mint: '#E8F1E1',

  // Status colors — always paired with icon/text, never sole indicator
  safe: {
    bg: '#EEF7F3',
    border: '#CFE5DC',
    text: '#167A58',
  },
  watch: {
    bg: '#FFF6EC',
    border: '#F3D7B7',
    text: '#B96720',
  },
  risk: {
    bg: '#FFF1F0',
    border: '#F6C8C2',
    text: '#C94033',
  },

  // Neutral surface palette
  background: '#F8F5EE',
  surface: '#FFFDFC',
  surfaceAlt: '#F7F5EF',
  border: '#E7E1D8',
  borderLight: '#EFEAE2',

  // Text hierarchy
  textPrimary: '#351A18',
  textSecondary: '#50443E',
  textMuted: '#7D756F',
  textSubtle: '#A6A09A',
  textDisabled: '#CEC9C2',

  // Macro chip colors
  calorie: { bg: '#F2F1ED', border: '#E3E0D9', text: '#351A18' },
  protein: { bg: '#FFF0EA', border: '#F6C6B7', text: '#D75E3C' },
  carbs:   { bg: '#F1F8D4', border: '#DDEB9B', text: '#718A13' },
  fat:     { bg: '#FFF7D5', border: '#F1D989', text: '#A97C00' },
  sodium:  { bg: '#fef2f2', border: '#FECACA', text: '#991B1B' },
} as const

export const Typography = {
  // IBM Plex Arabic is the primary font — loaded via expo-font
  fontFamily: {
    regular: 'IBMPlexArabic-Regular',
    medium: 'IBMPlexArabic-Medium',
    semiBold: 'IBMPlexArabic-SemiBold',
    bold: 'IBMPlexArabic-Bold',
    light: 'IBMPlexArabic-Light',
  },

  // Scale — WCAG AA minimum touch targets + readable Arabic at all sizes
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },

  // Line heights calibrated for Arabic naskh letterforms
  lineHeight: {
    tight: 1.25,
    normal: 1.6,
    relaxed: 1.75,
  },
} as const

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const

export const Radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  full: 9999,
} as const

export const Shadow = {
  // iOS
  ios: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
    },
  },
  // Android
  android: {
    sm: { elevation: 2 },
    md: { elevation: 4 },
    lg: { elevation: 8 },
  },
} as const

// WCAG AA minimum touch target — 44pt
export const MIN_TOUCH_TARGET = 44

export type SafetyScore = 'suitable' | 'suitable_with_notes' | 'avoid'

export const SAFETY_COLORS: Record<SafetyScore, { bg: string; border: string; text: string }> = {
  suitable:            Colors.safe,
  suitable_with_notes: Colors.watch,
  avoid:               Colors.risk,
}

export const SAFETY_LABELS: Record<SafetyScore, string> = {
  suitable:            'مناسبة',
  suitable_with_notes: 'مناسبة مع ملاحظة',
  avoid:               'تجنب',
}

import { Platform } from 'react-native'

/**
 * زاد — Design Tokens
 * RTL-first Arabic therapeutic nutrition app
 * Brand: medical-green primary, warm-amber accent
 */

export const LightThemeVars = {
  primary: '#385C2E',
  primaryLight: '#F1F6ED',
  primaryBorder: '#D9E6D2',
  primaryDark: '#294523',
  lime: '#B8EE31',
  limeSoft: '#EFF8D2',
  burgundy: '#351A18',
  amber: '#EDB92E',
  amberLight: '#FFF8D9',
  amberBorder: '#F1DEA0',
  coral: '#F27D58',
  sky: '#5E9898',
  skyLight: '#ECF7F6',
  mint: '#E8F1E1',
  safeBg: '#EEF7F3',
  safeBorder: '#CFE5DC',
  safeText: '#167A58',
  watchBg: '#FFF6EC',
  watchBorder: '#F3D7B7',
  watchText: '#B96720',
  riskBg: '#FFF1F0',
  riskBorder: '#F6C8C2',
  riskText: '#C94033',
  background: '#F8F5EE',
  surface: '#FFFDFC',
  surfaceAlt: '#F7F5EF',
  border: '#E7E1D8',
  borderLight: '#EFEAE2',
  textPrimary: '#351A18',
  textSecondary: '#50443E',
  textMuted: '#7D756F',
  textSubtle: '#A6A09A',
  textDisabled: '#CEC9C2',
  calorieBg: '#F2F1ED',
  calorieBorder: '#E3E0D9',
  calorieText: '#351A18',
  proteinBg: '#FFF0EA',
  proteinBorder: '#F6C6B7',
  proteinText: '#D75E3C',
  carbsBg: '#F1F8D4',
  carbsBorder: '#DDEB9B',
  carbsText: '#718A13',
  fatBg: '#FFF7D5',
  fatBorder: '#F1D989',
  fatText: '#A97C00',
  sodiumBg: '#fef2f2',
  sodiumBorder: '#FECACA',
  sodiumText: '#991B1B',
} as const

export const DarkThemeVars: Record<keyof typeof LightThemeVars, string> = {
  primary: '#8BCF7D',
  primaryLight: '#17301E',
  primaryBorder: '#315039',
  primaryDark: '#B7E7AC',
  lime: '#B8EE31',
  limeSoft: '#223318',
  burgundy: '#F4E6DE',
  amber: '#F1C860',
  amberLight: '#372E18',
  amberBorder: '#665528',
  coral: '#FF9A78',
  sky: '#8BCACA',
  skyLight: '#173233',
  mint: '#203529',
  safeBg: '#102A22',
  safeBorder: '#245947',
  safeText: '#6FDCB2',
  watchBg: '#332616',
  watchBorder: '#67461E',
  watchText: '#F1B66F',
  riskBg: '#351817',
  riskBorder: '#74332E',
  riskText: '#FF8D82',
  background: '#101411',
  surface: '#171D18',
  surfaceAlt: '#20271F',
  border: '#30392F',
  borderLight: '#293229',
  textPrimary: '#F5EFE8',
  textSecondary: '#D6CEC5',
  textMuted: '#B3A99F',
  textSubtle: '#8C8278',
  textDisabled: '#675F57',
  calorieBg: '#262720',
  calorieBorder: '#3A3B31',
  calorieText: '#F5EFE8',
  proteinBg: '#39211C',
  proteinBorder: '#6D3C31',
  proteinText: '#FF9A78',
  carbsBg: '#253318',
  carbsBorder: '#4A6124',
  carbsText: '#C8E772',
  fatBg: '#372D14',
  fatBorder: '#66511B',
  fatText: '#F4CB57',
  sodiumBg: '#351817',
  sodiumBorder: '#74332E',
  sodiumText: '#FF8D82',
}

export type ThemeMode = 'light' | 'dark'
export type ThemeToken = keyof typeof LightThemeVars

export function themeToken(name: ThemeToken) {
  const fallback = LightThemeVars[name]
  return Platform.OS === 'web' ? `var(--zaad-${name}, ${fallback})` : fallback
}

export const Colors = {
  // Primary — deep botanical green with Alma's bright nutrition accent.
  primary: themeToken('primary'),
  primaryLight: themeToken('primaryLight'),
  primaryBorder: themeToken('primaryBorder'),
  primaryDark: themeToken('primaryDark'),
  lime: themeToken('lime'),
  limeSoft: themeToken('limeSoft'),
  burgundy: themeToken('burgundy'),

  // Accent — warm food cue, restrained so it complements the medical palette
  amber: themeToken('amber'),
  amberLight: themeToken('amberLight'),
  amberBorder: themeToken('amberBorder'),
  coral: themeToken('coral'),
  sky: themeToken('sky'),
  skyLight: themeToken('skyLight'),
  mint: themeToken('mint'),

  // Status colors — always paired with icon/text, never sole indicator
  safe: {
    bg: themeToken('safeBg'),
    border: themeToken('safeBorder'),
    text: themeToken('safeText'),
  },
  watch: {
    bg: themeToken('watchBg'),
    border: themeToken('watchBorder'),
    text: themeToken('watchText'),
  },
  risk: {
    bg: themeToken('riskBg'),
    border: themeToken('riskBorder'),
    text: themeToken('riskText'),
  },

  // Neutral surface palette
  background: themeToken('background'),
  surface: themeToken('surface'),
  surfaceAlt: themeToken('surfaceAlt'),
  border: themeToken('border'),
  borderLight: themeToken('borderLight'),

  // Text hierarchy
  textPrimary: themeToken('textPrimary'),
  textSecondary: themeToken('textSecondary'),
  textMuted: themeToken('textMuted'),
  textSubtle: themeToken('textSubtle'),
  textDisabled: themeToken('textDisabled'),

  // Macro chip colors
  calorie: { bg: themeToken('calorieBg'), border: themeToken('calorieBorder'), text: themeToken('calorieText') },
  protein: { bg: themeToken('proteinBg'), border: themeToken('proteinBorder'), text: themeToken('proteinText') },
  carbs:   { bg: themeToken('carbsBg'), border: themeToken('carbsBorder'), text: themeToken('carbsText') },
  fat:     { bg: themeToken('fatBg'), border: themeToken('fatBorder'), text: themeToken('fatText') },
  sodium:  { bg: themeToken('sodiumBg'), border: themeToken('sodiumBorder'), text: themeToken('sodiumText') },
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

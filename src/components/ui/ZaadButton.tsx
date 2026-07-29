/**
 * زاد — Primary button component
 * RTL-aware, WCAG AA touch target (≥44pt), haptic feedback
 */
import React from 'react'
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
  View,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { Colors, Typography, Radius, MIN_TOUCH_TARGET } from '../../constants/theme'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

interface ZaadButtonProps {
  labelAr: string
  onPress: () => void
  variant?: Variant
  size?: Size
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
  iconPosition?: 'start' | 'end'  // In RTL, 'start' = right side
}

export function ZaadButton({
  labelAr,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = true,
  icon,
  iconPosition = 'start',
}: ZaadButtonProps) {
  const isDisabled = disabled || loading

  async function handlePress() {
    if (isDisabled) return
    // Light haptic feedback for medical app — feels precise, not playful
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  const containerStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
  ]

  const textStyle = [
    styles.label,
    styles[`label_${variant}`],
    styles[`labelSize_${size}`],
  ]

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={containerStyle}
      accessibilityRole="button"
      accessibilityLabel={labelAr}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#fff' : Colors.primary}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'start' && (
            <View style={styles.iconStart}>{icon}</View>
          )}
          <Text style={textStyle}>{labelAr}</Text>
          {icon && iconPosition === 'end' && (
            <View style={styles.iconEnd}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: MIN_TOUCH_TARGET,
    flexDirection: 'row',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row-reverse', // RTL: icon on the right = "start" in Arabic
    alignItems: 'center',
    gap: 8,
  },
  iconStart: { marginStart: 4 },
  iconEnd:   { marginEnd: 4 },

  // Variants
  primary: {
    backgroundColor: Colors.primary,
    ...Platform.select({
      ios:     { shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  secondary: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  ghost: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  danger: {
    backgroundColor: Colors.risk.bg,
    borderWidth: 1,
    borderColor: Colors.risk.border,
  },

  // Sizes
  size_sm: { paddingHorizontal: 12, minHeight: MIN_TOUCH_TARGET },
  size_md: { paddingHorizontal: 20, minHeight: 50 },
  size_lg: { paddingHorizontal: 28, minHeight: 56 },

  // States
  disabled: { opacity: 0.5 },

  // Labels
  label: {
    fontFamily: Typography.fontFamily.semiBold,
    textAlign: 'center',
  },
  label_primary:   { color: '#fff' },
  label_secondary: { color: Colors.primary },
  label_ghost:     { color: Colors.textSecondary },
  label_danger:    { color: Colors.risk.text },

  labelSize_sm: { fontSize: Typography.size.sm },
  labelSize_md: { fontSize: Typography.size.base },
  labelSize_lg: { fontSize: Typography.size.lg },
})

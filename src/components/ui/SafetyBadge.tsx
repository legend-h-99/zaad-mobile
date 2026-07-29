/**
 * زاد — Safety score badge
 * Color is NEVER the sole indicator — always paired with Arabic text label.
 * WCAG AA compliant.
 */
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SAFETY_COLORS, SAFETY_LABELS, Typography, Radius } from '../../constants/theme'
import type { SafetyScore } from '../../constants/theme'

interface SafetyBadgeProps {
  score: SafetyScore
}

// Icon symbols — no emoji dependency, text-safe
const SAFETY_ICONS: Record<SafetyScore, string> = {
  suitable:            '✓',
  suitable_with_notes: '!',
  avoid:               '✗',
}

export function SafetyBadge({ score }: SafetyBadgeProps) {
  const colors = SAFETY_COLORS[score]
  const label  = SAFETY_LABELS[score]
  const icon   = SAFETY_ICONS[score]

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
      ]}
      accessibilityLabel={label}
    >
      <Text style={[styles.icon, { color: colors.text }]}>{icon}</Text>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row-reverse', // RTL: icon on the right
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    minHeight: 32,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  icon: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
  },
  label: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: Typography.size.sm * 1.35,
  },
})

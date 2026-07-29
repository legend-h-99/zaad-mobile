/**
 * زاد — Surface card component
 * Used for meal cards, lab indicator cards, progress cards.
 * All content inside is RTL by default.
 */
import React from 'react'
import { View, StyleSheet, Platform, ViewStyle } from 'react-native'
import { Colors, Radius, Spacing, Shadow } from '../../constants/theme'

interface ZaadCardProps {
  children: React.ReactNode
  style?: ViewStyle
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'sm' | 'md' | 'none'
  border?: boolean
}

export function ZaadCard({
  children,
  style,
  padding = 'md',
  shadow = 'sm',
  border = true,
}: ZaadCardProps) {
  return (
    <View
      style={[
        styles.card,
        padding !== 'none' && styles[`pad_${padding}`],
        shadow !== 'none' && (Platform.OS === 'android'
          ? Shadow.android[shadow === 'sm' ? 'sm' : 'md']
          : Shadow.ios[shadow === 'sm' ? 'sm' : 'md']),
        border && styles.border,
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  border: {
    borderWidth: 1,
    borderColor: 'rgba(53, 26, 24, 0.045)',
  },
  pad_sm: { padding: Spacing.sm },
  pad_md: { padding: Spacing.base },
  pad_lg: { padding: Spacing.xl },
})

/**
 * زاد — Macro nutrient chip (calorie/protein/carbs/fat/sodium)
 * Small pill badge used on meal cards.
 */
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Colors, Typography, Radius } from '../../constants/theme'

type MacroType = 'calorie' | 'protein' | 'carbs' | 'fat' | 'sodium'

interface MacroChipProps {
  type: MacroType
  value: number
  unit?: string
}

const MACRO_META: Record<MacroType, { labelAr: string; colors: { bg: string; border: string; text: string } }> = {
  calorie: { labelAr: 'سعرة',    colors: Colors.calorie },
  protein: { labelAr: 'بروتين', colors: Colors.protein },
  carbs:   { labelAr: 'كارب',   colors: Colors.carbs   },
  fat:     { labelAr: 'دهن',    colors: Colors.fat     },
  sodium:  { labelAr: 'صوديوم', colors: Colors.sodium  },
}

export function MacroChip({ type, value, unit }: MacroChipProps) {
  const meta = MACRO_META[type]
  const displayUnit = unit ?? (type === 'calorie' ? '' : 'g')

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: meta.colors.bg,
          borderColor: meta.colors.border,
        },
      ]}
    >
      <Text style={[styles.text, { color: meta.colors.text }]}>
        {meta.labelAr} {value}{displayUnit}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  text: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: Typography.size.sm * 1.35,
  },
})

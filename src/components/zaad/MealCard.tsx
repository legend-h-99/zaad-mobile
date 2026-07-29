/**
 * زاد — Meal card component
 * Collapsible card showing meal name, macros, safety badge,
 * and expandable ingredients/instructions.
 * RTL layout.
 */
import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native'
import { ZaadCard } from '../ui/ZaadCard'
import { MacroChip } from '../ui/MacroChip'
import { SafetyBadge } from '../ui/SafetyBadge'
import { Colors, Typography, Spacing, Radius } from '../../constants/theme'
import type { MealItem } from '../../types'
import { MEAL_META, type MealKey } from '../../constants/data'

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true)
}

interface MealCardProps {
  mealKey: MealKey
  meal: MealItem
}

export function MealCard({ mealKey, meal }: MealCardProps) {
  const [expanded, setExpanded] = useState(false)
  const meta = MEAL_META[mealKey]

  function toggle() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpanded(prev => !prev)
  }

  return (
    <ZaadCard style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.mealMeta}>
          <Text style={styles.mealLabel}>{meta.labelAr}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.mealTime}>{meta.timeAr}</Text>
        </View>
        <SafetyBadge score={meal.safetyScore} />
      </View>

      {/* Meal name */}
      <Text style={styles.mealName}>{meal.nameAr}</Text>

      {/* Macros row */}
      <View style={styles.macrosRow}>
        <MacroChip type="calorie" value={meal.calories} />
        <MacroChip type="protein" value={meal.proteinG} />
        <MacroChip type="carbs"   value={meal.carbsG} />
        <MacroChip type="fat"     value={meal.fatG} />
      </View>

      {/* Safety note */}
      {!!meal.safetyReasonAr && (
        <Text style={styles.safetyNote}>{meal.safetyReasonAr}</Text>
      )}

      {/* Expand toggle */}
      <TouchableOpacity
        onPress={toggle}
        style={styles.toggleRow}
        accessibilityRole="button"
        accessibilityLabel={expanded ? 'إخفاء التفاصيل' : 'إظهار المكونات وطريقة التحضير'}
        accessibilityState={{ expanded }}
      >
        <Text style={styles.toggleText}>
          {expanded ? 'إخفاء التفاصيل ▲' : 'المكونات وطريقة التحضير ▼'}
        </Text>
      </TouchableOpacity>

      {/* Expanded content */}
      {expanded && (
        <View style={styles.expandedSection}>
          {/* Ingredients */}
          {meal.ingredientsAr.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>المكونات</Text>
              <View style={styles.chipGrid}>
                {meal.ingredientsAr.map((ing, i) => (
                  <View key={i} style={styles.ingredientChip}>
                    <Text style={styles.ingredientText}>{ing}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Instructions */}
          {!!meal.instructionsAr && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>طريقة التحضير</Text>
              <Text style={styles.instructions}>{meal.instructionsAr}</Text>
            </View>
          )}

          {/* Alternatives */}
          {meal.alternatives.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>بدائل مناسبة</Text>
              <View style={styles.chipGrid}>
                {meal.alternatives.map((alt, i) => (
                  <View key={i} style={styles.altChip}>
                    <Text style={styles.altText}>{alt}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </ZaadCard>
  )
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md },

  header: {
    flexDirection: 'row-reverse', // RTL
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  mealMeta: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  mealLabel: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
  },
  dot: {
    fontSize: Typography.size.xs,
    color: Colors.textDisabled,
  },
  mealTime: {
    fontSize: Typography.size.xs,
    color: Colors.textSubtle,
  },

  mealName: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'right',
    marginBottom: Spacing.sm,
    lineHeight: Typography.size.lg * 1.4,
  },

  macrosRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },

  safetyNote: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    textAlign: 'right',
    lineHeight: Typography.size.xs * 1.6,
    marginBottom: Spacing.sm,
  },

  toggleRow: {
    paddingVertical: 4,
    minHeight: 44,
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
    textAlign: 'right',
  },

  expandedSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
    gap: Spacing.md,
    backgroundColor: Colors.surfaceAlt,
    marginHorizontal: -Spacing.base,
    paddingHorizontal: Spacing.base,
    marginBottom: -Spacing.base,
    paddingBottom: Spacing.base,
  },

  section: { gap: Spacing.sm },
  sectionTitle: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textSecondary,
    textAlign: 'right',
  },

  chipGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 6,
  },
  ingredientChip: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  ingredientText: {
    fontSize: Typography.size.xs,
    color: Colors.primaryDark,
    fontFamily: Typography.fontFamily.regular,
  },
  altChip: {
    backgroundColor: Colors.background,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  altText: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
  },

  instructions: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    textAlign: 'right',
    lineHeight: Typography.size.sm * 1.75,
  },
})

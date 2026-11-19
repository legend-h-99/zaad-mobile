import { useEffect, useMemo, useState } from 'react'
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { addDays } from 'date-fns/addDays'
import { addMonths } from 'date-fns/addMonths'
import { addWeeks } from 'date-fns/addWeeks'
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval'
import { endOfMonth } from 'date-fns/endOfMonth'
import { format } from 'date-fns/format'
import { startOfMonth } from 'date-fns/startOfMonth'
import { startOfWeek } from 'date-fns/startOfWeek'
import { arSA } from 'date-fns/locale/ar-SA'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AppHeader } from '../src/components/ui/AppHeader'
import { REFERENCE_RECIPES } from '../src/constants/recipeData'
import { getPlanForDate, type DayPlan } from '../src/constants/mealSchedule'
import { Colors, Radius, Spacing, Typography } from '../src/constants/theme'
import { supabase } from '../src/lib/supabase/client'

type ScheduleMode = 'daily' | 'weekly' | 'monthly'
type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack'
interface LiveMeal {
  nameAr?: string
  nameEn?: string
  name_ar?: string
  calories: number
}
interface LivePlan {
  plan_date: string
  meals: Record<MealSlot, LiveMeal> & { notes?: string }
  ai_notes?: string | null
}

const MODES: { key: ScheduleMode; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: 'daily', label: 'يومي', icon: 'calendar' },
  { key: 'weekly', label: 'أسبوعي', icon: 'columns' },
  { key: 'monthly', label: 'شهري', icon: 'grid' },
]

const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack']
const MEAL_LABELS: Record<MealSlot, string> = {
  breakfast: 'الفطور',
  lunch: 'الغداء',
  dinner: 'العشاء',
  snack: 'السناك',
}

function recipeName(plan: DayPlan, slot: MealSlot) {
  return REFERENCE_RECIPES.find(recipe => recipe.id === plan[slot])?.nameAr ?? 'وجبة زاد'
}

function dateKey(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

function liveMealName(plan: DayPlan, livePlan: LivePlan | undefined, slot: MealSlot) {
  const meal = livePlan?.meals?.[slot]
  return meal?.nameAr ?? meal?.name_ar ?? recipeName(plan, slot)
}

function planCalories(plan: DayPlan, livePlan?: LivePlan) {
  if (!livePlan?.meals) return plan.totalCalories
  return MEAL_SLOTS.reduce((total, slot) => total + (livePlan.meals[slot]?.calories ?? 0), 0)
}

function periodDates(mode: ScheduleMode, anchor: Date) {
  if (mode === 'daily') return [anchor]
  if (mode === 'weekly') {
    const weekStart = startOfWeek(anchor, { weekStartsOn: 0 })
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
  }
  return eachDayOfInterval({
    start: startOfMonth(anchor),
    end: endOfMonth(anchor),
  })
}

function periodTitle(mode: ScheduleMode, anchor: Date) {
  if (mode === 'daily') return format(anchor, 'EEEE، d MMMM yyyy', { locale: arSA })
  if (mode === 'weekly') {
    const start = startOfWeek(anchor, { weekStartsOn: 0 })
    const end = addDays(start, 6)
    return `${format(start, 'd MMMM', { locale: arSA })} - ${format(end, 'd MMMM yyyy', { locale: arSA })}`
  }
  return format(anchor, 'MMMM yyyy', { locale: arSA })
}

function shiftPeriod(mode: ScheduleMode, anchor: Date, amount: number) {
  if (mode === 'daily') return addDays(anchor, amount)
  if (mode === 'weekly') return addWeeks(anchor, amount)
  return addMonths(anchor, amount)
}

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets()
  const [mode, setMode] = useState<ScheduleMode>('daily')
  const [anchor, setAnchor] = useState(new Date())
  const [livePlans, setLivePlans] = useState<Record<string, LivePlan>>({})
  const dates = useMemo(() => periodDates(mode, anchor), [mode, anchor])

  useEffect(() => {
    let active = true
    const start = dateKey(dates[0])
    const end = dateKey(dates[dates.length - 1])

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from('meal_plans')
        .select('plan_date, meals, ai_notes')
        .eq('user_id', user.id)
        .gte('plan_date', start)
        .lte('plan_date', end)

      if (!active) return
      const plans = ((data ?? []) as LivePlan[]).reduce<Record<string, LivePlan>>((result, plan) => {
        result[plan.plan_date] = plan
        return result
      }, {})
      setLivePlans(plans)
    }).catch(() => {})

    return () => {
      active = false
    }
  }, [dates])

  async function shareSchedule() {
    const dayLines = dates.map(date => {
      const plan = getPlanForDate(date)
      const livePlan = livePlans[dateKey(date)]
      const dateLabel = format(date, 'EEEE d MMMM', { locale: arSA })
      if (mode === 'monthly') {
        return `${dateLabel}: ${liveMealName(plan, livePlan, 'lunch')} · ${planCalories(plan, livePlan).toLocaleString('ar-SA')} سعرة`
      }
      const meals = MEAL_SLOTS
        .map(slot => `${MEAL_LABELS[slot]}: ${liveMealName(plan, livePlan, slot)}`)
        .join(' | ')
      return `${dateLabel}\n${meals}`
    })
    const modeLabel = MODES.find(item => item.key === mode)?.label ?? ''
    const message = `جدول زاد ${modeLabel}\n${periodTitle(mode, anchor)}\n\n${dayLines.join('\n\n')}`

    if (Platform.OS === 'web') {
      await Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`)
      return
    }
    await Share.share({ message, title: `جدول زاد ${modeLabel}` })
  }

  return (
    <View style={styles.screen}>
      <AppHeader titleAr="جدول الوجبات" showBack />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      >
        <View style={styles.modeControl}>
          {MODES.map(item => {
            const selected = item.key === mode
            return (
              <Pressable
                key={item.key}
                style={[styles.modeButton, selected && styles.modeButtonSelected]}
                onPress={() => setMode(item.key)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`عرض الجدول ${item.label}`}
              >
                <Feather
                  name={item.icon}
                  size={16}
                  color={selected ? Colors.surface : Colors.textMuted}
                />
                <Text style={[styles.modeText, selected && styles.modeTextSelected]}>
                  {item.label}
                </Text>
              </Pressable>
            )
          })}
        </View>

        <View style={styles.periodBar}>
          <Pressable
            style={styles.iconButton}
            onPress={() => setAnchor(current => shiftPeriod(mode, current, -1))}
            accessibilityLabel="الفترة السابقة"
          >
            <Feather name="chevron-right" size={20} color={Colors.burgundy} />
          </Pressable>
          <View style={styles.periodCopy}>
            <Text style={styles.periodLabel}>{periodTitle(mode, anchor)}</Text>
            <Text style={styles.periodHint}>{dates.length.toLocaleString('ar-SA')} أيام مخططة</Text>
          </View>
          <Pressable
            style={styles.iconButton}
            onPress={() => setAnchor(current => shiftPeriod(mode, current, 1))}
            accessibilityLabel="الفترة التالية"
          >
            <Feather name="chevron-left" size={20} color={Colors.burgundy} />
          </Pressable>
        </View>

        <Pressable
          style={styles.shareAction}
          onPress={shareSchedule}
          accessibilityRole="button"
          accessibilityLabel="مشاركة الجدول المعروض"
        >
          <Feather name="share-2" size={18} color={Colors.surface} />
          <Text style={styles.shareActionText}>مشاركة الجدول المعروض</Text>
        </Pressable>

        {mode === 'daily' && <DailySchedule date={dates[0]} livePlan={livePlans[dateKey(dates[0])]} />}

        {mode === 'weekly' && (
          <View style={styles.list}>
            {dates.map(date => (
              <WeekDay key={date.toISOString()} date={date} livePlan={livePlans[dateKey(date)]} />
            ))}
          </View>
        )}

        {mode === 'monthly' && (
          <View style={styles.monthGrid}>
            {dates.map(date => (
              <MonthDay key={date.toISOString()} date={date} livePlan={livePlans[dateKey(date)]} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

function DailySchedule({ date, livePlan }: { date: Date; livePlan?: LivePlan }) {
  const plan = getPlanForDate(date)
  const calories = planCalories(plan, livePlan)
  return (
    <View style={styles.dailyBand}>
      <View style={styles.dailySummary}>
        <View>
          <Text style={styles.dayTitle}>{plan.dayAr}</Text>
          <Text style={styles.dayDate}>{format(date, 'd MMMM yyyy', { locale: arSA })}</Text>
        </View>
        <View style={styles.caloriesPill}>
          <Text style={styles.caloriesValue}>{calories.toLocaleString('ar-SA')}</Text>
          <Text style={styles.caloriesLabel}>سعرة</Text>
        </View>
      </View>
      {MEAL_SLOTS.map(slot => (
        <View key={slot} style={styles.dailyMeal}>
          <View style={styles.mealIcon}>
            <Feather name={slot === 'snack' ? 'coffee' : 'sun'} size={16} color={Colors.primary} />
          </View>
          <View style={styles.mealCopy}>
            <Text style={styles.mealLabel}>{MEAL_LABELS[slot]}</Text>
            <Text style={styles.mealName}>{liveMealName(plan, livePlan, slot)}</Text>
          </View>
        </View>
      ))}
      <Text style={styles.note}>{livePlan?.ai_notes ?? livePlan?.meals?.notes ?? plan.noteAr}</Text>
    </View>
  )
}

function WeekDay({ date, livePlan }: { date: Date; livePlan?: LivePlan }) {
  const plan = getPlanForDate(date)
  return (
    <View style={styles.weekDay}>
      <View style={styles.weekDayHead}>
        <View>
          <Text style={styles.weekDayTitle}>{format(date, 'EEEE', { locale: arSA })}</Text>
          <Text style={styles.weekDayDate}>{format(date, 'd MMMM', { locale: arSA })}</Text>
        </View>
        <Text style={styles.weekCalories}>{planCalories(plan, livePlan).toLocaleString('ar-SA')} سعرة</Text>
      </View>
      <View style={styles.weekMeals}>
        {MEAL_SLOTS.map(slot => (
          <View key={slot} style={styles.weekMeal}>
            <Text style={styles.weekMealLabel}>{MEAL_LABELS[slot]}</Text>
            <Text style={styles.weekMealName} numberOfLines={2}>{liveMealName(plan, livePlan, slot)}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

function MonthDay({ date, livePlan }: { date: Date; livePlan?: LivePlan }) {
  const plan = getPlanForDate(date)
  return (
    <View style={styles.monthDay}>
      <View style={styles.monthDayHead}>
        <Text style={styles.monthDayName}>{format(date, 'EEEEE', { locale: arSA })}</Text>
        <Text style={styles.monthDayNumber}>{date.getDate().toLocaleString('ar-SA')}</Text>
      </View>
      <Feather name="sun" size={16} color={Colors.coral} />
      <Text style={styles.monthMeal} numberOfLines={3}>{liveMealName(plan, livePlan, 'lunch')}</Text>
      <Text style={styles.monthCalories}>{planCalories(plan, livePlan).toLocaleString('ar-SA')} سعرة</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.md, gap: Spacing.md },
  modeControl: {
    minHeight: 52,
    padding: 4,
    flexDirection: 'row-reverse',
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceAlt,
  },
  modeButton: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: Radius.md,
  },
  modeButtonSelected: { backgroundColor: Colors.primary },
  modeText: {
    color: Colors.textMuted,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.semiBold,
  },
  modeTextSelected: { color: Colors.surface },
  periodBar: {
    minHeight: 68,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodCopy: { flex: 1, alignItems: 'center' },
  periodLabel: {
    color: Colors.burgundy,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'center',
  },
  periodHint: {
    marginTop: 2,
    color: Colors.textMuted,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  shareAction: {
    minHeight: 48,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
  },
  shareActionText: {
    color: Colors.surface,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
  },
  dailyBand: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  dailySummary: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
  },
  dayTitle: {
    color: Colors.burgundy,
    fontSize: Typography.size.xl,
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'right',
  },
  dayDate: {
    color: Colors.textMuted,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  caloriesPill: {
    minWidth: 78,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.limeSoft,
  },
  caloriesValue: {
    color: Colors.primary,
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
  },
  caloriesLabel: {
    color: Colors.textMuted,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  dailyMeal: {
    minHeight: 62,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  mealIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
  },
  mealCopy: { flex: 1, alignItems: 'flex-end' },
  mealLabel: {
    color: Colors.textMuted,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  mealName: {
    color: Colors.burgundy,
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.semiBold,
    textAlign: 'right',
  },
  note: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    color: Colors.textMuted,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.6,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'right',
  },
  list: { gap: Spacing.sm },
  weekDay: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  weekDayHead: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.sm,
  },
  weekDayTitle: {
    color: Colors.burgundy,
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'right',
  },
  weekDayDate: {
    color: Colors.textMuted,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  weekCalories: {
    color: Colors.primary,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.semiBold,
  },
  weekMeals: { flexDirection: 'row-reverse', gap: 6 },
  weekMeal: {
    flex: 1,
    minHeight: 96,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
  },
  weekMealLabel: {
    color: Colors.textMuted,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'right',
  },
  weekMealName: {
    marginTop: 5,
    color: Colors.textPrimary,
    fontSize: Typography.size.sm,
    lineHeight: 20,
    fontFamily: Typography.fontFamily.semiBold,
    textAlign: 'right',
  },
  monthGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 6,
  },
  monthDay: {
    width: '23.6%',
    minHeight: 152,
    padding: 8,
    gap: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'flex-end',
  },
  monthDayHead: {
    width: '100%',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthDayName: {
    color: Colors.textMuted,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  monthDayNumber: {
    color: Colors.burgundy,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
  },
  monthMeal: {
    color: Colors.textPrimary,
    fontSize: Typography.size.xs,
    lineHeight: 18,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'right',
  },
  monthCalories: {
    marginTop: 'auto',
    color: Colors.primary,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.semiBold,
  },
})

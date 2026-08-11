import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  Image,
  LayoutAnimation,
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
import { addDays, format, isSameDay, startOfWeek } from 'date-fns'
import { arSA } from 'date-fns/locale'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Circle } from 'react-native-svg'
import { useRouter, type Href } from 'expo-router'

import { AppHeader } from '../../src/components/ui/AppHeader'
import { REFERENCE_RECIPES } from '../../src/constants/recipeData'
import { getPlanForDate, type DayPlan } from '../../src/constants/mealSchedule'
import { Colors, Radius, Spacing, Typography } from '../../src/constants/theme'
import { calculateDailyTargets } from '../../src/lib/nutrition/targets'
import { supabase } from '../../src/lib/supabase/client'
import { useAuthStore } from '../../src/store/auth'
import { useProfileStore } from '../../src/store/profile'
import type { MealItem, MealPlanMeals } from '../../src/types'

type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack'

interface LiveMealPlan {
  plan_date: string
  calories_target?: number | null
  protein_g?: number | null
  carbs_g?: number | null
  fat_g?: number | null
  meals: MealPlanMeals
  ai_notes?: string | null
}

const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack']
const MEAL_LABELS: Record<MealSlot, string> = {
  breakfast: 'الفطور · ٨:٠٠ ص',
  lunch: 'الغداء · ١٢:٣٠ م',
  dinner: 'العشاء · ٦:٣٠ م',
  snack: 'سناك · ٩:٠٠ م',
}
const MEAL_IMAGES = {
  breakfast: require('../../assets/meals/yogurt.png'),
  lunch: require('../../assets/meals/chicken.png'),
  dinner: require('../../assets/meals/tuna-salad.png'),
  snack: require('../../assets/meals/dates-walnuts.png'),
} as const

function toArabic(value: number) {
  return value.toLocaleString('ar-SA')
}

function MacroOrb({
  value,
  target,
  label,
  color,
}: {
  value: number
  target: number
  label: string
  color: string
}) {
  return (
    <View style={styles.macroWrap}>
      <View style={[styles.macroOrb, { backgroundColor: color }]}>
        <Text style={styles.macroValue}>{toArabic(value)}</Text>
        <Text style={styles.macroTarget}>من {toArabic(target)}</Text>
      </View>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  )
}

function ScoreRing({ score }: { score: number }) {
  const size = 112
  const stroke = 11
  const radius = (size - stroke) / 2
  const circumference = radius * 2 * Math.PI

  return (
    <View style={styles.scoreWrap}>
      <Svg width={size} height={size} style={styles.scoreSvg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#ECEAE5"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.lime}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference - (score / 100) * circumference}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={styles.scoreValue}>{toArabic(score)}</Text>
      <Text style={styles.scoreLabel}>نقاط زاد</Text>
    </View>
  )
}

function MealRow({
  slot,
  plan,
  liveMeal,
  expanded,
  onPress,
}: {
  slot: MealSlot
  plan: DayPlan
  liveMeal?: MealItem
  expanded: boolean
  onPress: () => void
}) {
  const recipe = REFERENCE_RECIPES.find(item => item.id === plan[slot]) ?? REFERENCE_RECIPES[0]
  const nameAr = liveMeal?.nameAr ?? recipe.nameAr
  const calories = liveMeal?.calories ?? recipe.calories
  const proteinG = liveMeal?.proteinG ?? recipe.proteinG
  const carbsG = liveMeal?.carbsG ?? recipe.carbsG
  const fatG = liveMeal?.fatG ?? recipe.fatG
  const detail = liveMeal?.ingredientsAr?.slice(0, 3).join('، ')
    ?? recipe.ingredientsAr?.slice(0, 3).join('، ')

  return (
    <Pressable
      style={styles.mealRow}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      accessibilityLabel={`${MEAL_LABELS[slot]}، ${nameAr}`}
    >
      <Image source={MEAL_IMAGES[slot]} style={styles.mealImage} />
      <View style={styles.mealCopy}>
        <Text style={styles.mealMeta}>{MEAL_LABELS[slot]}</Text>
        <Text style={styles.mealName} numberOfLines={2}>{nameAr}</Text>
        <View style={styles.mealNumbers}>
          <Text style={styles.mealCal}>{toArabic(calories)} سعرة</Text>
          <Text style={styles.proteinDot}>P</Text>
          <Text style={styles.mealNutrient}>{toArabic(proteinG)}</Text>
          <Text style={styles.carbDot}>C</Text>
          <Text style={styles.mealNutrient}>{toArabic(carbsG)}</Text>
          <Text style={styles.fatDot}>F</Text>
          <Text style={styles.mealNutrient}>{toArabic(fatG)}</Text>
        </View>
        {expanded && (
          <Text style={styles.mealDetail}>
            {detail}
          </Text>
        )}
      </View>
      <Feather
        name={expanded ? 'chevron-up' : 'chevron-left'}
        size={18}
        color={Colors.textSubtle}
      />
    </Pressable>
  )
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const isDemoMode = useAuthStore(state => state.isDemoMode)
  const user = useAuthStore(state => state.user)
  const profile = useProfileStore(state => state.profile)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [expandedMeal, setExpandedMeal] = useState<MealSlot | null>(null)
  const [livePlan, setLivePlan] = useState<LiveMealPlan | null>(null)
  const enter = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start()
  }, [enter])

  const plan = useMemo(() => getPlanForDate(selectedDate), [selectedDate])
  const selectedDateKey = useMemo(
    () => format(selectedDate, 'yyyy-MM-dd'),
    [selectedDate],
  )
  const weekStart = useMemo(
    () => startOfWeek(selectedDate, { weekStartsOn: 0 }),
    [selectedDate],
  )
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  )
  const activeProfile = isDemoMode ? null : profile
  const firstName = activeProfile?.fullName?.split(' ')[0] ?? 'المستخدم'
  const dailyTargets = calculateDailyTargets(activeProfile ?? {})
  const displayTotals = {
    calories: livePlan?.calories_target ?? plan.totalCalories,
    protein: livePlan?.protein_g ?? plan.proteinG,
    carbs: livePlan?.carbs_g ?? plan.carbsG,
    fat: livePlan?.fat_g ?? plan.fatG,
  }
  const score = Math.min(96, 54 + Math.round((displayTotals.protein / dailyTargets.protein) * 34))

  useEffect(() => {
    let active = true
    if (!user?.id || isDemoMode) {
      setLivePlan(null)
      return
    }
    const userId = user.id

    async function loadLivePlan() {
      try {
        const { data } = await supabase
          .from('meal_plans')
          .select('plan_date, calories_target, protein_g, carbs_g, fat_g, meals, ai_notes')
          .eq('user_id', userId)
          .eq('plan_date', selectedDateKey)
          .maybeSingle()

        if (active) setLivePlan(data as LiveMealPlan | null)
      } catch {
        if (active) setLivePlan(null)
      }
    }

    void loadLivePlan()

    return () => {
      active = false
    }
  }, [isDemoMode, selectedDateKey, user?.id])

  function toggleMeal(slot: MealSlot) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedMeal(current => current === slot ? null : slot)
  }

  async function sharePlan() {
    const lines = MEAL_SLOTS.map(slot => {
      const recipe = REFERENCE_RECIPES.find(item => item.id === plan[slot])
      return `${MEAL_LABELS[slot]}: ${recipe?.nameAr ?? ''}`
    })
    const message = `خطة زاد ليوم ${format(selectedDate, 'EEEE d MMMM', { locale: arSA })}\n\n${lines.join('\n')}`

    if (Platform.OS === 'web') {
      await Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`)
      return
    }

    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`
    const canOpen = await Linking.canOpenURL(whatsappUrl)
    if (canOpen) {
      await Linking.openURL(whatsappUrl)
    } else {
      await Share.share({ message })
    }
  }

  return (
    <View style={styles.screen}>
      <AppHeader titleAr={`يومك يا ${firstName}`} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 112 },
        ]}
      >
        <Animated.View
          style={{
            opacity: enter,
            transform: [{
              translateY: enter.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            }],
          }}
        >
          <View style={styles.scoreCard}>
            <View style={styles.scoreText}>
              <Text style={styles.eyebrow}>ملخص اختياراتك اليوم</Text>
              <Text style={styles.scoreTitle}>بداية متوازنة، استمر بهذا الإيقاع.</Text>
              <Text style={styles.scoreBody}>
                البروتين ممتاز والصوديوم ضمن النطاق المناسب لخطة اليوم.
              </Text>
            </View>
            <ScoreRing score={score} />
          </View>
        </Animated.View>

        <View style={styles.goalCard}>
          <View style={styles.sectionHead}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.goalIcon}>
                <Feather name="target" size={17} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.sectionTitle}>هدف اليوم</Text>
                <Text style={styles.sectionSub}>توازن الوجبات</Text>
              </View>
            </View>
            <Pressable
              style={styles.miniButton}
              onPress={() => router.push('/goals')}
              accessibilityLabel="تعديل الهدف"
            >
              <Feather name="plus" size={18} color={Colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.macrosRow}>
            <MacroOrb value={displayTotals.calories} target={dailyTargets.calories} label="سعرة" color="#F0F0ED" />
            <MacroOrb value={displayTotals.protein} target={dailyTargets.protein} label="بروتين" color="#F8A17F" />
            <MacroOrb value={displayTotals.carbs} target={dailyTargets.carbs} label="كارب" color={Colors.lime} />
            <MacroOrb value={displayTotals.fat} target={dailyTargets.fat} label="دهون" color="#F3CC4A" />
          </View>
        </View>

        <View style={styles.dateStrip}>
          {weekDays.map(day => {
            const selected = isSameDay(day, selectedDate)
            return (
              <Pressable
                key={day.toISOString()}
                style={[styles.day, selected && styles.daySelected]}
                onPress={() => setSelectedDate(day)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.dayName, selected && styles.dayTextSelected]}>
                  {format(day, 'EEEEE', { locale: arSA })}
                </Text>
                <Text style={[styles.dayNumber, selected && styles.dayTextSelected]}>
                  {toArabic(day.getDate())}
                </Text>
              </Pressable>
            )
          })}
        </View>

        <View style={styles.foodCard}>
          <View style={styles.foodHeader}>
            <View>
              <Text style={styles.foodTitle}>وجبات اليوم</Text>
              <Text style={styles.foodDate}>
                {format(selectedDate, 'EEEE، d MMMM', { locale: arSA })}
              </Text>
            </View>
            <Pressable onPress={sharePlan} style={styles.shareButton} accessibilityLabel="مشاركة الخطة">
              <Feather name="share-2" size={17} color={Colors.primary} />
            </Pressable>
          </View>

          {MEAL_SLOTS.map(slot => (
            <MealRow
              key={slot}
              slot={slot}
              plan={plan}
              liveMeal={livePlan?.meals?.[slot]}
              expanded={expandedMeal === slot}
              onPress={() => toggleMeal(slot)}
            />
          ))}

          <Pressable
            style={styles.timelineButton}
            accessibilityRole="button"
            accessibilityLabel="عرض الجدول اليومي والأسبوعي والشهري"
            onPress={() => router.push('/schedule' as Href)}
          >
            <Text style={styles.timelineText}>عرض الجدول الكامل</Text>
          </Pressable>
        </View>

        <View style={styles.digestCard}>
          <View style={styles.digestHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="bar-chart-2" size={20} color={Colors.burgundy} />
              <Text style={styles.digestTitle}>ملخص الأسبوع</Text>
            </View>
            <Feather name="info" size={18} color={Colors.burgundy} />
          </View>
          <Text style={styles.digestCopy}>٤ أيام متوازنة هذا الأسبوع. يوم واحد إضافي يفتح لك تحليلاً أعمق.</Text>
          <View style={styles.weekProgress}>
            {['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'].map((day, index) => (
              <View
                key={day}
                style={[styles.progressDay, index < 4 && styles.progressDayDone]}
              >
                {index < 4
                  ? <Feather name="check" size={15} color={Colors.surface} />
                  : <Text style={styles.progressDayText}>{day}</Text>}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#2C211C',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
  },
  android: { elevation: 3 },
  web: { boxShadow: '0 10px 30px rgba(44, 33, 28, 0.07)' },
})

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  scoreCard: {
    minHeight: 180,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    ...cardShadow,
  },
  scoreText: { flex: 1, alignItems: 'flex-end', gap: 5 },
  eyebrow: {
    fontSize: Typography.size.xs,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.semiBold,
    textAlign: 'right',
  },
  scoreTitle: {
    fontSize: Typography.size.xl,
    lineHeight: 29,
    color: Colors.burgundy,
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'right',
  },
  scoreBody: {
    fontSize: Typography.size.xs,
    lineHeight: 19,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'right',
  },
  scoreWrap: {
    width: 112,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreSvg: { position: 'absolute', top: 0 },
  scoreValue: {
    marginTop: -18,
    fontSize: 31,
    color: Colors.burgundy,
    fontFamily: Typography.fontFamily.bold,
  },
  scoreLabel: {
    marginTop: 17,
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    color: Colors.burgundy,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.semiBold,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 5 },
      android: { elevation: 2 },
    }),
  },
  goalCard: {
    padding: Spacing.base,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    ...cardShadow,
  },
  sectionHead: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.base,
  },
  sectionTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  sectionTitle: {
    color: Colors.burgundy,
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'right',
  },
  sectionSub: {
    color: Colors.textMuted,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'right',
  },
  miniButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceAlt,
  },
  macrosRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 5,
  },
  macroWrap: { flex: 1, alignItems: 'center', gap: 5 },
  macroOrb: {
    width: 66,
    height: 66,
    maxWidth: '100%',
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroValue: {
    color: Colors.burgundy,
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
  },
  macroTarget: {
    color: 'rgba(53,26,24,0.55)',
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  macroLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  dateStrip: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    padding: 5,
    borderRadius: 22,
    backgroundColor: 'rgba(255,253,252,0.7)',
  },
  day: {
    width: 43,
    height: 57,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  daySelected: { backgroundColor: Colors.primary },
  dayName: {
    color: Colors.textMuted,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  dayNumber: {
    color: Colors.burgundy,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
  },
  dayTextSelected: { color: Colors.surface },
  foodCard: {
    padding: Spacing.base,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    ...cardShadow,
  },
  foodHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  foodTitle: {
    color: Colors.burgundy,
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'right',
  },
  foodDate: {
    color: Colors.textMuted,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'right',
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  mealRow: {
    minHeight: 89,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  mealImage: {
    width: 66,
    height: 66,
    borderRadius: 16,
    backgroundColor: Colors.surfaceAlt,
  },
  mealCopy: { flex: 1, alignItems: 'flex-end' },
  mealMeta: {
    color: Colors.textMuted,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  mealName: {
    marginTop: 1,
    color: Colors.burgundy,
    fontSize: Typography.size.base,
    lineHeight: 23,
    fontFamily: Typography.fontFamily.semiBold,
    textAlign: 'right',
  },
  mealNumbers: {
    marginTop: 3,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 3,
  },
  mealCal: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  mealNutrient: {
    color: Colors.textMuted,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  proteinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    textAlign: 'center',
    color: Colors.surface,
    backgroundColor: Colors.coral,
    fontSize: 8,
    fontFamily: Typography.fontFamily.bold,
  },
  carbDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    textAlign: 'center',
    color: Colors.burgundy,
    backgroundColor: Colors.lime,
    fontSize: 8,
    fontFamily: Typography.fontFamily.bold,
  },
  fatDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    textAlign: 'center',
    color: Colors.burgundy,
    backgroundColor: '#F3CC4A',
    fontSize: 8,
    fontFamily: Typography.fontFamily.bold,
  },
  mealDetail: {
    marginTop: 6,
    color: Colors.textMuted,
    fontSize: Typography.size.xs,
    lineHeight: 18,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'right',
  },
  timelineButton: {
    minHeight: 48,
    marginTop: Spacing.sm,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceAlt,
  },
  timelineText: {
    color: Colors.burgundy,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.semiBold,
  },
  digestCard: {
    padding: Spacing.base,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    ...cardShadow,
  },
  digestHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  digestTitle: {
    color: Colors.burgundy,
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
  },
  digestCopy: {
    marginTop: Spacing.sm,
    color: Colors.textMuted,
    fontSize: Typography.size.xs,
    lineHeight: 19,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'right',
  },
  weekProgress: {
    marginTop: Spacing.md,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  progressDay: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECEAE6',
  },
  progressDayDone: { backgroundColor: Colors.primary },
  progressDayText: {
    color: Colors.textMuted,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.medium,
  },
})

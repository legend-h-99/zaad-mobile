import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AppHeader } from '../src/components/ui/AppHeader'
import { ZaadButton } from '../src/components/ui/ZaadButton'
import { ZaadCard } from '../src/components/ui/ZaadCard'
import { Colors, Radius, Spacing, Typography } from '../src/constants/theme'
import { useSession } from '../src/hooks/useSession'
import { calculateDailyTargets, targetsFromCalories } from '../src/lib/nutrition/targets'
import { supabase } from '../src/lib/supabase/client'
import { useAuthStore } from '../src/store/auth'
import { useProfileStore } from '../src/store/profile'
import type { HealthGoal } from '../src/types'

const GOALS: Array<{
  value: HealthGoal
  label: string
  description: string
  icon: React.ComponentProps<typeof Feather>['name']
}> = [
  { value: 'energy', label: 'توازن وطاقة', description: 'نمط يومي متوازن بدون هدف علاجي', icon: 'sun' },
  { value: 'weight_loss', label: 'خفض الوزن', description: 'نزول تدريجي مع وجبات مشبعة', icon: 'trending-down' },
  { value: 'weight_gain', label: 'زيادة الوزن', description: 'رفع الطاقة والبروتين بطريقة منظمة', icon: 'trending-up' },
  { value: 'blood_sugar_control', label: 'ضبط السكر', description: 'توزيع الكربوهيدرات على اليوم', icon: 'droplet' },
  { value: 'cholesterol', label: 'خفض الدهون', description: 'ألياف أكثر ودهون مشبعة أقل', icon: 'heart' },
  { value: 'therapeutic', label: 'تغذية علاجية', description: 'خطة تراعي حالتك ونتائج تحاليلك', icon: 'activity' },
]

export default function GoalsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user } = useSession()
  const isDemoMode = useAuthStore(s => s.isDemoMode)
  const liveProfile = useProfileStore(s => s.profile)
  const loadProfile = useProfileStore(s => s.loadProfile)
  const profile = isDemoMode ? null : liveProfile

  const [selectedGoal, setSelectedGoal] = useState<HealthGoal>(profile?.goal ?? 'energy')
  const calculated = useMemo(
    () => calculateDailyTargets({ ...profile, goal: selectedGoal }),
    [profile, selectedGoal],
  )
  const [calories, setCalories] = useState(calculated.calories)
  const [saving, setSaving] = useState(false)
  const targets = useMemo(
    () => targetsFromCalories(calories, profile?.weightKg),
    [calories, profile?.weightKg],
  )

  useEffect(() => {
    setCalories(calculated.calories)
  }, [calculated.calories])

  function adjustCalories(amount: number) {
    setCalories(current => Math.min(4500, Math.max(1200, current + amount)))
  }

  async function saveGoal() {
    if (isDemoMode) {
      Alert.alert('يرجى تسجيل الدخول', 'سجّل الدخول لتحديث هدفك اليومي.')
      return
    }
    if (!user?.id) return

    setSaving(true)
    const { error } = await supabase
      .from('health_profiles')
      .update({ goal: selectedGoal })
      .eq('user_id', user.id)

    if (error) {
      setSaving(false)
      Alert.alert('تعذر الحفظ', error.message)
      return
    }

    await loadProfile(user.id)
    setSaving(false)
    Alert.alert('تم تحديث هدفك', 'أعدنا حساب المستهدفات اليومية بناءً على اختيارك.')
    router.back()
  }

  return (
    <>
      <AppHeader titleAr="الهدف اليومي" showBack />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing['2xl'] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.title}>ما الذي تريد التركيز عليه؟</Text>
          <Text style={styles.subtitle}>اختر هدفًا واحدًا ليبقى يومك واضحًا.</Text>
        </View>

        <View style={styles.goalsList}>
          {GOALS.map(goal => {
            const selected = selectedGoal === goal.value
            return (
              <TouchableOpacity
                key={goal.value}
                style={[styles.goalRow, selected && styles.goalRowSelected]}
                onPress={() => setSelectedGoal(goal.value)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
              >
                <View style={[styles.goalIcon, selected && styles.goalIconSelected]}>
                  <Feather
                    name={goal.icon}
                    size={20}
                    color={selected ? Colors.burgundy : Colors.primary}
                  />
                </View>
                <View style={styles.goalCopy}>
                  <Text style={styles.goalLabel}>{goal.label}</Text>
                  <Text style={styles.goalDescription}>{goal.description}</Text>
                </View>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        <ZaadCard style={styles.targetCard} padding="lg">
          <Text style={styles.targetEyebrow}>السعرات المقترحة</Text>
          <View style={styles.calorieControl}>
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => adjustCalories(-50)}
              accessibilityLabel="خفض السعرات"
            >
              <Feather name="minus" size={22} color={Colors.surface} />
            </TouchableOpacity>
            <View style={styles.calorieCircle}>
              <Text style={styles.calorieValue}>{targets.calories.toLocaleString('ar-SA')}</Text>
              <Text style={styles.calorieUnit}>سعرة يوميًا</Text>
            </View>
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => adjustCalories(50)}
              accessibilityLabel="زيادة السعرات"
            >
              <Feather name="plus" size={22} color={Colors.surface} />
            </TouchableOpacity>
          </View>

          <View style={styles.macros}>
            <View style={[styles.macro, { backgroundColor: Colors.protein.bg }]}>
              <Text style={[styles.macroValue, { color: Colors.protein.text }]}>{targets.protein}غ</Text>
              <Text style={styles.macroLabel}>بروتين</Text>
            </View>
            <View style={[styles.macro, { backgroundColor: Colors.carbs.bg }]}>
              <Text style={[styles.macroValue, { color: Colors.carbs.text }]}>{targets.carbs}غ</Text>
              <Text style={styles.macroLabel}>كارب</Text>
            </View>
            <View style={[styles.macro, { backgroundColor: Colors.fat.bg }]}>
              <Text style={[styles.macroValue, { color: Colors.fat.text }]}>{targets.fat}غ</Text>
              <Text style={styles.macroLabel}>دهون</Text>
            </View>
          </View>
        </ZaadCard>

        <View style={styles.infoRow}>
          <Feather name="info" size={16} color={Colors.primary} />
          <Text style={styles.infoText}>
            هذه نقطة بداية غذائية وليست وصفة طبية، وتتغير مع الوزن والنشاط ونتائج المتابعة.
          </Text>
        </View>

        <ZaadButton
          labelAr="اعتماد الهدف"
          onPress={saveGoal}
          loading={saving}
          icon={<Feather name="check" size={18} color={Colors.surface} />}
        />
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    gap: Spacing.base,
  },
  intro: { alignItems: 'flex-end', gap: 3, paddingHorizontal: Spacing.xs },
  title: {
    fontSize: Typography.size['2xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.burgundy,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  goalsList: { gap: Spacing.sm },
  goalRow: {
    minHeight: 72,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  goalRowSelected: {
    backgroundColor: Colors.limeSoft,
    borderColor: Colors.lime,
  },
  goalIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  goalIconSelected: { backgroundColor: Colors.lime },
  goalCopy: { flex: 1, alignItems: 'flex-end' },
  goalLabel: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  goalDescription: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  radioSelected: { borderColor: Colors.primary },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary },
  targetCard: { gap: Spacing.lg, alignItems: 'center' },
  targetEyebrow: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
  },
  calorieControl: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  adjustButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  calorieCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 10,
    borderColor: Colors.limeSoft,
  },
  calorieValue: {
    fontSize: Typography.size['3xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.burgundy,
  },
  calorieUnit: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
  },
  macros: { width: '100%', flexDirection: 'row-reverse', gap: Spacing.sm },
  macro: {
    flex: 1,
    minHeight: 72,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroValue: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
  },
  macroLabel: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  infoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.7,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    textAlign: 'right',
  },
})

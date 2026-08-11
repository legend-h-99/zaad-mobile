import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Feather } from '@expo/vector-icons'

import { supabase } from '../../src/lib/supabase/client'
import { useSession } from '../../src/hooks/useSession'
import { useAuthStore } from '../../src/store/auth'
import { ZaadCard } from '../../src/components/ui/ZaadCard'
import { ZaadButton } from '../../src/components/ui/ZaadButton'
import { AppHeader } from '../../src/components/ui/AppHeader'
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme'
import type { ProgressLog } from '../../src/types'

type MetricKey = 'meal' | 'weight' | 'glucose' | 'pressure'
type FeatherName = React.ComponentProps<typeof Feather>['name']

const METRICS: Array<{
  key: MetricKey
  icon: FeatherName
  label: string
  color: string
}> = [
  { key: 'meal', icon: 'coffee', label: 'الوجبات', color: Colors.coral },
  { key: 'weight', icon: 'trending-up', label: 'الوزن', color: Colors.lime },
  { key: 'glucose', icon: 'droplet', label: 'السكر', color: Colors.amber },
  { key: 'pressure', icon: 'activity', label: 'الضغط', color: Colors.sky },
]

export default function TrackScreen() {
  const insets = useSafeAreaInsets()
  const { user } = useSession()
  const queryClient = useQueryClient()
  const isDemoMode = useAuthStore(s => s.isDemoMode)
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  const [activeMetric, setActiveMetric] = useState<MetricKey>('meal')
  const [weight, setWeight] = useState('')
  const [glucose, setGlucose] = useState('')
  const [bpSys, setBpSys] = useState('')
  const [bpDia, setBpDia] = useState('')
  const [mealsFollowed, setMealsFollowed] = useState<boolean | null>(null)
  const [notes, setNotes] = useState('')
  const entrance = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.spring(entrance, {
      toValue: 1,
      useNativeDriver: true,
      damping: 18,
      stiffness: 120,
    }).start()
  }, [entrance])

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['progress-logs', isDemoMode],
    queryFn: async () => {
      if (isDemoMode) return []
      if (!user?.id) return []
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const { data } = await supabase
        .from('progress_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('log_date', sevenDaysAgo.toISOString().split('T')[0])
        .order('log_date', { ascending: false })
      return (data ?? []).map(row => ({
        id: row.id,
        userId: row.user_id,
        logDate: row.log_date,
        weightKg: row.weight_kg ?? undefined,
        glucoseMg: row.glucose_mg ?? undefined,
        bloodPressureSys: row.blood_pressure_sys ?? undefined,
        bloodPressureDia: row.blood_pressure_dia ?? undefined,
        mealsFollowed: row.meals_followed ?? undefined,
        notes: row.notes ?? undefined,
        createdAt: row.created_at,
      })) as ProgressLog[]
    },
    enabled: isDemoMode || !!user?.id,
  })

  const todayLog = logs.find(log => log.logDate === today)

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isDemoMode) return
      if (!user?.id) throw new Error('يرجى تسجيل الدخول')
      const { error } = await supabase.from('progress_logs').upsert({
        user_id: user.id,
        log_date: today,
        weight_kg: weight ? parseFloat(weight) : null,
        glucose_mg: glucose ? parseFloat(glucose) : null,
        blood_pressure_sys: bpSys ? parseInt(bpSys, 10) : null,
        blood_pressure_dia: bpDia ? parseInt(bpDia, 10) : null,
        meals_followed: mealsFollowed,
        notes: notes.trim() || null,
      }, { onConflict: 'user_id,log_date' })
      if (error) throw error
    },
    onSuccess: () => {
      if (!isDemoMode) {
        queryClient.invalidateQueries({ queryKey: ['progress-logs'] })
      }
      Alert.alert('تم الحفظ', 'أضيف سجل اليوم إلى تقدمك')
      setWeight('')
      setGlucose('')
      setBpSys('')
      setBpDia('')
      setMealsFollowed(null)
      setNotes('')
    },
    onError: error => {
      Alert.alert('تعذر الحفظ', error instanceof Error ? error.message : 'حاول مجددًا')
    },
  })

  function YesNoToggle() {
    return (
      <View style={styles.yesNoRow}>
        <TouchableOpacity
          style={[styles.yesNoButton, mealsFollowed === true && styles.yesSelected]}
          onPress={() => setMealsFollowed(true)}
        >
          <Text style={styles.yesNoText}>نعم، التزمت</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.yesNoButton, mealsFollowed === false && styles.noSelected]}
          onPress={() => setMealsFollowed(false)}
        >
          <Text style={styles.yesNoText}>ليس بالكامل</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <>
      <AppHeader titleAr="أضف إلى يومك" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.animatedContent,
            {
              opacity: entrance,
              transform: [{
                translateY: entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [18, 0],
                }),
              }],
            },
          ]}
        >
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Feather name="plus" size={28} color={Colors.surface} />
            </View>
            <Text style={styles.heroTitle}>ما الذي تريد تسجيله؟</Text>
            <Text style={styles.heroDate}>
              {new Date().toLocaleDateString('ar-SA', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.metricPicker}>
            {METRICS.map(metric => {
              const selected = activeMetric === metric.key
              return (
                <TouchableOpacity
                  key={metric.key}
                  style={styles.metricChoice}
                  onPress={() => setActiveMetric(metric.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <View style={[
                    styles.metricChoiceIcon,
                    { backgroundColor: selected ? metric.color : Colors.surface },
                    selected && styles.metricChoiceIconSelected,
                  ]}>
                    <Feather
                      name={metric.icon}
                      size={21}
                      color={selected ? Colors.burgundy : Colors.primary}
                    />
                  </View>
                  <Text style={[
                    styles.metricChoiceLabel,
                    selected && styles.metricChoiceLabelSelected,
                  ]}>
                    {metric.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <ZaadCard style={styles.logCard} padding="lg">
            {activeMetric === 'meal' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.logCardTitle}>التزام الوجبات</Text>
                <Text style={styles.fieldHint}>هل اتبعت خطة زاد اليوم؟</Text>
                <YesNoToggle />
              </View>
            )}

            {activeMetric === 'weight' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.logCardTitle}>وزنك اليوم</Text>
                <View style={styles.unitInput}>
                  <TextInput
                    style={styles.focusInput}
                    value={weight}
                    onChangeText={setWeight}
                    placeholder={todayLog?.weightKg?.toString() ?? '70.0'}
                    placeholderTextColor={Colors.textDisabled}
                    keyboardType="decimal-pad"
                    textAlign="center"
                  />
                  <Text style={styles.inputUnit}>كغ</Text>
                </View>
              </View>
            )}

            {activeMetric === 'glucose' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.logCardTitle}>سكر الصيام</Text>
                <View style={styles.unitInput}>
                  <TextInput
                    style={styles.focusInput}
                    value={glucose}
                    onChangeText={setGlucose}
                    placeholder={todayLog?.glucoseMg?.toString() ?? '100'}
                    placeholderTextColor={Colors.textDisabled}
                    keyboardType="decimal-pad"
                    textAlign="center"
                  />
                  <Text style={styles.inputUnit}>mg/dL</Text>
                </View>
              </View>
            )}

            {activeMetric === 'pressure' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.logCardTitle}>ضغط الدم</Text>
                <View style={styles.bpRow}>
                  <TextInput
                    style={[styles.input, styles.bpInput]}
                    value={bpSys}
                    onChangeText={setBpSys}
                    placeholder="120"
                    placeholderTextColor={Colors.textDisabled}
                    keyboardType="number-pad"
                    textAlign="center"
                  />
                  <Text style={styles.bpSlash}>/</Text>
                  <TextInput
                    style={[styles.input, styles.bpInput]}
                    value={bpDia}
                    onChangeText={setBpDia}
                    placeholder="80"
                    placeholderTextColor={Colors.textDisabled}
                    keyboardType="number-pad"
                    textAlign="center"
                  />
                </View>
                <Text style={styles.fieldHint}>انقباضي / انبساطي</Text>
              </View>
            )}

            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="أضف ملاحظة قصيرة (اختياري)"
              placeholderTextColor={Colors.textDisabled}
              multiline
              textAlign="right"
            />

            <ZaadButton
              labelAr="حفظ سجل اليوم"
              onPress={() => saveMutation.mutate()}
              loading={saveMutation.isPending}
              icon={<Feather name="check" size={18} color={Colors.surface} />}
            />
          </ZaadCard>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>آخر 7 أيام</Text>
            <Text style={styles.sectionCount}>{logs.length} سجلات</Text>
          </View>

          <ZaadCard padding="none" style={styles.historyList}>
            {logs.map((log, index) => (
              <View
                key={log.id}
                style={[styles.historyRow, index > 0 && styles.historyDivider]}
              >
                <View style={[
                  styles.adherenceDot,
                  {
                    backgroundColor: log.mealsFollowed
                      ? Colors.lime
                      : log.mealsFollowed === false
                        ? Colors.coral
                        : Colors.border,
                  },
                ]} />
                <View style={styles.historyMain}>
                  <Text style={styles.historyDate}>
                    {new Date(log.logDate).toLocaleDateString('ar-SA', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.historyNotes} numberOfLines={1}>
                    {log.notes || (log.mealsFollowed ? 'تم الالتزام بالخطة' : 'قياسات يومية')}
                  </Text>
                </View>
                <View style={styles.historyValue}>
                  <Text style={styles.metricValue}>
                    {log.weightKg ??
                      log.glucoseMg ??
                      (log.bloodPressureSys
                        ? `${log.bloodPressureSys}/${log.bloodPressureDia}`
                        : '—')}
                  </Text>
                  <Text style={styles.metricUnit}>
                    {log.weightKg
                      ? 'كغ'
                      : log.glucoseMg
                        ? 'سكر'
                        : log.bloodPressureSys
                          ? 'ضغط'
                          : ''}
                  </Text>
                </View>
              </View>
            ))}
            {!isLoading && logs.length === 0 && (
              <View style={styles.emptyHistory}>
                <Feather name="activity" size={28} color={Colors.primary} />
                <Text style={styles.emptyTitle}>أول سجل يبدأ من هنا</Text>
                <Text style={styles.emptySubtitle}>
                  اختر نوع القياس وسجّله خلال ثوانٍ.
                </Text>
              </View>
            )}
          </ZaadCard>
        </Animated.View>
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm },
  animatedContent: { gap: Spacing.base },
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: 4,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginBottom: Spacing.xs,
  },
  heroTitle: {
    fontSize: Typography.size['2xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.burgundy,
    textAlign: 'center',
  },
  heroDate: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily.regular,
  },
  metricPicker: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },
  metricChoice: {
    width: 76,
    minHeight: 84,
    alignItems: 'center',
    gap: 6,
  },
  metricChoiceIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  metricChoiceIconSelected: {
    borderColor: 'transparent',
    transform: [{ scale: 1.06 }],
  },
  metricChoiceLabel: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  metricChoiceLabelSelected: { color: Colors.textPrimary },
  logCard: { gap: Spacing.base },
  fieldGroup: { gap: Spacing.md },
  logCardTitle: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  fieldHint: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  yesNoRow: { flexDirection: 'row-reverse', gap: Spacing.sm },
  yesNoButton: {
    flex: 1,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
  },
  yesSelected: { backgroundColor: Colors.lime },
  noSelected: { backgroundColor: Colors.coral },
  yesNoText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.burgundy,
  },
  unitInput: { alignItems: 'center', paddingVertical: Spacing.sm },
  focusInput: {
    minWidth: 170,
    fontSize: 46,
    lineHeight: 58,
    color: Colors.burgundy,
    fontFamily: Typography.fontFamily.light,
  },
  inputUnit: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily.medium,
  },
  input: {
    minHeight: 50,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceAlt,
    color: Colors.textPrimary,
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.regular,
  },
  notesInput: { minHeight: 54, maxHeight: 92 },
  bpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  bpInput: { width: 112, fontSize: Typography.size['2xl'] },
  bpSlash: {
    fontSize: Typography.size['3xl'],
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily.light,
  },
  demoText: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
  },
  sectionHeading: {
    flexDirection: 'row-reverse',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  sectionCount: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
  },
  historyList: { paddingHorizontal: Spacing.base },
  historyRow: {
    minHeight: 70,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.md,
  },
  historyDivider: { borderTopWidth: 1, borderTopColor: Colors.borderLight },
  adherenceDot: { width: 12, height: 12, borderRadius: 6 },
  historyMain: { flex: 1, alignItems: 'flex-end' },
  historyDate: {
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'right',
  },
  historyNotes: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'right',
  },
  historyValue: { minWidth: 58, alignItems: 'center' },
  metricValue: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  metricUnit: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily.regular,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    textAlign: 'center',
  },
})

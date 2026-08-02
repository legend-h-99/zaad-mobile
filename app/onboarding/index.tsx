/**
 * زاد — Onboarding flow (4 steps)
 * Mirrors web app /onboarding/page.tsx exactly but native.
 *
 * Step 1: Select chronic conditions
 * Step 2: Basic health info (age, gender, height, weight, goal)
 * Step 3: Lab report upload (optional)
 * Step 4: Food preferences (cuisines, allergies)
 */
import { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { Feather } from '@expo/vector-icons'

import { useSession } from '../../src/hooks/useSession'
import { useAuthStore } from '../../src/store/auth'
import { useProfileStore } from '../../src/store/profile'
import { API_ROUTES, HAS_REMOTE_API, apiFetch } from '../../src/lib/api/config'
import { uploadAndAnalyzeReport } from '../../src/lib/api/reports'
import { supabase } from '../../src/lib/supabase/client'
import { calculateDailyTargets } from '../../src/lib/nutrition/targets'
import { ZaadButton } from '../../src/components/ui/ZaadButton'
import { PageIntroCard } from '../../src/components/zaad/ContentBlocks'
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme'
import { ZAAD_PAGE_CONTENT } from '../../src/constants/zaadContent'
import {
  ONBOARDING_CONDITIONS,
  HEALTH_GOALS,
  CUISINE_TYPES,
  FOOD_ALLERGIES,
  calcBMI,
  bmiCategory,
  toggleArrayItem,
} from '../../src/constants/data'

const TOTAL_STEPS = 5

type ConditionValue = typeof ONBOARDING_CONDITIONS[number]['value']
type GoalValue      = typeof HEALTH_GOALS[number]['value']
const HEALTH_GOAL_VALUES = HEALTH_GOALS.map(item => item.value) as readonly string[]

function isGoalValue(value: unknown): value is GoalValue {
  return typeof value === 'string' && HEALTH_GOAL_VALUES.includes(value)
}

function displayNameFromUser(user: NonNullable<ReturnType<typeof useSession>['user']>) {
  const metadata = user.user_metadata as Record<string, unknown> | undefined
  const fullName = metadata?.full_name ?? metadata?.name

  if (typeof fullName === 'string' && fullName.trim()) {
    return fullName.trim()
  }

  return user.email?.split('@')[0] || 'مستخدم زاد'
}

export default function OnboardingScreen() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const { user, accessToken } = useSession()
  const isDemoMode = useAuthStore(s => s.isDemoMode)
  const { profile, isLoading: profileLoading, loadProfile } = useProfileStore()

  const [step, setStep]     = useState<1|2|3|4|5>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  // Step 1 — conditions
  const [conditions, setConditions] = useState<ConditionValue[]>([])

  // Step 2 — basic info
  const [gender, setGender]   = useState<'male' | 'female' | ''>('')
  const [age, setAge]         = useState('')
  const [height, setHeight]   = useState('')
  const [weight, setWeight]   = useState('')
  const [city, setCity]       = useState('')
  const [goal, setGoal]       = useState<GoalValue | ''>('')

  // Step 3 — lab upload
  const [labFile, setLabFile]           = useState<{ uri: string; name: string; type: string } | null>(null)
  const [labUploading, setLabUploading] = useState(false)
  const [labDone, setLabDone]           = useState(false)

  // Step 4 — preferences
  const [cuisines, setCuisines]   = useState<string[]>([])
  const [allergies, setAllergies] = useState<string[]>([])

  const bmi     = height && weight ? calcBMI(parseFloat(weight), parseFloat(height)) : null
  const bmiInfo = bmi ? bmiCategory(bmi) : null
  const dailyTargets = useMemo(() => {
    return calculateDailyTargets({
      age: parseFloat(age) || undefined,
      gender: gender || undefined,
      heightCm: parseFloat(height) || undefined,
      weightKg: parseFloat(weight) || undefined,
      goal: goal || undefined,
      activityLevel: 'light',
    })
  }, [age, gender, goal, height, weight])

  useEffect(() => {
    if (!user?.id || profileLoading || !profile) return

    setGender(profile.gender ?? '')
    setAge(profile.age ? String(profile.age) : '')
    setHeight(profile.heightCm ? String(profile.heightCm) : '')
    setWeight(profile.weightKg ? String(profile.weightKg) : '')
    setCity(profile.city ?? '')
    setGoal(isGoalValue(profile.goal) ? profile.goal : '')
  }, [profile, profileLoading, user?.id])

  // Navigation
  function goNext() {
    setError(null)
    if (step === 2) {
      if (!age || !gender || !height || !weight || !goal) {
        setError('الرجاء تعبئة جميع الحقول المطلوبة')
        return
      }
    }
    setStep(s => Math.min(s + 1, TOTAL_STEPS) as 1|2|3|4|5)
  }

  function goBack() {
    setError(null)
    setStep(s => Math.max(s - 1, 1) as 1|2|3|4|5)
  }

  // Lab upload
  async function pickLabFile() {
    Alert.alert('إضافة تحليل', 'اختر طريقة الرفع', [
      {
        text: 'تصوير',
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.85 })
          if (!result.canceled && result.assets[0]) {
            setLabFile({ uri: result.assets[0].uri, name: `lab-${Date.now()}.jpg`, type: 'image/jpeg' })
            setLabDone(false)
          }
        },
      },
      {
        text: 'مكتبة الصور',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.85 })
          if (!result.canceled && result.assets[0]) {
            setLabFile({ uri: result.assets[0].uri, name: `lab-${Date.now()}.jpg`, type: 'image/jpeg' })
            setLabDone(false)
          }
        },
      },
      {
        text: 'ملف PDF',
        onPress: async () => {
          const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true })
          if (!result.canceled && result.assets[0]) {
            setLabFile({ uri: result.assets[0].uri, name: result.assets[0].name, type: result.assets[0].mimeType ?? 'application/pdf' })
            setLabDone(false)
          }
        },
      },
      { text: 'إلغاء', style: 'cancel' },
    ])
  }

  async function uploadLab() {
    if (!labFile || !accessToken) return
    setLabUploading(true)
    try {
      await uploadAndAnalyzeReport({ ...labFile, fileName: labFile.name, mimeType: labFile.type, accessToken })
      setLabDone(true)
    } catch {
      setError('تعذر تحليل الملف — يمكنك إضافته لاحقاً من قسم التحاليل')
    } finally {
      setLabUploading(false)
    }
  }

  // Submit
  async function saveOnboardingToSupabase() {
    if (!user?.id) throw new Error('سجّل الدخول مرة أخرى لحفظ ملفك الصحي.')

    const now = new Date().toISOString()
    const fullName = displayNameFromUser(user)
    const profileRow = {
      user_id: user.id,
      full_name: fullName,
      age: parseInt(age),
      gender,
      height_cm: parseFloat(height),
      weight_kg: parseFloat(weight),
      city: city.trim() || null,
      goal,
      activity_level: 'light',
      updated_at: now,
    }

    const { data: existingProfile, error: profileSelectError } = await supabase
      .from('health_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (profileSelectError) throw profileSelectError

    if (existingProfile?.id) {
      const { error } = await supabase
        .from('health_profiles')
        .update(profileRow)
        .eq('id', existingProfile.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('health_profiles')
        .insert({ ...profileRow, created_at: now })
      if (error) throw error
    }

    const { error: deleteConditionsError } = await supabase
      .from('medical_conditions')
      .delete()
      .eq('user_id', user.id)
    if (deleteConditionsError) throw deleteConditionsError

    if (conditions.length > 0) {
      const { error } = await supabase
        .from('medical_conditions')
        .insert(conditions.map(condition => ({
          user_id: user.id,
          condition,
          severity: 'mild',
        })))
      if (error) throw error
    }

    const preferencesRow = {
      user_id: user.id,
      cuisine_types: cuisines,
      allergies,
      updated_at: now,
    }

    const { data: existingPrefs, error: prefsSelectError } = await supabase
      .from('food_preferences')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (prefsSelectError) throw prefsSelectError

    if (existingPrefs?.id) {
      const { error } = await supabase
        .from('food_preferences')
        .update(preferencesRow)
        .eq('id', existingPrefs.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('food_preferences')
        .insert(preferencesRow)
      if (error) throw error
    }
  }

  async function handleComplete() {
    if (!accessToken || !user?.id) return
    setLoading(true)
    setError(null)
    try {
      if (HAS_REMOTE_API) {
        await apiFetch(
          API_ROUTES.profileSetup,
          {
            method: 'POST',
            body: JSON.stringify({
              profile: {
                age:       parseInt(age),
                gender,
                height_cm: parseFloat(height),
                weight_kg: parseFloat(weight),
                city:      city.trim() || undefined,
                goal,
              },
              conditions,
              preferences: { cuisine_types: cuisines, allergies },
            }),
          },
          accessToken,
        )
      } else {
        await saveOnboardingToSupabase()
      }
      await loadProfile(user.id)
      router.replace('/(tabs)')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ، الرجاء المحاولة مجدداً')
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: Spacing.md, paddingBottom: insets.bottom + Spacing['2xl'] },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header bar: back + close ── */}
        <View style={[styles.navBar, { paddingTop: insets.top }]}>
          {/* Back: go to previous step or home if step 1 */}
          <TouchableOpacity
            style={styles.navBtn}
            onPress={step === 1 ? () => router.replace('/(tabs)') : goBack}
          >
            <Feather name={step === 1 ? 'home' : 'arrow-right'} size={20} color={Colors.primary} />
          </TouchableOpacity>

          <Text style={styles.navTitle}>إعداد ملفك الصحي</Text>

          {/* Close (skip) — only in demo mode or if authenticated already */}
          {(isDemoMode || !!accessToken) && (
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => router.replace('/(tabs)')}
            >
              <Feather name="x" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
          {!isDemoMode && !accessToken && <View style={{ width: 44 }} />}
        </View>

        {/* ── Progress ── */}
        <View style={styles.logoSection}>
          <Text style={styles.stepCount}>خطوة {step} من {TOTAL_STEPS}</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <View
              key={i}
              style={[
                styles.progressSegment,
                { backgroundColor: i < step ? Colors.primary : Colors.border },
              ]}
            />
          ))}
        </View>

        {step === 1 && (
          <PageIntroCard
            {...ZAAD_PAGE_CONTENT.onboarding}
            icon="clipboard"
          />
        )}

        {/* Error */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* ════ STEP 1 — CONDITIONS ════ */}
        {step === 1 && (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle}>ما الحالة التي تودّ إدارتها؟</Text>
            <Text style={styles.stepSubtitle}>يمكنك اختيار أكثر من حالة</Text>

            {ONBOARDING_CONDITIONS.map(({ value, labelAr }) => {
              const selected = conditions.includes(value)
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => setConditions(toggleArrayItem(conditions, value))}
                  style={[styles.conditionBtn, selected && styles.conditionBtnSelected]}
                >
                  <Text style={[styles.conditionLabel, selected && styles.conditionLabelSelected]}>
                    {labelAr}
                  </Text>
                  {selected && (
                    <Feather name="check" size={16} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )
            })}

            {conditions.includes('ibs') && (
              <View style={styles.fodmapNote} accessibilityRole="summary">
                <Feather name="info" size={18} color={Colors.primary} />
                <View style={styles.fodmapCopy}>
                  <Text style={styles.fodmapTitle}>ما هو FODMAP؟</Text>
                  <Text style={styles.fodmapText}>
                    FODMAP stands for Fermentable Oligosaccharides, Disaccharides,
                    Monosaccharides, and Polyols. They are short-chain carbohydrates
                    and sugar alcohols that the small intestine absorbs poorly. When
                    fermented by gut bacteria, they can cause bloating, gas, and pain.
                  </Text>
                </View>
              </View>
            )}

            <ZaadButton
              labelAr={conditions.length === 0 ? 'تخطّي' : 'التالي'}
              onPress={goNext}
            />
          </View>
        )}

        {/* ════ STEP 2 — BASIC INFO ════ */}
        {step === 2 && (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle}>معلوماتك الأساسية</Text>

            {/* Gender */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>الجنس</Text>
              <View style={styles.genderRow}>
                {(['male', 'female'] as const).map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderBtn, gender === g && styles.genderBtnSelected]}
                    onPress={() => setGender(g)}
                  >
                    <Text style={[styles.genderText, gender === g && styles.genderTextSelected]}>
                      {g === 'male' ? 'ذكر' : 'أنثى'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Age */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>العمر</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="35"
                placeholderTextColor={Colors.textDisabled}
                keyboardType="number-pad"
                textAlign="right"
              />
            </View>

            {/* Height + Weight */}
            <View style={styles.twoColRow}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>الطول (سم)</Text>
                <TextInput
                  style={styles.input}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="170"
                  placeholderTextColor={Colors.textDisabled}
                  keyboardType="decimal-pad"
                  textAlign="right"
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>الوزن (كغ)</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="75"
                  placeholderTextColor={Colors.textDisabled}
                  keyboardType="decimal-pad"
                  textAlign="right"
                />
              </View>
            </View>

            {/* Live BMI */}
            {bmi && bmiInfo && (
              <View style={[styles.bmiBanner, { borderColor: `${bmiInfo.color}40`, backgroundColor: `${bmiInfo.color}12` }]}>
                <Text style={[styles.bmiText, { color: bmiInfo.color }]}>
                  {bmiInfo.labelAr}
                </Text>
                <Text style={styles.bmiNum}>BMI: {bmi}</Text>
              </View>
            )}

            {/* City */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>المدينة (اختياري)</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="الرياض"
                placeholderTextColor={Colors.textDisabled}
                textAlign="right"
              />
            </View>

            {/* Goal */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>الهدف الصحي الرئيسي</Text>
              <View style={styles.goalGrid}>
                {HEALTH_GOALS.map(g => (
                  <TouchableOpacity
                    key={g.value}
                    style={[styles.goalBtn, goal === g.value && styles.goalBtnSelected]}
                    onPress={() => setGoal(g.value)}
                  >
                    <Text style={[styles.goalText, goal === g.value && styles.goalTextSelected]}>
                      {g.labelAr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.navRow}>
              <ZaadButton labelAr="رجوع"  onPress={goBack} variant="ghost" fullWidth={false} />
              <ZaadButton labelAr="التالي" onPress={goNext} fullWidth={false} />
            </View>
          </View>
        )}

        {/* ════ STEP 3 — LAB UPLOAD (OPTIONAL) ════ */}
        {step === 3 && (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle}>هل عندك تحليل مخبري؟</Text>
            <Text style={styles.stepSubtitle}>
              رفع تحليلك يجعل خطتك الغذائية أدق — يمكنك إضافته لاحقاً
            </Text>

            {labDone ? (
              <View style={styles.labSuccess}>
                <Feather name="check-circle" size={40} color={Colors.primary} />
                <Text style={styles.labSuccessTitle}>تم تحليل تقريرك بنجاح</Text>
                <Text style={styles.labSuccessSubtitle}>سيُستخدم لتخصيص خطتك الغذائية</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.labPickerBtn, labFile && styles.labPickerBtnSelected]}
                  onPress={pickLabFile}
                >
                  <Feather name="camera" size={24} color={labFile ? Colors.primary : Colors.textMuted} />
                  <View style={styles.labPickerText}>
                    <Text style={[styles.labPickerTitle, labFile && { color: Colors.primary }]}>
                      {labFile ? labFile.name : 'التقط صورة أو اختر ملفاً'}
                    </Text>
                    <Text style={styles.labPickerHint}>PDF أو صورة — حد أقصى 10MB</Text>
                  </View>
                  {labFile && <Text style={styles.changeText}>تغيير</Text>}
                </TouchableOpacity>

                {labFile && (
                  <TouchableOpacity
                    style={styles.analyzeBtn}
                    onPress={uploadLab}
                    disabled={labUploading}
                  >
                    {labUploading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.analyzeBtnText}>تحليل التقرير</Text>
                    )}
                  </TouchableOpacity>
                )}
              </>
            )}

            <View style={styles.navRow}>
              <ZaadButton labelAr="رجوع"                   onPress={goBack} variant="ghost" fullWidth={false} />
              <ZaadButton labelAr={labDone ? 'التالي' : 'تخطّي الآن'} onPress={goNext} fullWidth={false} />
            </View>
          </View>
        )}

        {/* ════ STEP 4 — FOOD PREFERENCES ════ */}
        {step === 4 && (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle}>تفضيلات الطعام</Text>
            <Text style={styles.stepSubtitle}>آخر خطوة — سنستخدمها لتخصيص وصفاتك</Text>

            {/* Cuisines */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>المطبخ المفضل</Text>
              <View style={styles.chipGrid}>
                {CUISINE_TYPES.map(({ value, labelAr }) => {
                  const selected = cuisines.includes(value)
                  return (
                    <TouchableOpacity
                      key={value}
                      style={[styles.prefChip, selected && styles.prefChipSelected]}
                      onPress={() => setCuisines(toggleArrayItem(cuisines, value))}
                    >
                      {selected && <Feather name="check" size={12} color={Colors.primary} />}
                      <Text style={[styles.prefChipText, selected && styles.prefChipTextSelected]}>
                        {labelAr}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>

            {/* Allergies */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>الحساسية الغذائية</Text>
              <View style={styles.chipGrid}>
                {FOOD_ALLERGIES.map(({ value, labelAr }) => {
                  const selected = allergies.includes(value)
                  return (
                    <TouchableOpacity
                      key={value}
                      style={[styles.allergyChip, selected && styles.allergyChipSelected]}
                      onPress={() => setAllergies(toggleArrayItem(allergies, value))}
                    >
                      {selected && <Feather name="x" size={12} color={Colors.risk.text} />}
                      <Text style={[styles.allergyText, selected && styles.allergyTextSelected]}>
                        {labelAr}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>

            <View style={styles.navRow}>
              <ZaadButton labelAr="رجوع" onPress={goBack} variant="ghost" fullWidth={false} />
              <ZaadButton labelAr="بناء خطتي" onPress={goNext} fullWidth={false} />
            </View>
          </View>
        )}

        {/* ════ STEP 5 — DAILY TARGET PREVIEW ════ */}
        {step === 5 && (
          <View style={styles.targetStep}>
            <Text style={styles.stepTitle}>هدفك الغذائي اليومي</Text>
            <Text style={styles.stepSubtitle}>
              نقطة بداية محسوبة من بياناتك، ويمكن تعديلها لاحقًا
            </Text>

            <View style={styles.calorieCircle}>
              <Text style={styles.calorieValue}>{dailyTargets.calories.toLocaleString('ar-SA')}</Text>
              <Text style={styles.calorieUnit}>سعرة حرارية</Text>
            </View>

            <View style={styles.macroTargets}>
              <View style={[styles.macroTarget, { backgroundColor: Colors.protein.bg }]}>
                <Text style={[styles.macroValue, { color: Colors.protein.text }]}>
                  {dailyTargets.protein}غ
                </Text>
                <Text style={styles.macroLabel}>بروتين</Text>
              </View>
              <View style={[styles.macroTarget, { backgroundColor: Colors.carbs.bg }]}>
                <Text style={[styles.macroValue, { color: Colors.carbs.text }]}>
                  {dailyTargets.carbs}غ
                </Text>
                <Text style={styles.macroLabel}>كربوهيدرات</Text>
              </View>
              <View style={[styles.macroTarget, { backgroundColor: Colors.fat.bg }]}>
                <Text style={[styles.macroValue, { color: Colors.fat.text }]}>
                  {dailyTargets.fat}غ
                </Text>
                <Text style={styles.macroLabel}>دهون</Text>
              </View>
            </View>

            <View style={styles.targetNote}>
              <Feather name="info" size={16} color={Colors.primary} />
              <Text style={styles.targetNoteText}>
                يعتمد الهدف على العمر والطول والوزن والجنس والهدف الصحي، ويُراجع مع تقدمك.
              </Text>
            </View>

            <View style={styles.navRow}>
              <ZaadButton labelAr="رجوع" onPress={goBack} variant="ghost" fullWidth={false} />
              <ZaadButton
                labelAr="اعتماد الخطة"
                onPress={handleComplete}
                loading={loading}
                fullWidth={false}
                icon={<Feather name="check" size={18} color={Colors.surface} />}
              />
            </View>
          </View>
        )}

        <Text style={styles.reassurance}>
          بياناتك محمية ومشفرة · يمكن تعديل كل شيء لاحقاً
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
    gap: Spacing.md,
  },

  logoSection: { alignItems: 'center', gap: 4 },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoChar: { color: '#fff', fontSize: 28, fontFamily: 'IBMPlexArabic-Bold' },
  pageTitle: {
    fontSize: Typography.size.xl,
    fontFamily: 'IBMPlexArabic-Bold',
    color: Colors.textPrimary,
  },
  stepCount: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    fontFamily: 'IBMPlexArabic-Regular',
  },

  progressBar: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: Radius.full,
  },

  errorBanner: {
    width: '100%',
    backgroundColor: Colors.risk.bg,
    borderWidth: 1,
    borderColor: Colors.risk.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  errorText: {
    color: Colors.risk.text,
    fontSize: Typography.size.sm,
    fontFamily: 'IBMPlexArabic-Regular',
    textAlign: 'right',
  },

  stepCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  stepTitle: {
    fontSize: Typography.size.xl,
    fontFamily: 'IBMPlexArabic-Bold',
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  stepSubtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    fontFamily: 'IBMPlexArabic-Regular',
    textAlign: 'right',
    marginTop: -Spacing.sm,
  },

  conditionBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 48,
  },
  conditionBtnSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  conditionLabel: {
    fontSize: Typography.size.sm,
    fontFamily: 'IBMPlexArabic-Medium',
    color: Colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  conditionLabelSelected: { color: Colors.primary },

  fodmapNote: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
  },
  fodmapCopy: { flex: 1, gap: 4 },
  fodmapTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.size.sm,
    fontFamily: 'IBMPlexArabic-Bold',
    textAlign: 'right',
  },
  fodmapText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    lineHeight: 20,
    fontFamily: 'IBMPlexArabic-Regular',
    textAlign: 'right',
  },

  fieldGroup: { gap: 6 },
  fieldLabel: {
    fontSize: Typography.size.sm,
    fontFamily: 'IBMPlexArabic-Medium',
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.size.base,
    fontFamily: 'IBMPlexArabic-Regular',
    color: Colors.textPrimary,
    minHeight: 44,
  },
  twoColRow: {
    flexDirection: 'row-reverse',
    gap: Spacing.md,
  },

  genderRow: { flexDirection: 'row-reverse', gap: Spacing.sm },
  genderBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    minHeight: 44,
  },
  genderBtnSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  genderText:         { fontSize: Typography.size.sm, fontFamily: 'IBMPlexArabic-Medium', color: Colors.textSecondary },
  genderTextSelected: { color: Colors.primary },

  bmiBanner: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  bmiText: { fontSize: Typography.size.sm, fontFamily: 'IBMPlexArabic-SemiBold' },
  bmiNum:  { fontSize: Typography.size.sm, fontFamily: 'IBMPlexArabic-Bold', color: Colors.textPrimary },

  goalGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  goalBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 44,
    justifyContent: 'center',
  },
  goalBtnSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  goalText:         { fontSize: Typography.size.sm, fontFamily: 'IBMPlexArabic-Medium', color: Colors.textSecondary },
  goalTextSelected: { color: Colors.primary },

  labPickerBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 72,
  },
  labPickerBtnSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  labPickerText: { flex: 1, gap: 2 },
  labPickerTitle: {
    fontSize: Typography.size.sm,
    fontFamily: 'IBMPlexArabic-Medium',
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  labPickerHint: {
    fontSize: Typography.size.xs,
    color: Colors.textSubtle,
    fontFamily: 'IBMPlexArabic-Regular',
    textAlign: 'right',
  },
  changeText: {
    fontSize: Typography.size.xs,
    color: Colors.primary,
    fontFamily: 'IBMPlexArabic-Medium',
  },
  analyzeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  analyzeBtnText: {
    color: '#fff',
    fontSize: Typography.size.base,
    fontFamily: 'IBMPlexArabic-SemiBold',
  },
  labSuccess: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  labSuccessTitle: {
    fontSize: Typography.size.base,
    fontFamily: 'IBMPlexArabic-Bold',
    color: Colors.textPrimary,
  },
  labSuccessSubtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    fontFamily: 'IBMPlexArabic-Regular',
  },

  chipGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  prefChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 44,
  },
  prefChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  prefChipText:         { fontSize: Typography.size.sm, fontFamily: 'IBMPlexArabic-Medium', color: Colors.textSecondary },
  prefChipTextSelected: { color: Colors.primary },

  allergyChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 44,
  },
  allergyChipSelected: {
    borderColor: Colors.risk.border,
    backgroundColor: Colors.risk.bg,
  },
  allergyText:         { fontSize: Typography.size.sm, fontFamily: 'IBMPlexArabic-Medium', color: Colors.textSecondary },
  allergyTextSelected: { color: Colors.risk.text },

  navRow: {
    flexDirection: 'row-reverse',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },

  navBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingBottom: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  navBtn: {
    width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
  },
  navTitle: {
    fontSize: Typography.size.base,
    fontFamily: 'IBMPlexArabic-Bold',
    color: Colors.textPrimary,
  },
  targetStep: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  calorieCircle: {
    width: 190,
    height: 190,
    borderRadius: 95,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 10,
    borderColor: Colors.limeSoft,
    shadowColor: Colors.burgundy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  calorieValue: {
    fontSize: Typography.size['4xl'],
    lineHeight: 42,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.burgundy,
  },
  calorieUnit: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
  },
  macroTargets: {
    width: '100%',
    flexDirection: 'row-reverse',
    gap: Spacing.sm,
  },
  macroTarget: {
    flex: 1,
    minHeight: 92,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  macroValue: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.fontFamily.bold,
  },
  macroLabel: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  targetNote: {
    width: '100%',
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryLight,
  },
  targetNoteText: {
    flex: 1,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.7,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'right',
  },

  reassurance: {
    fontSize: Typography.size.xs,
    color: Colors.textSubtle,
    fontFamily: 'IBMPlexArabic-Regular',
    textAlign: 'center',
  },
})

import { useState } from 'react'
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { type Href, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AppHeader } from '../src/components/ui/AppHeader'
import { ZaadButton } from '../src/components/ui/ZaadButton'
import { DIET_TYPES, type DietType } from '../src/constants/diets'
import { Colors, Radius, Spacing, Typography } from '../src/constants/theme'
import { API_ROUTES, HAS_REMOTE_API, apiFetch } from '../src/lib/api/config'
import { saveDietAndGenerateLocalPlan } from '../src/lib/meals/localPlan'
import { supabase } from '../src/lib/supabase/client'
import { useAuthStore } from '../src/store/auth'
import { useProfileStore } from '../src/store/profile'

function todayDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function DietScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const session = useAuthStore(state => state.session)
  const user = useAuthStore(state => state.user)
  const setSession = useAuthStore(state => state.setSession)
  const preferences = useProfileStore(state => state.preferences)
  const profile = useProfileStore(state => state.profile)
  const loadProfile = useProfileStore(state => state.loadProfile)
  const [selected, setSelected] = useState<DietType>(
    (preferences?.dietType as DietType | undefined) ?? 'balanced',
  )
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function saveAndBuild() {
    if (!user?.id || !session?.access_token) {
      const message = 'سجّل الدخول مرة أخرى لحفظ نمط الحمية.'
      setErrorMessage(message)
      Alert.alert('تعذر الحفظ', message)
      return
    }

    setSaving(true)
    setErrorMessage('')
    try {
      const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession()
      if (refreshError || !refreshed.session?.access_token) {
        throw new Error('انتهت الجلسة. سجّل الدخول مرة أخرى ثم أعد المحاولة.')
      }
      setSession(refreshed.session)
      const accessToken = refreshed.session.access_token

      const date = todayDate()
      if (HAS_REMOTE_API) {
        await apiFetch(
          API_ROUTES.preferencesDiet,
          {
            method: 'PUT',
            body: JSON.stringify({ diet_type: selected }),
          },
          accessToken,
        )
        await apiFetch(
          API_ROUTES.mealsGenerate,
          {
            method: 'POST',
            body: JSON.stringify({ date, diet_type: selected }),
          },
          accessToken,
        )
      } else {
        await saveDietAndGenerateLocalPlan({
          userId: user.id,
          date,
          dietType: selected,
          profile,
        })
      }
      await loadProfile(user.id)
      router.replace('/schedule' as Href)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'حاول مرة أخرى.'
      setErrorMessage(message)
      Alert.alert('تعذر بناء الخطة', message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <AppHeader titleAr="نمط الحمية" showBack />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing['2xl'] }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.title}>اختر النظام الأقرب لك</Text>
          <Text style={styles.subtitle}>
            سنبني الوجبات وفق الحمية والهدف والحالة الصحية والحساسيات المسجلة.
          </Text>
        </View>

        <View style={styles.list} accessibilityRole="radiogroup">
          {DIET_TYPES.map(diet => {
            const checked = selected === diet.id
            return (
              <TouchableOpacity
                key={diet.id}
                style={[styles.option, checked && styles.optionSelected]}
                onPress={() => setSelected(diet.id)}
                accessibilityRole="radio"
                accessibilityState={{ checked }}
                accessibilityLabel={`حمية ${diet.label}`}
              >
                <View style={[styles.radio, checked && styles.radioSelected]}>
                  {checked && <Feather name="check" size={15} color={Colors.surface} />}
                </View>
                <View style={styles.copy}>
                  <Text style={[styles.label, checked && styles.labelSelected]}>{diet.label}</Text>
                  <Text style={styles.description}>{diet.description}</Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={styles.notice}>
          <Feather name="shield" size={18} color={Colors.primary} />
          <Text style={styles.noticeText}>
            تُقدّم الخطة إرشادًا غذائيًا عامًا، والحميات العلاجية تحتاج متابعة مختص.
          </Text>
        </View>

        {!!errorMessage && (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={17} color={Colors.risk.text} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <ZaadButton
          labelAr={saving ? 'جاري بناء الخطة...' : 'اعتماد الحمية وبناء الخطة'}
          onPress={saveAndBuild}
          disabled={saving}
          fullWidth
        />
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base },
  intro: { alignItems: 'flex-end', marginBottom: Spacing.lg },
  title: {
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size['2xl'],
    textAlign: 'right',
  },
  subtitle: {
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    lineHeight: 23,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  list: { gap: Spacing.sm },
  option: {
    minHeight: 78,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
  },
  optionSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  radio: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  copy: { flex: 1, alignItems: 'flex-end' },
  label: {
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    textAlign: 'right',
  },
  labelSelected: { color: Colors.primary },
  description: {
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    textAlign: 'right',
    marginTop: 3,
  },
  notice: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    marginVertical: Spacing.lg,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.sm,
  },
  noticeText: {
    flex: 1,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    lineHeight: 20,
    textAlign: 'right',
  },
  errorBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.risk.bg,
    borderWidth: 1,
    borderColor: Colors.risk.border,
    borderRadius: Radius.sm,
  },
  errorText: {
    flex: 1,
    color: Colors.risk.text,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    textAlign: 'right',
  },
})

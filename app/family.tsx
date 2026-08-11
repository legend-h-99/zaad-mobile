import { useMemo, useState } from 'react'
import {
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AppHeader } from '../src/components/ui/AppHeader'
import { ZaadButton } from '../src/components/ui/ZaadButton'
import { ZaadCard } from '../src/components/ui/ZaadCard'
import { REFERENCE_RECIPES } from '../src/constants/recipeData'
import { getPlanForDate } from '../src/constants/mealSchedule'
import { Colors, Radius, Spacing, Typography } from '../src/constants/theme'
import { useProfileStore } from '../src/store/profile'

const MEALS = [
  { key: 'breakfast', label: 'الفطور' },
  { key: 'lunch', label: 'الغداء' },
  { key: 'dinner', label: 'العشاء' },
  { key: 'snack', label: 'السناك' },
] as const

export default function FamilyShareScreen() {
  const insets = useSafeAreaInsets()
  const profile = useProfileStore(s => s.profile)
  const [recipient, setRecipient] = useState('العائلة')
  const [selected, setSelected] = useState<string[]>(MEALS.map(meal => meal.key))
  const todayPlan = useMemo(() => getPlanForDate(new Date()), [])

  const message = useMemo(() => {
    const lines = MEALS
      .filter(meal => selected.includes(meal.key))
      .map(meal => {
        const recipe = REFERENCE_RECIPES.find(item => item.id === todayPlan[meal.key])
        return `${meal.label}: ${recipe?.nameAr ?? ''}`
      })
    return [
      `مرحبًا ${recipient.trim() || 'بكم'}،`,
      `هذه خطة زاد اليومية لـ ${profile?.fullName ?? 'المستخدم'}:`,
      '',
      ...lines,
      '',
      'شكرًا لمساعدتكم في تجهيز وجبات مناسبة.',
    ].join('\n')
  }, [profile?.fullName, recipient, selected, todayPlan])

  function toggleMeal(key: string) {
    setSelected(current =>
      current.includes(key)
        ? current.filter(item => item !== key)
        : [...current, key],
    )
  }

  async function sharePlan() {
    if (Platform.OS === 'web') {
      await Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`)
      return
    }
    await Share.share({ message, title: 'خطة زاد للعائلة' })
  }

  return (
    <>
      <AppHeader titleAr="مشاركة العائلة" showBack />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing['2xl'] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <View style={styles.icon}>
            <Feather name="users" size={25} color={Colors.burgundy} />
          </View>
          <Text style={styles.title}>أرسل الخطة لمن يطبخ لك</Text>
          <Text style={styles.subtitle}>رسالة واضحة بالوجبات المختارة لهذا اليوم.</Text>
        </View>

        <ZaadCard style={styles.setupCard}>
          <Text style={styles.label}>اسم المستلم</Text>
          <TextInput
            value={recipient}
            onChangeText={setRecipient}
            style={styles.input}
            placeholder="مثال: أمي"
            placeholderTextColor={Colors.textDisabled}
            textAlign="right"
          />

          <Text style={styles.label}>الوجبات المرسلة</Text>
          <View style={styles.mealChoices}>
            {MEALS.map(meal => {
              const checked = selected.includes(meal.key)
              return (
                <TouchableOpacity
                  key={meal.key}
                  style={[styles.mealChoice, checked && styles.mealChoiceSelected]}
                  onPress={() => toggleMeal(meal.key)}
                >
                  <Feather
                    name={checked ? 'check-circle' : 'circle'}
                    size={17}
                    color={checked ? Colors.primary : Colors.textSubtle}
                  />
                  <Text style={[styles.mealChoiceText, checked && styles.mealChoiceTextSelected]}>
                    {meal.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </ZaadCard>

        <View style={styles.previewHead}>
          <Text style={styles.previewTitle}>معاينة الرسالة</Text>
          <Text style={styles.previewHint}>{selected.length} وجبات</Text>
        </View>
        <ZaadCard style={styles.previewCard}>
          <Text style={styles.previewText}>{message}</Text>
        </ZaadCard>

        <ZaadButton
          labelAr="مشاركة الخطة"
          onPress={sharePlan}
          disabled={selected.length === 0}
          icon={<Feather name="share-2" size={18} color={Colors.surface} />}
        />
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, gap: Spacing.base },
  intro: { alignItems: 'center', gap: 4, paddingVertical: Spacing.sm },
  icon: {
    width: 58,
    height: 58,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lime,
  },
  title: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.burgundy,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  setupCard: { gap: Spacing.md },
  label: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  input: {
    minHeight: 50,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceAlt,
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  mealChoices: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: Spacing.sm },
  mealChoice: {
    minHeight: 44,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mealChoiceSelected: {
    backgroundColor: Colors.limeSoft,
    borderColor: Colors.lime,
  },
  mealChoiceText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
  },
  mealChoiceTextSelected: { color: Colors.primary },
  previewHead: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: Spacing.xs,
  },
  previewTitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  previewHint: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
  },
  previewCard: { backgroundColor: Colors.limeSoft },
  previewText: {
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.9,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
})

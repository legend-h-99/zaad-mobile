import { useEffect, useState } from 'react'
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as SecureStore from 'expo-secure-store'

import { AppHeader } from '../src/components/ui/AppHeader'
import { ZaadButton } from '../src/components/ui/ZaadButton'
import { ZaadCard } from '../src/components/ui/ZaadCard'
import { Colors, Radius, Spacing, Typography } from '../src/constants/theme'

const STORAGE_KEY = 'zaad_notification_preferences'

interface NotificationPreferences {
  meals: boolean
  measurements: boolean
  water: boolean
  reports: boolean
  weeklyDigest: boolean
  reminderTime: 'morning' | 'afternoon' | 'evening'
}

const DEFAULTS: NotificationPreferences = {
  meals: true,
  measurements: true,
  water: false,
  reports: true,
  weeklyDigest: true,
  reminderTime: 'morning',
}

const OPTIONS: {
  key: keyof Pick<NotificationPreferences, 'meals' | 'measurements' | 'water' | 'reports' | 'weeklyDigest'>
  icon: React.ComponentProps<typeof Feather>['name']
  label: string
  subtitle: string
}[] = [
  { key: 'meals', icon: 'coffee', label: 'تذكير الوجبات', subtitle: 'قبل أوقات الوجبات الأساسية' },
  { key: 'measurements', icon: 'activity', label: 'القياسات اليومية', subtitle: 'الوزن والسكر والضغط حسب ملفك' },
  { key: 'water', icon: 'droplet', label: 'شرب الماء', subtitle: 'تذكير هادئ خلال اليوم' },
  { key: 'reports', icon: 'file-text', label: 'نتائج التحاليل', subtitle: 'عند اكتمال قراءة تقرير جديد' },
  { key: 'weeklyDigest', icon: 'bar-chart-2', label: 'الملخص الأسبوعي', subtitle: 'ملخص التزامك وتقدمك كل أسبوع' },
]

const TIMES: { value: NotificationPreferences['reminderTime']; label: string; time: string }[] = [
  { value: 'morning', label: 'صباحًا', time: '٨:٠٠' },
  { value: 'afternoon', label: 'ظهرًا', time: '١:٠٠' },
  { value: 'evening', label: 'مساءً', time: '٧:٠٠' },
]

async function readPreferences() {
  const value = Platform.OS === 'web'
    ? globalThis.localStorage?.getItem(STORAGE_KEY)
    : await SecureStore.getItemAsync(STORAGE_KEY)
  if (!value) return DEFAULTS
  try {
    return { ...DEFAULTS, ...JSON.parse(value) } as NotificationPreferences
  } catch {
    return DEFAULTS
  }
}

async function writePreferences(value: NotificationPreferences) {
  const serialized = JSON.stringify(value)
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(STORAGE_KEY, serialized)
    return
  }
  await SecureStore.setItemAsync(STORAGE_KEY, serialized)
}

export default function NotificationsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [preferences, setPreferences] = useState(DEFAULTS)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    readPreferences().then(setPreferences).catch(() => {})
  }, [])

  function toggle(key: typeof OPTIONS[number]['key']) {
    setPreferences(current => ({ ...current, [key]: !current[key] }))
  }

  async function save() {
    setSaving(true)
    try {
      await writePreferences(preferences)
      Alert.alert('تم حفظ التفضيلات محليًا', 'حُفظت تفضيلاتك على هذا الجهاز فقط. إرسال التنبيهات غير متاح حاليًا.')
      router.back()
    } catch {
      Alert.alert('تعذر الحفظ', 'حاول مرة أخرى.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <AppHeader titleAr="التنبيهات" showBack />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing['2xl'] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <View style={styles.bell}>
            <Feather name="bell" size={25} color={Colors.burgundy} />
          </View>
          <Text style={styles.title}>تنبيهات تساعدك بدون إزعاج</Text>
          <Text style={styles.subtitle}>هذه تفضيلات محلية فقط. إرسال التنبيهات غير متاح حاليًا.</Text>
        </View>

        <ZaadCard style={styles.optionsCard} padding="none">
          {OPTIONS.map((option, index) => (
            <View
              key={option.key}
              style={[styles.optionRow, index > 0 && styles.divider]}
            >
              <View style={styles.optionIcon}>
                <Feather name={option.icon} size={19} color={Colors.primary} />
              </View>
              <View style={styles.optionCopy}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <Switch
                value={preferences[option.key]}
                onValueChange={() => toggle(option.key)}
                trackColor={{ false: Colors.border, true: Colors.lime }}
                thumbColor={preferences[option.key] ? Colors.primary : Colors.surface}
                accessibilityLabel={option.label}
              />
            </View>
          ))}
        </ZaadCard>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>وقت التذكير الرئيسي</Text>
          <Text style={styles.sectionHint}>يمكن تغييره لاحقًا</Text>
        </View>
        <View style={styles.timeSelector}>
          {TIMES.map(item => {
            const selected = preferences.reminderTime === item.value
            return (
              <TouchableOpacity
                key={item.value}
                style={[styles.timeOption, selected && styles.timeOptionSelected]}
                onPress={() => setPreferences(current => ({
                  ...current,
                  reminderTime: item.value,
                }))}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
              >
                <Text style={[styles.timeValue, selected && styles.timeTextSelected]}>
                  {item.time}
                </Text>
                <Text style={[styles.timeLabel, selected && styles.timeTextSelected]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={styles.privacyNote}>
          <Feather name="moon" size={17} color={Colors.primary} />
          <Text style={styles.privacyText}>
            يتوقف زاد عن التنبيه ليلًا، ولا يعرض تفاصيل صحية حساسة على شاشة القفل.
          </Text>
        </View>

        <ZaadButton
          labelAr="حفظ الإعدادات"
          onPress={save}
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
  intro: { alignItems: 'center', gap: 4, paddingVertical: Spacing.sm },
  bell: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lime,
    marginBottom: Spacing.xs,
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
  optionsCard: { paddingHorizontal: Spacing.base },
  optionRow: {
    minHeight: 76,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.md,
  },
  divider: { borderTopWidth: 1, borderTopColor: Colors.borderLight },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  optionCopy: { flex: 1, alignItems: 'flex-end' },
  optionLabel: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  optionSubtitle: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  sectionHead: {
    flexDirection: 'row-reverse',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  sectionHint: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
  },
  timeSelector: {
    flexDirection: 'row-reverse',
    gap: Spacing.sm,
  },
  timeOption: {
    flex: 1,
    minHeight: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  timeOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeValue: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  timeLabel: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
  },
  timeTextSelected: { color: Colors.surface },
  privacyNote: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryLight,
  },
  privacyText: {
    flex: 1,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.7,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
})

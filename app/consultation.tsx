import { useMemo, useState } from 'react'
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as SecureStore from 'expo-secure-store'

import { AppHeader } from '../src/components/ui/AppHeader'
import { ZaadButton } from '../src/components/ui/ZaadButton'
import { ZaadCard } from '../src/components/ui/ZaadCard'
import { Colors, Radius, Spacing, Typography } from '../src/constants/theme'

const BOOKING_KEY = 'zaad_consultation_booking'
const SPECIALISTS = [
  { id: 'clinical', name: 'أخصائي التغذية العلاجية', focus: 'التحاليل والحالات الصحية', icon: 'activity' as const },
  { id: 'lifestyle', name: 'أخصائي نمط الحياة', focus: 'الوزن والعادات اليومية', icon: 'sun' as const },
]
const TIMES = ['١٠:٠٠ ص', '١٢:٣٠ م', '٤:٠٠ م', '٧:٣٠ م']

async function saveBooking(value: object) {
  const serialized = JSON.stringify(value)
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(BOOKING_KEY, serialized)
    return
  }
  await SecureStore.setItemAsync(BOOKING_KEY, serialized)
}

export default function ConsultationScreen() {
  const insets = useSafeAreaInsets()
  const [specialist, setSpecialist] = useState(SPECIALISTS[0].id)
  const [dayIndex, setDayIndex] = useState(0)
  const [time, setTime] = useState(TIMES[0])
  const [saving, setSaving] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const days = useMemo(() => Array.from({ length: 5 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index + 1)
    return date
  }), [])

  async function confirmBooking() {
    setSaving(true)
    try {
      await saveBooking({
        specialist,
        date: days[dayIndex].toISOString(),
        time,
        createdAt: new Date().toISOString(),
      })
      setConfirmed(true)
    } catch {
      Alert.alert('تعذر الحجز', 'حاول مرة أخرى.')
    } finally {
      setSaving(false)
    }
  }

  if (confirmed) {
    return (
      <>
        <AppHeader titleAr="الاستشارة" showBack />
        <View style={[styles.confirmedScreen, { paddingBottom: insets.bottom }]}>
          <View style={styles.confirmIcon}>
            <Feather name="check" size={34} color={Colors.burgundy} />
          </View>
          <Text style={styles.confirmTitle}>تم تثبيت الموعد</Text>
          <Text style={styles.confirmText}>
            {days[dayIndex].toLocaleDateString('ar-SA', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })} · {time}
          </Text>
          <Text style={styles.confirmHint}>
            حُفظ الموعد على هذا الجهاز وسيظهر لك تذكير ضمن إعدادات زاد.
          </Text>
          <ZaadButton labelAr="تعديل الموعد" variant="ghost" onPress={() => setConfirmed(false)} />
        </View>
      </>
    )
  }

  return (
    <>
      <AppHeader titleAr="حجز استشارة" showBack />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing['2xl'] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.title}>اختر الخبير والوقت المناسب</Text>
          <Text style={styles.subtitle}>جلسة فيديو لمدة 30 دقيقة لمراجعة خطتك.</Text>
        </View>

        <Text style={styles.sectionTitle}>نوع الاستشارة</Text>
        <View style={styles.specialists}>
          {SPECIALISTS.map(item => {
            const selected = specialist === item.id
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.specialist, selected && styles.specialistSelected]}
                onPress={() => setSpecialist(item.id)}
              >
                <View style={[styles.specialistIcon, selected && styles.specialistIconSelected]}>
                  <Feather name={item.icon} size={21} color={Colors.primary} />
                </View>
                <Text style={styles.specialistName}>{item.name}</Text>
                <Text style={styles.specialistFocus}>{item.focus}</Text>
                {selected && <Feather name="check-circle" size={19} color={Colors.primary} />}
              </TouchableOpacity>
            )
          })}
        </View>

        <Text style={styles.sectionTitle}>اليوم</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.days}>
            {days.map((day, index) => {
              const selected = dayIndex === index
              return (
                <TouchableOpacity
                  key={day.toISOString()}
                  style={[styles.day, selected && styles.daySelected]}
                  onPress={() => setDayIndex(index)}
                >
                  <Text style={[styles.dayName, selected && styles.selectedText]}>
                    {day.toLocaleDateString('ar-SA', { weekday: 'short' })}
                  </Text>
                  <Text style={[styles.dayNumber, selected && styles.selectedText]}>
                    {day.toLocaleDateString('ar-SA', { day: 'numeric' })}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </ScrollView>

        <Text style={styles.sectionTitle}>الوقت</Text>
        <View style={styles.times}>
          {TIMES.map(item => {
            const selected = time === item
            return (
              <TouchableOpacity
                key={item}
                style={[styles.time, selected && styles.timeSelected]}
                onPress={() => setTime(item)}
              >
                <Text style={[styles.timeText, selected && styles.selectedText]}>{item}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <ZaadCard style={styles.summary}>
          <View style={styles.summaryRow}>
            <Feather name="video" size={18} color={Colors.primary} />
            <Text style={styles.summaryText}>مكالمة فيديو · 30 دقيقة</Text>
          </View>
          <View style={styles.summaryRow}>
            <Feather name="calendar" size={18} color={Colors.primary} />
            <Text style={styles.summaryText}>
              {days[dayIndex].toLocaleDateString('ar-SA', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })} · {time}
            </Text>
          </View>
        </ZaadCard>

        <ZaadButton
          labelAr="تأكيد الموعد"
          onPress={confirmBooking}
          loading={saving}
          icon={<Feather name="calendar" size={18} color={Colors.surface} />}
        />
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, gap: Spacing.md },
  intro: { alignItems: 'flex-end', gap: 3, paddingVertical: Spacing.sm },
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
  sectionTitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  specialists: { gap: Spacing.sm },
  specialist: {
    minHeight: 78,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  specialistSelected: { backgroundColor: Colors.limeSoft, borderColor: Colors.lime },
  specialistIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  specialistIconSelected: { backgroundColor: Colors.lime },
  specialistName: {
    flex: 1,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  specialistFocus: {
    maxWidth: 100,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  days: { flexDirection: 'row-reverse', gap: Spacing.sm },
  day: {
    width: 64,
    height: 76,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  daySelected: { backgroundColor: Colors.primary },
  dayName: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
  },
  dayNumber: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  times: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: Spacing.sm },
  time: {
    width: '48%',
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  timeText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  selectedText: { color: Colors.surface },
  summary: { gap: Spacing.md, backgroundColor: Colors.primaryLight },
  summaryRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm },
  summaryText: {
    flex: 1,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  confirmedScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
    backgroundColor: Colors.background,
  },
  confirmIcon: {
    width: 80,
    height: 80,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lime,
  },
  confirmTitle: {
    fontSize: Typography.size['2xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.burgundy,
  },
  confirmText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  confirmHint: {
    maxWidth: 320,
    marginBottom: Spacing.lg,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.7,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    textAlign: 'center',
  },
})

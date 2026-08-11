/**
 * زاد — Profile & Settings screen (tab: ملفي)
 * Shows health summary, conditions, medications, and settings.
 * Entry point to family sharing and dietitian consultation.
 */
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Switch,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { type Href, useRouter } from 'expo-router'

import { useSession } from '../../src/hooks/useSession'
import { AppHeader } from '../../src/components/ui/AppHeader'
import { useAuthStore } from '../../src/store/auth'
import { useProfileStore } from '../../src/store/profile'
import { useThemeStore } from '../../src/store/theme'
import { ZaadCard } from '../../src/components/ui/ZaadCard'
import { GuidanceCard } from '../../src/components/zaad/ContentBlocks'
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme'
import { CONDITIONS_AR } from '../../src/constants/data'
import { calcBMI, bmiCategory } from '../../src/constants/data'

interface SettingsRowProps {
  icon: React.ComponentProps<typeof Feather>['name']
  labelAr: string
  onPress: () => void
  danger?: boolean
  subtitle?: string
}

function SettingsRow({ icon, labelAr, onPress, danger, subtitle }: SettingsRowProps) {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress}>
      <Feather
        name="chevron-left" // RTL: left arrow = forward
        size={16}
        color={Colors.textSubtle}
      />
      <View style={styles.settingsContent}>
        <Text style={[styles.settingsLabel, danger && styles.dangerLabel]}>
          {labelAr}
        </Text>
        {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
      </View>
      <View style={[styles.settingsIcon, danger && styles.dangerIconBg]}>
        <Feather
          name={icon}
          size={18}
          color={danger ? Colors.risk.text : Colors.primary}
        />
      </View>
    </TouchableOpacity>
  )
}

interface SettingsSwitchRowProps {
  icon: React.ComponentProps<typeof Feather>['name']
  labelAr: string
  subtitle?: string
  value: boolean
  onValueChange: (value: boolean) => void
}

function SettingsSwitchRow({ icon, labelAr, subtitle, value, onValueChange }: SettingsSwitchRowProps) {
  return (
    <View style={styles.settingsRow}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.border, true: Colors.primaryBorder }}
        thumbColor={value ? Colors.lime : Colors.surface}
        ios_backgroundColor={Colors.border}
      />
      <View style={styles.settingsContent}>
        <Text style={styles.settingsLabel}>{labelAr}</Text>
        {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.settingsIcon}>
        <Feather name={icon} size={18} color={Colors.primary} />
      </View>
    </View>
  )
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const { user, signOut } = useSession()
  const isDemoMode = useAuthStore(s => s.isDemoMode)
  const themeMode = useThemeStore(s => s.mode)
  const setThemeMode = useThemeStore(s => s.setMode)
  const { profile: liveProfile, conditions: liveConditions, medications } = useProfileStore()
  const router = useRouter()

  const profile    = isDemoMode ? null : liveProfile
  const conditions = isDemoMode ? [] : liveConditions

  const bmi = profile?.weightKg && profile?.heightCm
    ? calcBMI(profile.weightKg, profile.heightCm)
    : null
  const bmiInfo = bmi ? bmiCategory(bmi) : null

  async function handleSignOut() {
    if (Platform.OS === 'web') {
      await signOut()
      return
    }
    Alert.alert(
      'تسجيل الخروج',
      'هل تريد تسجيل الخروج من زاد؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تسجيل الخروج',
          style: 'destructive',
          onPress: signOut,
        },
      ],
    )
  }

  return (
    <>
    <AppHeader titleAr="ملفي الصحي" />
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Spacing.sm, paddingBottom: insets.bottom + 170 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Profile hero ── */}
      <ZaadCard style={styles.heroCard} padding="none">
        <View style={styles.cover}>
          <View style={styles.coverCircleLarge} />
          <View style={styles.coverCircleSmall} />
          <Feather name="settings" size={22} color={Colors.surface} />
        </View>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.fullName?.charAt(0) ?? user?.email?.charAt(0) ?? 'م'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile?.fullName ?? 'المستخدم'}
            </Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            {profile?.city && (
              <Text style={styles.profileCity}>{profile.city}</Text>
            )}
          </View>
        </View>

        <View style={styles.goalBadge}>
          <Feather name="target" size={14} color={Colors.primary} />
          <Text style={styles.goalBadgeText}>
            {profile?.goal === 'weight_loss'
              ? 'خفض الوزن'
              : profile?.goal === 'weight_gain'
                ? 'زيادة الوزن'
                : profile?.goal === 'therapeutic'
                  ? 'إدارة الحالة الصحية'
                  : profile?.goal === 'blood_sugar_control'
                    ? 'ضبط سكر الدم'
                    : profile?.goal === 'cholesterol'
                      ? 'خفض الدهون'
                  : 'الحفاظ على نمط متوازن'}
          </Text>
        </View>

        {bmi && bmiInfo && (
          <View style={styles.bmiRow}>
            <Text style={[styles.bmiValue, { color: bmiInfo.color }]}>
              BMI: {bmi}
            </Text>
            <Text style={[styles.bmiLabel, { color: bmiInfo.color }]}>
              {bmiInfo.labelAr}
            </Text>
          </View>
        )}

        {/* Metrics row */}
        <View style={styles.metricsRow}>
          {profile?.weightKg && (
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{profile.weightKg}</Text>
              <Text style={styles.metricUnit}>كغ</Text>
            </View>
          )}
          {profile?.heightCm && (
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{profile.heightCm}</Text>
              <Text style={styles.metricUnit}>سم</Text>
            </View>
          )}
          {profile?.age && (
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{profile.age}</Text>
              <Text style={styles.metricUnit}>سنة</Text>
            </View>
          )}
        </View>
      </ZaadCard>

      <View style={styles.profileSectionHeading}>
        <Text style={styles.sectionTitle}>ملخصك الصحي</Text>
        <Text style={styles.sectionHint}>يتحدّث مع بياناتك</Text>
      </View>

      {/* ── Conditions ── */}
      {conditions.length > 0 && (
        <ZaadCard style={styles.section}>
          <Text style={styles.sectionTitle}>الحالات الصحية</Text>
          <View style={styles.tagGrid}>
            {conditions.map(c => (
              <View key={c.id} style={styles.conditionTag}>
                <Text style={styles.conditionTagText}>
                  {CONDITIONS_AR[c.condition] ?? c.condition}
                </Text>
              </View>
            ))}
          </View>
        </ZaadCard>
      )}

      {/* ── Medications ── */}
      {medications.length > 0 && (
        <ZaadCard style={styles.section}>
          <Text style={styles.sectionTitle}>الأدوية ({medications.length})</Text>
          {medications.map(med => (
            <View key={med.id} style={styles.medicationRow}>
              <Text style={styles.medName}>{med.nameAr ?? med.name}</Text>
              {med.dosage && (
                <Text style={styles.medDosage}>{med.dosage}</Text>
              )}
            </View>
          ))}
        </ZaadCard>
      )}

      {/* ── Settings ── */}
      <ZaadCard style={styles.section}>
        <Text style={styles.sectionTitle}>الإعدادات</Text>

        <SettingsRow
          icon="target"
          labelAr="إدارة الهدف اليومي"
          subtitle="السعرات والبروتين والماكروز"
          onPress={() => router.push('/goals')}
        />
        <View style={styles.rowDivider} />
        <SettingsSwitchRow
          icon="moon"
          labelAr="الوضع الليلي"
          subtitle="راحة أكثر في الإضاءة المنخفضة"
          value={themeMode === 'dark'}
          onValueChange={value => setThemeMode(value ? 'dark' : 'light')}
        />
        <View style={styles.rowDivider} />
        <SettingsRow
          icon="sliders"
          labelAr="نمط الحمية الغذائية"
          subtitle="متوازن، متوسطي، كيتو، نباتي والمزيد"
          onPress={() => router.push('/diet' as Href)}
        />
        <View style={styles.rowDivider} />
        <SettingsRow
          icon="edit-3"
          labelAr="تعديل الملف الصحي"
          onPress={() => {
            if (isDemoMode) {
              Alert.alert(
                'الوضع التجريبي',
                'أنشئ حساباً مجانياً لحفظ معلوماتك الصحية وتخصيص خطتك',
                [
                  { text: 'لاحقاً', style: 'cancel' },
                  { text: 'إنشاء حساب', onPress: signOut },
                ],
              )
            } else {
              router.push('/onboarding')
            }
          }}
        />
        <View style={styles.rowDivider} />
        <SettingsRow
          icon="share-2"
          labelAr="مشاركة الخطة مع العائلة"
          subtitle="أرسل خطتك لمن يطبخ لك"
          onPress={() => router.push('/family')}
        />
        <View style={styles.rowDivider} />
        <SettingsRow
          icon="calendar"
          labelAr="استشارة أخصائي تغذية"
          subtitle="احجز موعداً مع خبير"
          onPress={() => router.push('/consultation')}
        />
        <View style={styles.rowDivider} />
        <SettingsRow
          icon="bell"
          labelAr="إعدادات التنبيهات"
          subtitle="وجبات، قياسات، وتحاليل"
          onPress={() => router.push('/notifications')}
        />
      </ZaadCard>

      <GuidanceCard
        titleAr="محتوى الملف يؤثر على الخطة"
        bodyAr="عند تغيير دواء، وزن، حالة صحية، أو تفضيل غذائي، عدّل الملف حتى تتغير التوصيات بطريقة مناسبة."
        icon="edit-3"
        tone="safe"
      />

      {/* ── Legal & Sign out ── */}
      <ZaadCard style={styles.section}>
        <SettingsRow
          icon="shield"
          labelAr="سياسة الخصوصية وحماية البيانات"
          onPress={() => router.push('/privacy')}
        />
        <View style={styles.rowDivider} />
        <SettingsRow
          icon="log-out"
          labelAr="تسجيل الخروج"
          onPress={handleSignOut}
          danger
        />
      </ZaadCard>

      {/* App version */}
      <Text style={styles.versionText}>زاد · الإصدار 1.0.0</Text>
    </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.base, gap: Spacing.md },

  heroCard: {
    paddingBottom: Spacing.lg,
    alignItems: 'center',
  },
  cover: {
    width: '100%',
    height: 104,
    padding: Spacing.base,
    alignItems: 'flex-start',
    overflow: 'hidden',
    backgroundColor: Colors.primary,
  },
  coverCircleLarge: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    left: -30,
    top: -72,
    backgroundColor: Colors.lime,
    opacity: 0.88,
  },
  coverCircleSmall: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    right: 34,
    bottom: -52,
    backgroundColor: Colors.coral,
    opacity: 0.9,
  },
  avatarSection: {
    marginTop: -34,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: Colors.surface,
  },
  avatarText: {
    color: '#fff',
    fontSize: Typography.size['2xl'],
    fontFamily: 'IBMPlexArabic-Bold',
  },
  profileInfo: { alignItems: 'center', gap: 2, marginTop: Spacing.sm },
  profileName: {
    fontSize: Typography.size.xl,
    fontFamily: 'IBMPlexArabic-Bold',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    fontFamily: 'IBMPlexArabic-Regular',
    textAlign: 'center',
  },
  profileCity: {
    fontSize: Typography.size.sm,
    color: Colors.textSubtle,
    fontFamily: 'IBMPlexArabic-Regular',
    textAlign: 'center',
  },
  goalBadge: {
    marginTop: Spacing.sm,
    minHeight: 36,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.limeSoft,
  },
  goalBadgeText: {
    fontSize: Typography.size.sm,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.medium,
  },
  bmiRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  bmiValue: {
    fontSize: Typography.size.base,
    fontFamily: 'IBMPlexArabic-Bold',
  },
  bmiLabel: {
    fontSize: Typography.size.sm,
    fontFamily: 'IBMPlexArabic-Medium',
  },

  metricsRow: {
    width: '100%',
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  metricItem: { alignItems: 'center' },
  metricValue: {
    fontSize: Typography.size.xl,
    fontFamily: 'IBMPlexArabic-Bold',
    color: Colors.textPrimary,
  },
  metricUnit: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    fontFamily: 'IBMPlexArabic-Regular',
  },

  section: { gap: Spacing.md },
  sectionTitle: {
    fontSize: Typography.size.base,
    fontFamily: 'IBMPlexArabic-Bold',
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  profileSectionHeading: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: Spacing.xs,
    marginTop: Spacing.sm,
  },
  sectionHint: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
  },

  tagGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  conditionTag: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    minHeight: 34,
    justifyContent: 'center',
    paddingVertical: 5,
  },
  conditionTagText: {
    fontSize: Typography.size.sm,
    fontFamily: 'IBMPlexArabic-Medium',
    color: Colors.primaryDark,
  },

  demoUserList: {
    gap: Spacing.sm,
  },
  demoUserRow: {
    minHeight: 64,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surfaceAlt,
  },
  demoUserRowSelected: {
    borderColor: Colors.primaryBorder,
    backgroundColor: Colors.primaryLight,
  },
  demoUserBadge: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  demoUserBadgeSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  demoUserBadgeText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  demoUserBadgeTextSelected: {
    color: Colors.surface,
  },
  demoUserInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  demoUserName: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  demoUserSummary: {
    marginTop: 2,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    textAlign: 'right',
    lineHeight: Typography.size.sm * 1.45,
  },

  medicationRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  medName: {
    fontSize: Typography.size.sm,
    fontFamily: 'IBMPlexArabic-Medium',
    color: Colors.textPrimary,
  },
  medDosage: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    fontFamily: 'IBMPlexArabic-Regular',
  },

  settingsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 58,
  },
  settingsIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerIconBg: { backgroundColor: Colors.risk.bg },
  settingsContent: { flex: 1, gap: 2 },
  settingsLabel: {
    fontSize: Typography.size.sm,
    fontFamily: 'IBMPlexArabic-Medium',
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  dangerLabel: { color: Colors.risk.text },
  settingsSubtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    fontFamily: 'IBMPlexArabic-Regular',
    textAlign: 'right',
  },

  rowDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 2,
  },

  versionText: {
    fontSize: Typography.size.sm,
    color: Colors.textSubtle,
    fontFamily: 'IBMPlexArabic-Regular',
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },

  demoTag: {
    fontSize: Typography.size.sm,
    color: Colors.primary,
    fontFamily: 'IBMPlexArabic-Medium',
    textAlign: 'right',
  },

  cardiacCard: { gap: Spacing.md },
  deviceRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  deviceBadge: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.risk.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  deviceName: {
    fontSize: Typography.size.sm,
    fontFamily: 'IBMPlexArabic-SemiBold',
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  deviceDate: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    fontFamily: 'IBMPlexArabic-Regular',
    textAlign: 'right',
  },
  cardioMsReading: { alignItems: 'center' },
  cardioMsValue: {
    fontSize: Typography.size.xl,
    fontFamily: 'IBMPlexArabic-Bold',
    color: Colors.primary,
  },
  cardioMsUnit: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    fontFamily: 'IBMPlexArabic-Regular',
  },
  efRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: Colors.safe.bg,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  efLabel: {
    fontSize: Typography.size.sm,
    fontFamily: 'IBMPlexArabic-Bold',
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  efSub: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    fontFamily: 'IBMPlexArabic-Regular',
    textAlign: 'right',
  },
  efValue: {
    fontSize: Typography.size['2xl'],
    fontFamily: 'IBMPlexArabic-Bold',
    color: Colors.safe.text,
  },
  efNote: {
    fontSize: Typography.size.xs,
    color: Colors.safe.text,
    fontFamily: 'IBMPlexArabic-Regular',
    textAlign: 'right',
  },
})

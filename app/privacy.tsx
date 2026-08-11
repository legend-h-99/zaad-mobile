import {
  Alert,
  Platform,
  ScrollView,
  Share,
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
import { CONDITIONS_AR } from '../src/constants/data'
import { Colors, Radius, Spacing, Typography } from '../src/constants/theme'
import { useSession } from '../src/hooks/useSession'
import { useProfileStore } from '../src/store/profile'

const PRIVACY_ROWS = [
  { icon: 'lock' as const, title: 'تشفير الاتصال', body: 'تُنقل البيانات عبر اتصال مشفر إلى Supabase.' },
  { icon: 'eye-off' as const, title: 'وصول خاص', body: 'كل حساب يقرأ بياناته الصحية فقط عبر سياسات RLS.' },
  { icon: 'smartphone' as const, title: 'إعدادات الجهاز', body: 'تفضيلات التنبيهات تبقى على جهازك.' },
  { icon: 'download' as const, title: 'حق الحصول على نسخة', body: 'يمكنك تصدير ملخص بياناتك في أي وقت.' },
]

export default function PrivacyScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user, signOut } = useSession()
  const { profile, conditions, medications } = useProfileStore()

  async function exportSummary() {
    const payload = {
      exportedAt: new Date().toISOString(),
      account: { email: user?.email },
      profile,
      conditions: conditions.map(condition => ({
        condition: CONDITIONS_AR[condition.condition] ?? condition.condition,
        severity: condition.severity,
      })),
      medications: medications.map(medication => ({
        name: medication.nameAr ?? medication.name,
        dosage: medication.dosage,
      })),
    }
    await Share.share({
      title: 'نسخة من بيانات زاد',
      message: JSON.stringify(payload, null, 2),
    })
  }

  async function signOutEverywhere() {
    if (Platform.OS === 'web') {
      await signOut()
      router.replace('/(auth)/login')
      return
    }
    Alert.alert(
      'تسجيل الخروج',
      'سيتم تسجيل خروج هذا الحساب من زاد.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تسجيل الخروج',
          style: 'destructive',
          onPress: async () => {
            await signOut()
            router.replace('/(auth)/login')
          },
        },
      ],
    )
  }

  return (
    <>
      <AppHeader titleAr="الخصوصية" showBack />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing['2xl'] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.shield}>
            <Feather name="shield" size={30} color={Colors.burgundy} />
          </View>
          <Text style={styles.title}>بياناتك الصحية لك</Text>
          <Text style={styles.subtitle}>
            يعرض زاد معلوماتك داخل حسابك ويستخدمها لتخصيص الخطة فقط.
          </Text>
        </View>

        <ZaadCard padding="none" style={styles.rowsCard}>
          {PRIVACY_ROWS.map((row, index) => (
            <View key={row.title} style={[styles.row, index > 0 && styles.divider]}>
              <View style={styles.rowIcon}>
                <Feather name={row.icon} size={19} color={Colors.primary} />
              </View>
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>{row.title}</Text>
                <Text style={styles.rowBody}>{row.body}</Text>
              </View>
            </View>
          ))}
        </ZaadCard>

        <ZaadCard style={styles.accountCard}>
          <Text style={styles.sectionTitle}>بيانات الحساب</Text>
          <View style={styles.accountRow}>
            <Text style={styles.accountValue}>{user?.email ?? 'غير مسجل'}</Text>
            <Text style={styles.accountLabel}>البريد</Text>
          </View>
          <View style={styles.accountRow}>
            <Text style={styles.accountValue}>{conditions.length}</Text>
            <Text style={styles.accountLabel}>حالات صحية مسجلة</Text>
          </View>
          <View style={styles.accountRow}>
            <Text style={styles.accountValue}>{medications.length}</Text>
            <Text style={styles.accountLabel}>أدوية مسجلة</Text>
          </View>
        </ZaadCard>

        <ZaadButton
          labelAr="تصدير ملخص بياناتي"
          onPress={exportSummary}
          icon={<Feather name="download" size={18} color={Colors.surface} />}
        />
        <TouchableOpacity style={styles.signOutButton} onPress={signOutEverywhere}>
          <Feather name="log-out" size={18} color={Colors.risk.text} />
          <Text style={styles.signOutText}>تسجيل الخروج من الحساب</Text>
        </TouchableOpacity>

        <Text style={styles.version}>آخر تحديث لبيان الخصوصية: يوليو 2026</Text>
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, gap: Spacing.base },
  hero: { alignItems: 'center', gap: 5, paddingVertical: Spacing.md },
  shield: {
    width: 72,
    height: 72,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lime,
  },
  title: {
    fontSize: Typography.size['2xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.burgundy,
  },
  subtitle: {
    maxWidth: 330,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.7,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  rowsCard: { paddingHorizontal: Spacing.base },
  row: {
    minHeight: 82,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.md,
  },
  divider: { borderTopWidth: 1, borderTopColor: Colors.borderLight },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  rowCopy: { flex: 1, alignItems: 'flex-end' },
  rowTitle: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  rowBody: {
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.6,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  accountCard: { gap: Spacing.md },
  sectionTitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  accountRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  accountValue: {
    maxWidth: '65%',
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  accountLabel: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
  },
  signOutButton: {
    minHeight: 50,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.risk.bg,
    borderWidth: 1,
    borderColor: Colors.risk.border,
  },
  signOutText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.risk.text,
  },
  version: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSubtle,
    textAlign: 'center',
  },
})

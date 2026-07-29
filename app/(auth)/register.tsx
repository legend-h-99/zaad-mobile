/**
 * زاد — Register screen
 * Creates a Supabase account, then routes to onboarding.
 */
import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { supabase } from '../../src/lib/supabase/client'
import { ZaadButton } from '../../src/components/ui/ZaadButton'
import { AppleSignInButton } from '../../src/components/auth/AppleSignInButton'
import { GoogleSignInButton } from '../../src/components/auth/GoogleSignInButton'
import { ZAAD_PAGE_CONTENT } from '../../src/constants/zaadContent'
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme'
import { useAuthStore } from '../../src/store/auth'

function getEmailRedirectTo() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/onboarding`
  }

  return undefined
}

export default function RegisterScreen() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const setSession = useAuthStore(state => state.setSession)

  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState<string | null>(null)

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password) {
      setError('الرجاء تعبئة جميع الحقول')
      return
    }
    if (password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(null)

    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: getEmailRedirectTo(),
      },
    })

    if (authError) {
      setError(
        authError.message.includes('already registered')
          ? 'هذا البريد الإلكتروني مسجل مسبقاً'
          : 'حدث خطأ في إنشاء الحساب، يرجى المحاولة مجدداً'
      )
      setLoading(false)
      return
    }

    if (data.session) {
      setSession(data.session)
      router.replace('/onboarding')
      return
    }

    setSuccess('تم إنشاء الحساب. افتح بريدك الإلكتروني واضغط رابط التأكيد، ثم سجّل الدخول لإكمال ملفك الصحي.')
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-right" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerCard}>
            <View style={styles.logoMark}>
              <Text style={styles.logoChar}>ز</Text>
            </View>
            <Text style={styles.title}>ابدأ ملفك الغذائي</Text>
            <Text style={styles.subtitle}>نستخدم بياناتك الصحية لبناء خطة أوضح وأكثر أمانًا.</Text>
            <Text style={styles.setupHint}>{ZAAD_PAGE_CONTENT.onboarding.body}</Text>
            <View style={styles.promiseRow}>
              <View style={styles.promisePill}>
                <Feather name="lock" size={12} color={Colors.primary} />
                <Text style={styles.promiseText}>بيانات محمية</Text>
              </View>
              <View style={styles.promisePill}>
                <Feather name="clipboard" size={12} color={Colors.primary} />
                <Text style={styles.promiseText}>ملف صحي ذكي</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={styles.card}>
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          {success && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>{success}</Text>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>الاسم الكامل</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="محمد أحمد"
              placeholderTextColor={Colors.textDisabled}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              textAlign="right"
              returnKeyType="next"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>البريد الإلكتروني</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="example@email.com"
              placeholderTextColor={Colors.textDisabled}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              textAlign="right"
              returnKeyType="next"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>كلمة المرور</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="8 أحرف على الأقل"
              placeholderTextColor={Colors.textDisabled}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              textAlign="right"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />
          </View>

          <ZaadButton
            labelAr="إنشاء حساب"
            onPress={handleRegister}
            loading={loading}
          />

          <View style={styles.authDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>أو</Text>
            <View style={styles.dividerLine} />
          </View>

          <GoogleSignInButton
            mode="signUp"
            onError={message => setError(message || null)}
          />

          <AppleSignInButton
            mode="signUp"
            onError={message => setError(message || null)}
          />

          <Text style={styles.legal}>
            بإنشاء الحساب، توافق على شروط الخدمة وسياسة الخصوصية.
            بياناتك الصحية محمية ومشفرة.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.back()}
        >
          <Text style={styles.loginText}>
            لديك حساب بالفعل؟{' '}
            <Text style={styles.loginHighlight}>تسجيل الدخول</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  headerCard: {
    alignItems: 'flex-end',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  logoChar: {
    color: '#fff',
    fontSize: 28,
    fontFamily: 'IBMPlexArabic-Bold',
  },
  title: {
    fontSize: Typography.size['2xl'],
    fontFamily: 'IBMPlexArabic-Bold',
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    fontFamily: 'IBMPlexArabic-Regular',
    marginTop: 4,
    textAlign: 'right',
    lineHeight: Typography.size.sm * 1.6,
  },
  setupHint: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'right',
    lineHeight: Typography.size.xs * 1.65,
  },
  promiseRow: {
    flexDirection: 'row-reverse',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  promisePill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
  },
  promiseText: {
    fontSize: Typography.size.xs,
    fontFamily: 'IBMPlexArabic-Medium',
    color: Colors.primary,
  },

  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 12 },
      android: { elevation: 2 },
    }),
  },
  errorBanner: {
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
  successBanner: {
    backgroundColor: Colors.safe.bg,
    borderWidth: 1,
    borderColor: Colors.safe.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  successText: {
    color: Colors.safe.text,
    fontSize: Typography.size.sm,
    fontFamily: 'IBMPlexArabic-Regular',
    textAlign: 'right',
    lineHeight: Typography.size.sm * 1.6,
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
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.size.base,
    fontFamily: 'IBMPlexArabic-Regular',
    color: Colors.textPrimary,
    backgroundColor: Colors.surfaceAlt,
    minHeight: 50,
  },
  authDivider: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textMuted,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  legal: {
    fontSize: Typography.size.xs,
    color: Colors.textSubtle,
    fontFamily: 'IBMPlexArabic-Regular',
    textAlign: 'center',
    lineHeight: Typography.size.xs * 1.75,
  },
  loginLink: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  loginText: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    fontFamily: 'IBMPlexArabic-Regular',
    textAlign: 'center',
  },
  loginHighlight: {
    color: Colors.primary,
    fontFamily: 'IBMPlexArabic-SemiBold',
  },
})

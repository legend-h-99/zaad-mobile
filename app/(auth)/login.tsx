import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ZaadButton } from '../../src/components/ui/ZaadButton'
import { AppleSignInButton } from '../../src/components/auth/AppleSignInButton'
import { GoogleSignInButton } from '../../src/components/auth/GoogleSignInButton'
import { supabase } from '../../src/lib/supabase/client'
import { Colors, Radius, Spacing, Typography } from '../../src/constants/theme'
import { useAuthStore } from '../../src/store/auth'

export default function LoginScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const setSession = useAuthStore(state => state.setSession)
  const clearDemoMode = useAuthStore(state => state.clearDemoMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('أدخل البريد الإلكتروني وكلمة المرور للمتابعة.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (authError) {
        setError('تعذر تسجيل الدخول. تأكد من البريد وكلمة المرور.')
      } else if (data.session) {
        await clearDemoMode()
        setSession(data.session)
        router.replace('/(tabs)')
      }
    } catch {
      setError('تعذر الاتصال الآن. تحقق من الشبكة وإعدادات Supabase.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 22, paddingBottom: insets.bottom + 28 },
        ]}
      >
        <View style={styles.brandMark}>
          <Text style={styles.brandLetter}>ز</Text>
        </View>
        <Text style={styles.brandName}>زاد</Text>
        <Text style={styles.title}>غذاؤك أقرب إلى أهدافك، كل يوم.</Text>
        <Text style={styles.subtitle}>
          خطة مرنة تفهم حالتك وذوقك وتتحسن مع اختياراتك.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>أهلاً بعودتك</Text>

          {error && (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={17} color={Colors.risk.text} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>البريد الإلكتروني</Text>
            <View style={styles.inputShell}>
              <Feather name="mail" size={18} color={Colors.textSubtle} />
              <TextInput
                accessibilityLabel="البريد الإلكتروني"
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                placeholderTextColor={Colors.textDisabled}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                textAlign="right"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>كلمة المرور</Text>
            <View style={styles.inputShell}>
              <Pressable
                onPress={() => setShowPassword(value => !value)}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                <Feather
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color={Colors.textSubtle}
                />
              </Pressable>
              <TextInput
                accessibilityLabel="كلمة المرور"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={Colors.textDisabled}
                secureTextEntry={!showPassword}
                autoComplete="password"
                textContentType="password"
                textAlign="right"
                style={styles.input}
              />
            </View>
          </View>

          <Pressable
            style={styles.forgot}
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text style={styles.forgotText}>نسيت كلمة المرور؟</Text>
          </Pressable>

          <ZaadButton
            labelAr="دخول"
            onPress={handleLogin}
            loading={loading}
            size="lg"
          />

          <View style={styles.authDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>أو</Text>
            <View style={styles.dividerLine} />
          </View>

          <GoogleSignInButton onError={message => setError(message || null)} />

          <AppleSignInButton onError={message => setError(message || null)} />
        </View>

        <Pressable
          style={styles.signup}
          onPress={async () => {
            await clearDemoMode()
            router.push('/(auth)/register')
          }}
        >
          <Text style={styles.signupText}>
            جديد في زاد؟ <Text style={styles.signupLink}>أنشئ حسابك</Text>
          </Text>
        </Pressable>

        <View style={styles.safetyNote}>
          <Feather name="shield" size={14} color={Colors.primary} />
          <Text style={styles.safetyText}>بياناتك الصحية خاصة ومحمية</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
  },
  brandMark: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    transform: [{ rotate: '-2deg' }],
  },
  brandLetter: {
    color: Colors.lime,
    fontSize: 42,
    lineHeight: 53,
    fontFamily: Typography.fontFamily.bold,
  },
  brandName: {
    marginTop: Spacing.sm,
    color: Colors.primary,
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
  },
  title: {
    maxWidth: 340,
    marginTop: Spacing.lg,
    color: Colors.burgundy,
    fontSize: 29,
    lineHeight: 40,
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 310,
    marginTop: Spacing.sm,
    color: Colors.textMuted,
    fontSize: Typography.size.sm,
    lineHeight: 23,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
  },
  formCard: {
    width: '100%',
    marginTop: Spacing.xl,
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#2C211C',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      android: { elevation: 4 },
      web: { boxShadow: '0 12px 34px rgba(44, 33, 28, 0.08)' },
    }),
  },
  formTitle: {
    color: Colors.burgundy,
    fontSize: Typography.size.xl,
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'right',
  },
  errorBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.risk.bg,
  },
  errorText: {
    flex: 1,
    color: Colors.risk.text,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'right',
  },
  field: { gap: 6 },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'right',
  },
  inputShell: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 17,
    backgroundColor: Colors.surfaceAlt,
  },
  input: {
    flex: 1,
    minHeight: 52,
    color: Colors.burgundy,
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.regular,
  },
  forgot: {
    minHeight: 44,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  forgotText: {
    color: Colors.primary,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.semiBold,
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
  demoSection: {
    width: '100%',
    marginTop: Spacing.xl,
  },
  demoHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: 4,
  },
  demoIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  demoHeaderCopy: { flex: 1, alignItems: 'flex-end' },
  demoTitle: {
    color: Colors.burgundy,
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
  },
  demoSubtitle: {
    color: Colors.textMuted,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  demoList: {
    flexDirection: 'row-reverse',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: 2,
  },
  demoCard: {
    width: 126,
    minHeight: 154,
    alignItems: 'center',
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(53,26,24,0.05)',
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
  },
  demoCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.limeSoft,
  },
  avatarSelected: { backgroundColor: Colors.primary },
  avatarText: {
    color: Colors.primary,
    fontSize: Typography.size.xl,
    fontFamily: Typography.fontFamily.bold,
  },
  avatarTextSelected: { color: Colors.lime },
  demoName: {
    marginTop: Spacing.sm,
    color: Colors.burgundy,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
  },
  demoGoal: {
    marginTop: 1,
    color: Colors.textMuted,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
  },
  demoNumber: {
    position: 'absolute',
    top: 8,
    left: 9,
    color: Colors.textSubtle,
    fontSize: 11,
    fontFamily: Typography.fontFamily.medium,
  },
  passwordHint: {
    color: Colors.textMuted,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
  },
  signup: {
    minHeight: 52,
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  signupText: {
    color: Colors.textMuted,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  signupLink: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
  },
  safetyNote: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  safetyText: {
    color: Colors.textMuted,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
  },
})

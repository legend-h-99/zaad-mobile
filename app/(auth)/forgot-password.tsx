import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ZaadButton } from '../../src/components/ui/ZaadButton'
import { Colors, Radius, Spacing, Typography } from '../../src/constants/theme'
import { NATIVE_RECOVERY_REDIRECT } from '../../src/lib/recovery'
import { supabase } from '../../src/lib/supabase/client'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function sendResetLink() {
    if (!email.trim()) {
      setError('أدخل بريدك الإلكتروني')
      return
    }
    setLoading(true)
    setError('')
    const redirectTo = Platform.OS === 'web'
      ? `${globalThis.location?.origin ?? ''}/reset-password`
      : NATIVE_RECOVERY_REDIRECT
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo },
    )
    setLoading(false)
    if (resetError) {
      setError('تعذر إرسال الرابط. تحقق من البريد وحاول مجددًا.')
      return
    }
    setSent(true)
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top + Spacing.md }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Feather name="arrow-right" size={22} color={Colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.icon}>
          <Feather name={sent ? 'mail' : 'key'} size={28} color={Colors.burgundy} />
        </View>
        <Text style={styles.title}>{sent ? 'تحقق من بريدك' : 'استعادة كلمة المرور'}</Text>
        <Text style={styles.subtitle}>
          {sent
            ? `أرسلنا رابط الاستعادة إلى ${email.trim().toLowerCase()}`
            : 'سنرسل رابطًا آمنًا لتعيين كلمة مرور جديدة.'}
        </Text>

        {!sent ? (
          <View style={styles.form}>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Text style={styles.label}>البريد الإلكتروني</Text>
            <View style={styles.inputShell}>
              <Feather name="mail" size={18} color={Colors.textSubtle} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                placeholderTextColor={Colors.textDisabled}
                keyboardType="email-address"
                autoCapitalize="none"
                textAlign="right"
                style={styles.input}
                onSubmitEditing={sendResetLink}
              />
            </View>
            <ZaadButton labelAr="إرسال رابط الاستعادة" onPress={sendResetLink} loading={loading} />
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.sentNote}>
              <Feather name="check-circle" size={18} color={Colors.safe.text} />
              <Text style={styles.sentText}>قد يستغرق وصول الرسالة بضع دقائق.</Text>
            </View>
            <ZaadButton labelAr="العودة لتسجيل الدخول" onPress={() => router.replace('/(auth)/login')} />
            <ZaadButton
              labelAr="إعادة الإرسال"
              variant="ghost"
              onPress={() => setSent(false)}
            />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.background,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing['4xl'],
  },
  icon: {
    width: 66,
    height: 66,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lime,
  },
  title: {
    fontSize: Typography.size['2xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.burgundy,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 330,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.7,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
  },
  label: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  inputShell: {
    minHeight: 54,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  error: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.risk.text,
    textAlign: 'right',
  },
  sentNote: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.safe.bg,
  },
  sentText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.safe.text,
  },
})

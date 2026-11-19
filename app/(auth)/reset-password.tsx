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
import { useAuthStore } from '../../src/store/auth'
import { supabase } from '../../src/lib/supabase/client'

export default function ResetPasswordScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function updatePassword() {
    if (!password || !confirmPassword) {
      setError('أدخل كلمة المرور الجديدة وتأكيدها.')
      return
    }

    if (password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل.')
      return
    }

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.')
      return
    }

    setLoading(true)
    setError('')

    const { error: updateError } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (updateError) {
      setError('تعذر تحديث كلمة المرور. افتح رابط الاستعادة من البريد مرة أخرى.')
      return
    }

    useAuthStore.getState().clearRecovery()
    setSaved(true)
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top + Spacing.md }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity style={styles.back} onPress={() => { useAuthStore.getState().clearRecovery(); router.replace('/(auth)/login') }}>
        <Feather name="arrow-right" size={22} color={Colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.icon}>
          <Feather name={saved ? 'check' : 'lock'} size={28} color={Colors.burgundy} />
        </View>
        <Text style={styles.title}>{saved ? 'تم تحديث كلمة المرور' : 'تعيين كلمة مرور جديدة'}</Text>
        <Text style={styles.subtitle}>
          {saved
            ? 'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.'
            : 'اختر كلمة مرور قوية لحسابك في زاد.'}
        </Text>

        <View style={styles.form}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {!saved ? (
            <>
              <Text style={styles.label}>كلمة المرور الجديدة</Text>
              <View style={styles.inputShell}>
                <Feather name="lock" size={18} color={Colors.textSubtle} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="8 أحرف على الأقل"
                  placeholderTextColor={Colors.textDisabled}
                  secureTextEntry
                  textContentType="newPassword"
                  autoComplete="new-password"
                  textAlign="right"
                  style={styles.input}
                />
              </View>

              <Text style={styles.label}>تأكيد كلمة المرور</Text>
              <View style={styles.inputShell}>
                <Feather name="check-circle" size={18} color={Colors.textSubtle} />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="أعد كتابة كلمة المرور"
                  placeholderTextColor={Colors.textDisabled}
                  secureTextEntry
                  textContentType="newPassword"
                  autoComplete="new-password"
                  textAlign="right"
                  style={styles.input}
                  onSubmitEditing={updatePassword}
                />
              </View>

              <ZaadButton labelAr="حفظ كلمة المرور" onPress={updatePassword} loading={loading} />
            </>
          ) : (
            <ZaadButton labelAr="العودة لتسجيل الدخول" onPress={() => { useAuthStore.getState().clearRecovery(); router.replace('/(auth)/login') }} />
          )}
        </View>
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
})

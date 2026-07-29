import { useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'

import { supabase } from '../../lib/supabase/client'
import { Colors, Radius, Spacing, Typography } from '../../constants/theme'

type GoogleSignInButtonProps = {
  mode?: 'signIn' | 'signUp'
  onError?: (message: string) => void
}

function getRedirectTo(mode: GoogleSignInButtonProps['mode']) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return mode === 'signUp'
      ? `${window.location.origin}/onboarding`
      : window.location.origin
  }

  return undefined
}

export function GoogleSignInButton({ mode = 'signIn', onError }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleGoogleSignIn() {
    if (isLoading) return

    if (Platform.OS !== 'web') {
      onError?.('تسجيل الدخول عبر Google متاح الآن على نسخة الويب. سنفعّله للتطبيقات لاحقًا.')
      return
    }

    setIsLoading(true)
    onError?.('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectTo(mode),
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      })

      if (error) {
        onError?.('تعذر بدء تسجيل الدخول عبر Google. تأكد من تفعيل Google في Supabase.')
        setIsLoading(false)
      }
    } catch {
      onError?.('تعذر الاتصال بخدمة Google الآن.')
      setIsLoading(false)
    }
  }

  return (
    <Pressable
      style={[styles.button, isLoading && styles.loading]}
      onPress={handleGoogleSignIn}
      accessibilityRole="button"
      accessibilityLabel={mode === 'signUp' ? 'إنشاء حساب عبر Google' : 'تسجيل الدخول عبر Google'}
    >
      <View style={styles.iconWrap}>
        <Feather name="mail" size={18} color={Colors.primary} />
      </View>
      <Text style={styles.label}>
        {mode === 'signUp' ? 'إنشاء حساب عبر Google' : 'الدخول عبر Google'}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    minHeight: 52,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceAlt,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.semiBold,
  },
  loading: {
    opacity: 0.65,
  },
})

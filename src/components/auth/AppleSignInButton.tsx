import { useEffect, useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import * as AppleAuthentication from 'expo-apple-authentication'
import * as Crypto from 'expo-crypto'
import { useRouter } from 'expo-router'
import type { SignInWithIdTokenCredentials } from '@supabase/supabase-js'

import { supabase } from '../../lib/supabase/client'
import { useAuthStore } from '../../store/auth'

type AppleSignInButtonProps = {
  mode?: 'signIn' | 'signUp'
  onError?: (message: string) => void
}

export function AppleSignInButton({ mode = 'signIn', onError }: AppleSignInButtonProps) {
  const router = useRouter()
  const setSession = useAuthStore(state => state.setSession)
  const [isAvailable, setIsAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (Platform.OS !== 'ios') return

    AppleAuthentication.isAvailableAsync()
      .then(setIsAvailable)
      .catch(() => setIsAvailable(false))
  }, [])

  async function handleAppleSignIn() {
    if (isLoading) return

    setIsLoading(true)
    onError?.('')

    try {
      const rawNonce = Crypto.randomUUID()
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce,
      )

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      })

      if (!credential.identityToken) {
        onError?.('لم يصل رمز Apple المطلوب. حاول مرة أخرى.')
        return
      }

      const signInCredentials: SignInWithIdTokenCredentials = {
        provider: 'apple',
        token: credential.identityToken,
        nonce: rawNonce,
      }

      if (credential.authorizationCode) {
        signInCredentials.access_token = credential.authorizationCode
      }

      const { data, error } = await supabase.auth.signInWithIdToken(signInCredentials)

      if (error) {
        onError?.('تعذر تسجيل الدخول عبر Apple. تأكد من تفعيل مزود Apple في Supabase.')
        return
      }

      const fullName = [
        credential.fullName?.givenName,
        credential.fullName?.middleName,
        credential.fullName?.familyName,
      ].filter(Boolean).join(' ')

      if (fullName) {
        await supabase.auth.updateUser({
          data: {
            full_name: fullName,
            given_name: credential.fullName?.givenName,
            family_name: credential.fullName?.familyName,
          },
        })
      }

      if (data.session) {
        setSession(data.session)
        router.replace('/(tabs)')
      }
    } catch (error) {
      const code = typeof error === 'object' && error && 'code' in error
        ? String(error.code)
        : ''

      if (code !== 'ERR_REQUEST_CANCELED') {
        onError?.('تعذر إكمال تسجيل الدخول عبر Apple الآن.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAvailable) return null

  return (
    <View style={[styles.container, isLoading && styles.loading]}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={
          mode === 'signUp'
            ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
            : AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
        }
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={16}
        style={styles.button}
        onPress={handleAppleSignIn}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 50,
  },
  button: {
    width: '100%',
    height: 50,
  },
  loading: {
    opacity: 0.6,
  },
})

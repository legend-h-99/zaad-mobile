/**
 * زاد — Root layout
 *
 * Responsibilities:
 * 1. Load IBM Plex Arabic fonts before first render
 * 2. Initialize auth state and redirect to login if unauthenticated
 * 3. Wrap the app in QueryClient and safe-area providers
 * 4. Set I18nManager.forceRTL(true) for system-level RTL
 */
import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../src/lib/query-client'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { I18nManager, Platform, StyleSheet, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StatusBar } from 'expo-status-bar'

import { useSession } from '../src/hooks/useSession'
import { Colors } from '../src/constants/theme'
import * as Linking from 'expo-linking'
import { recoveryTokens } from '../src/lib/recovery'
import { supabase } from '../src/lib/supabase/client'
import { useAuthStore } from '../src/store/auth'
import { useThemeStore } from '../src/store/theme'

// Force RTL at the OS level for Arabic layout
if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true)
  // On Android, a reload is required after flipping RTL
}

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync()

function RootLayoutNav() {
  const { session, isAuthenticated, isDemoMode, isLoading } = useSession()
  const recovering = useAuthStore(state => state.isRecovering)
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (Platform.OS === 'web') return
    let active = true
    let handling = false
    const handle = async (input: string | null) => {
      if (!active || !input || handling) return
      const tokens = recoveryTokens(input)
      if (!tokens) return
      handling = true
      try {
        const { error } = await supabase.auth.setSession(tokens)
        if (!error && active) {
          useAuthStore.setState({ isRecovering: true })
          Linking.clearInitialURL()
          router.replace('/(auth)/reset-password')
        }
      } finally { handling = false }
    }
    Linking.getInitialURL().then(handle).catch(() => {})
    const subscription = Linking.addEventListener('url', event => { handle(event.url).catch(() => {}) })
    return () => { active = false; subscription.remove() }
  }, [router])

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup    = segments[0] === '(auth)'
    const inRecovery = inAuthGroup && segments.join('/') === '(auth)/reset-password'
    if (recovering && !inRecovery) { router.replace('/(auth)/reset-password'); return }

    if (!isAuthenticated && !inAuthGroup) {
      // Not signed in — redirect to login
      router.replace('/(auth)/login')
    } else if (session && !isDemoMode && isAuthenticated && inAuthGroup && !inRecovery) {
      // Signed in but on auth screen — redirect to app
      router.replace('/(tabs)')
    }
  }, [session, isAuthenticated, isDemoMode, isLoading, segments, router, recovering])

  return (
    <Stack key={session?.user.id ?? 'anonymous'} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)"      options={{ animation: 'fade' }} />
      <Stack.Screen name="onboarding"  options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="(tabs)"      options={{ animation: 'fade' }} />
      <Stack.Screen name="goals"       options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="diet"        options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="family"      options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="consultation" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="privacy"     options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="schedule"    options={{ animation: 'slide_from_right' }} />
    </Stack>
  )
}

export default function RootLayout() {
  const themeMode = useThemeStore(s => s.mode)
  const initializeTheme = useThemeStore(s => s.initialize)
  const [fontsLoaded] = useFonts({
    // IBM Plex Arabic — place OTF files in assets/fonts/
    // Download from: https://github.com/IBM/plex/tree/master/packages/ibm-plex-arabic
    'IBMPlexArabic-Light':    require('../assets/fonts/IBMPlexArabic-Light.ttf'),
    'IBMPlexArabic-Regular':  require('../assets/fonts/IBMPlexArabic-Regular.ttf'),
    'IBMPlexArabic-Medium':   require('../assets/fonts/IBMPlexArabic-Medium.ttf'),
    'IBMPlexArabic-SemiBold': require('../assets/fonts/IBMPlexArabic-SemiBold.ttf'),
    'IBMPlexArabic-Bold':     require('../assets/fonts/IBMPlexArabic-Bold.ttf'),
  })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <View style={styles.appShell}>
          <QueryClientProvider client={queryClient}>
            <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
            <RootLayoutNav />
          </QueryClientProvider>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
  },
  appShell: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.background,
    ...Platform.select({
      web: {
        maxWidth: 520,
        alignSelf: 'center',
        boxShadow: '0 0 36px rgba(41, 30, 24, 0.10)',
      },
    }),
  },
})

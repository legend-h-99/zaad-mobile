import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

import { DarkThemeVars, LightThemeVars, ThemeMode } from '../constants/theme'

const THEME_KEY = 'zaad_theme_mode'

const themeStorage = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      return Promise.resolve(globalThis.localStorage?.getItem(key) ?? null)
    }

    return SecureStore.getItemAsync(key)
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(key, value)
      return Promise.resolve()
    }

    return SecureStore.setItemAsync(key, value)
  },
}

function applyThemeVariables(mode: ThemeMode) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return

  const vars = mode === 'dark' ? DarkThemeVars : LightThemeVars
  Object.entries(vars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--zaad-${key}`, value)
  })
  document.documentElement.style.colorScheme = mode
  document.body.dataset.zaadTheme = mode
}

interface ThemeState {
  mode: ThemeMode
  isReady: boolean
  initialize: () => Promise<void>
  setMode: (mode: ThemeMode) => Promise<void>
  toggleMode: () => Promise<void>
}

let _initialized = false

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  isReady: false,

  initialize: async () => {
    if (_initialized) return
    _initialized = true

    const saved = await themeStorage.getItem(THEME_KEY).catch(() => null)
    const mode: ThemeMode = saved === 'dark' ? 'dark' : 'light'
    applyThemeVariables(mode)
    set({ mode, isReady: true })
  },

  setMode: async (mode) => {
    applyThemeVariables(mode)
    set({ mode })
    await themeStorage.setItem(THEME_KEY, mode).catch(() => {})
  },

  toggleMode: async () => {
    const nextMode = get().mode === 'dark' ? 'light' : 'dark'
    await get().setMode(nextMode)
  },
}))

export { applyThemeVariables }

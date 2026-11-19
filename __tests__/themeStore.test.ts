import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { applyThemeVariables, useThemeStore } from '../src/store/theme'

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn().mockResolvedValue('dark'), setItemAsync: jest.fn().mockResolvedValue(undefined) }))

test('theme initializes from secure storage and repeated initialization is harmless', async () => {
  await useThemeStore.getState().initialize()
  expect(useThemeStore.getState()).toMatchObject({ mode: 'dark', isReady: true })
  await useThemeStore.getState().initialize()
  expect(SecureStore.getItemAsync).toHaveBeenCalledTimes(1)
})

test('theme toggles in both directions and persists', async () => {
  await useThemeStore.getState().setMode('light')
  await useThemeStore.getState().toggleMode()
  expect(useThemeStore.getState().mode).toBe('dark')
  await useThemeStore.getState().toggleMode()
  expect(useThemeStore.getState().mode).toBe('light')
})

test('web theme applies variables, color scheme, and the body marker', async () => {
  const platform = jest.replaceProperty(Platform, 'OS', 'web')
  const originalDocument = global.document
  const setProperty = jest.fn()
  const documentMock = { documentElement: { style: { setProperty, colorScheme: '' } }, body: { dataset: {} } }
  Object.defineProperty(global, 'document', { configurable: true, value: documentMock, writable: true })
  const storage = { setItem: jest.fn(), getItem: jest.fn().mockReturnValue('light') }
  Object.defineProperty(global, 'localStorage', { configurable: true, value: storage, writable: true })
  try {
    await useThemeStore.getState().setMode('dark')
    expect(documentMock.documentElement.style.colorScheme).toBe('dark')
    expect(documentMock.body.dataset).toEqual({ zaadTheme: 'dark' })
    expect(setProperty).toHaveBeenCalled()
    applyThemeVariables('light')
    expect(documentMock.documentElement.style.colorScheme).toBe('light')
  } finally { platform.restore(); global.document = originalDocument }
})

/**
 * زاد — Shared page header
 * Shows title + optional back button (RTL: on the left = forward direction).
 * Home button always navigates to (tabs) root.
 */
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { Colors, Typography, Spacing } from '../../constants/theme'

interface AppHeaderProps {
  titleAr: string
  showBack?: boolean
  showHome?: boolean
  rightSlot?: React.ReactNode
}

export function AppHeader({ titleAr, showBack, showHome, rightSlot }: AppHeaderProps) {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1}>{titleAr}</Text>
      </View>

      <TouchableOpacity
        style={styles.brandMark}
        onPress={() => router.replace('/(tabs)')}
        accessibilityRole="button"
        accessibilityLabel="زاد - الصفحة الرئيسية"
      >
        <Text style={styles.brandLetter}>ز</Text>
      </TouchableOpacity>

      <View style={styles.side}>
        {showHome && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.replace('/(tabs)')}
            accessibilityLabel="الصفحة الرئيسية"
          >
            <Feather name="home" size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}
        {rightSlot}
      </View>

      <View style={styles.side}>
        {showBack && router.canGoBack() && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.back()}
            accessibilityLabel="رجوع"
          >
            <Feather name="arrow-right" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        )}
        {!showBack && <View style={{ width: 44 }} />}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingBottom: 12,
    minHeight: 64,
    backgroundColor: Colors.background,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 2 },
      android: { elevation: 0 },
    }),
  },
  titleWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'right',
    paddingHorizontal: Spacing.sm,
  },
  brandMark: {
    position: 'absolute',
    left: '50%',
    bottom: 8,
    width: 44,
    height: 44,
    marginLeft: -22,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  brandLetter: {
    color: Colors.lime,
    fontSize: 23,
    lineHeight: 29,
    fontFamily: Typography.fontFamily.bold,
  },
  side: {
    width: 44,
    alignItems: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
})

import { Tabs } from 'expo-router'
import { Platform, StyleSheet, View, type ColorValue } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'

import { Colors, Typography } from '../../src/constants/theme'

type FeatherName = React.ComponentProps<typeof Feather>['name']

function TabIcon({
  name,
  color,
  focused,
}: {
  name: FeatherName
  color: ColorValue
  focused: boolean
}) {
  return (
    <View style={styles.tabIcon}>
      <Feather name={name} size={22} color={color} />
      {focused && <View style={styles.activeDot} />}
    </View>
  )
}

function TrackIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.trackButton, focused && styles.trackButtonFocused]}>
      <Feather name="plus" size={31} color={Colors.surface} />
    </View>
  )
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSubtle,
        tabBarHideOnKeyboard: true,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 70 + Math.max(insets.bottom, 8),
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ],
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'اليوم',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'صحتي',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="bar-chart-2" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          title: 'أضف',
          tabBarIcon: ({ focused }) => <TrackIcon focused={focused} />,
          tabBarLabelStyle: [styles.label, styles.trackLabel],
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'الوصفات',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="book-open" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'ملفي',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="user" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 8,
    paddingTop: 8,
    paddingHorizontal: 6,
    borderTopWidth: 0,
    borderRadius: 26,
    backgroundColor: Colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#291E18',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: { elevation: 12 },
      web: { boxShadow: '0 10px 30px rgba(41, 30, 24, 0.14)' },
    }),
  },
  item: {
    minHeight: 52,
  },
  label: {
    marginTop: 2,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.medium,
    letterSpacing: 0,
  },
  tabIcon: {
    width: 32,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.lime,
  },
  trackButton: {
    width: 62,
    height: 62,
    marginTop: -29,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.background,
    backgroundColor: Colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 10 },
    }),
  },
  trackButtonFocused: {
    backgroundColor: Colors.primaryDark,
    transform: [{ scale: 1.04 }],
  },
  trackLabel: {
    marginTop: 3,
    color: Colors.primary,
  },
})

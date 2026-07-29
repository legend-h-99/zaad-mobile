import { View, Text, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'

import { Colors, Radius, Spacing, Typography } from '../../constants/theme'

type FeatherName = React.ComponentProps<typeof Feather>['name']

interface PageIntroCardProps {
  kicker: string
  title: string
  body: string
  bullets?: string[]
  icon?: FeatherName
}

interface GuidanceCardProps {
  titleAr: string
  bodyAr: string
  icon?: FeatherName
  tone?: 'primary' | 'amber' | 'safe'
}

export function PageIntroCard({ kicker, title, body, bullets = [], icon = 'compass' }: PageIntroCardProps) {
  return (
    <View style={styles.introCard}>
      <View style={styles.introHeader}>
        <View style={styles.iconBox}>
          <Feather name={icon} size={18} color={Colors.primary} />
        </View>
        <View style={styles.introCopy}>
          <Text style={styles.kicker}>{kicker}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
      <Text style={styles.body}>{body}</Text>
      {bullets.length > 0 && (
        <View style={styles.bulletRow}>
          {bullets.map((bullet) => (
            <View key={bullet} style={styles.bulletPill}>
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

export function GuidanceCard({ titleAr, bodyAr, icon = 'info', tone = 'primary' }: GuidanceCardProps) {
  const colors = tone === 'amber'
    ? { bg: Colors.amberLight, border: Colors.amberBorder, text: Colors.amber }
    : tone === 'safe'
    ? Colors.safe
    : { bg: Colors.primaryLight, border: Colors.primaryBorder, text: Colors.primary }

  return (
    <View style={[styles.guidanceCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <View style={styles.guidanceIcon}>
        <Feather name={icon} size={16} color={colors.text} />
      </View>
      <View style={styles.guidanceCopy}>
        <Text style={[styles.guidanceTitle, { color: colors.text }]}>{titleAr}</Text>
        <Text style={styles.guidanceBody}>{bodyAr}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  introCard: {
    gap: Spacing.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
  },
  introHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
  },
  introCopy: {
    flex: 1,
    alignItems: 'flex-end',
  },
  kicker: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  title: {
    marginTop: 2,
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'right',
    lineHeight: Typography.size.lg * 1.45,
  },
  body: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'right',
    lineHeight: Typography.size.sm * 1.65,
  },
  bulletRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  bulletPill: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
  },
  bulletText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
  },
  guidanceCard: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.xl,
  },
  guidanceIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
  },
  guidanceCopy: {
    flex: 1,
    alignItems: 'flex-end',
  },
  guidanceTitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'right',
  },
  guidanceBody: {
    marginTop: 2,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'right',
    lineHeight: Typography.size.sm * 1.65,
  },
})

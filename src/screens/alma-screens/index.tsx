import { useMemo, useState } from 'react'
import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'

import { AppHeader } from '../../components/ui/AppHeader'
import { PageIntroCard } from '../../components/zaad/ContentBlocks'
import {
  ALMA_REFERENCE_FLOWS,
  ALMA_REFERENCE_SCREENS,
  ZAAD_ALMA_UI_PATTERNS,
  type AlmaReferenceLink,
} from '../../constants/almaDesignReferences'
import { ALMA_IOS_JAN_2026_SCREENS, type AlmaScreenReference } from '../../constants/almaScreens'
import { ZAAD_PAGE_CONTENT } from '../../constants/zaadContent'
import { Colors, Radius, Spacing, Typography } from '../../constants/theme'

const SCREEN_ASPECT_RATIO = 1180 / 2676
const GRID_GAP = Spacing.md
const HORIZONTAL_PADDING = Spacing.base

function toArabicNum(value: number): string {
  return value.toLocaleString('ar-SA')
}

function getTileWidth() {
  const { width } = Dimensions.get('window')
  const availableWidth = width - HORIZONTAL_PADDING * 2 - GRID_GAP
  return Math.floor(availableWidth / 2)
}

function ReferenceRow({ item }: { item: AlmaReferenceLink }) {
  return (
    <Pressable
      style={styles.referenceRow}
      onPress={() => Linking.openURL(item.url)}
      accessibilityRole="link"
      accessibilityLabel={item.titleAr}
    >
      <Feather name="external-link" size={16} color={Colors.textMuted} />
      <View style={styles.referenceText}>
        <Text style={styles.referenceTitle}>{item.titleAr}</Text>
        <Text style={styles.referenceSubtitle}>{item.subtitleAr}</Text>
      </View>
    </Pressable>
  )
}

export function AlmaScreensGallery() {
  const insets = useSafeAreaInsets()
  const [selectedScreen, setSelectedScreen] = useState<AlmaScreenReference | null>(null)
  const tileWidth = useMemo(getTileWidth, [])

  return (
    <>
      <AppHeader titleAr="الشاشات" />
      <FlatList
        data={ALMA_IOS_JAN_2026_SCREENS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing['2xl'] + 72 },
        ]}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={styles.summary}>
              <View style={styles.summaryIcon}>
                <Feather name="layout" size={20} color={Colors.primary} />
              </View>
              <View style={styles.summaryText}>
                <Text style={styles.summaryTitle}>Alma iOS Jan 2026</Text>
                <Text style={styles.summaryMeta}>
                  {toArabicNum(ALMA_IOS_JAN_2026_SCREENS.length)} شاشة + Flows + UI patterns داخل زاد
                </Text>
              </View>
            </View>

            <PageIntroCard
              {...ZAAD_PAGE_CONTENT.references}
              icon="layers"
            />

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Screens المرجعية</Text>
              {ALMA_REFERENCE_SCREENS.map(item => (
                <ReferenceRow key={item.url} item={item} />
              ))}
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Flows المرجعية</Text>
              {ALMA_REFERENCE_FLOWS.map(item => (
                <ReferenceRow key={item.url} item={item} />
              ))}
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>UI Elements المطبقة في زاد</Text>
              {ZAAD_ALMA_UI_PATTERNS.map(pattern => (
                <View key={pattern} style={styles.patternRow}>
                  <View style={styles.patternDot} />
                  <Text style={styles.patternText}>{pattern}</Text>
                </View>
              ))}
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <Pressable
            style={[styles.tile, { width: tileWidth }]}
            onPress={() => setSelectedScreen(item)}
            accessibilityRole="imagebutton"
            accessibilityLabel={`فتح ${item.titleAr}`}
          >
            <Image
              source={item.image}
              style={[styles.thumbnail, { width: tileWidth, height: tileWidth / SCREEN_ASPECT_RATIO }]}
              resizeMode="cover"
            />
            <View style={styles.tileFooter}>
              <Text style={styles.tileTitle}>{item.titleAr}</Text>
              <Text style={styles.tileCount}>{toArabicNum(index + 1)}</Text>
            </View>
          </Pressable>
        )}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={selectedScreen != null}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelectedScreen(null)}
      >
        <View style={[styles.modal, { paddingTop: insets.top + Spacing.sm }]}>
          <View style={styles.modalHeader}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setSelectedScreen(null)}
              accessibilityRole="button"
              accessibilityLabel="إغلاق"
            >
              <Feather name="x" size={22} color={Colors.textPrimary} />
            </Pressable>
            <View style={styles.modalTitleWrap}>
              <Text style={styles.modalTitle}>{selectedScreen?.titleAr}</Text>
              <Text style={styles.modalMeta}>{selectedScreen?.fileName}</Text>
            </View>
          </View>

          {selectedScreen && (
            <FlatList
              data={[selectedScreen]}
              keyExtractor={(item) => `${item.id}-preview`}
              contentContainerStyle={styles.previewContent}
              renderItem={({ item }) => (
                <Image
                  source={item.image}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              )}
            />
          )}
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingTop: Spacing.md,
    paddingHorizontal: HORIZONTAL_PADDING,
    backgroundColor: Colors.background,
    gap: GRID_GAP,
  },
  headerContent: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  summary: {
    minHeight: 72,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  sectionBlock: {
    gap: Spacing.sm,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  sectionTitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  referenceRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  referenceText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  referenceTitle: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  referenceSubtitle: {
    marginTop: 2,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    textAlign: 'right',
    lineHeight: Typography.size.xs * 1.45,
  },
  patternRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  patternDot: {
    width: 7,
    height: 7,
    marginTop: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  patternText: {
    flex: 1,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'right',
    lineHeight: Typography.size.sm * 1.55,
  },
  summaryIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
  },
  summaryText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  summaryTitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  summaryMeta: {
    marginTop: 2,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: GRID_GAP,
  },
  tile: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  thumbnail: {
    backgroundColor: Colors.borderLight,
  },
  tileFooter: {
    minHeight: 42,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
  },
  tileTitle: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  tileCount: {
    minWidth: 28,
    textAlign: 'left',
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSubtle,
  },
  modal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
  },
  modalTitleWrap: {
    flex: 1,
    alignItems: 'flex-end',
    paddingLeft: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  modalMeta: {
    marginTop: 2,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  previewContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  previewImage: {
    width: '100%',
    minHeight: 640,
    flex: 1,
  },
})

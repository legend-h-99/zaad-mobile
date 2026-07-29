/**
 * زاد — Lab Reports screen (tab: التحاليل)
 * In demo mode: shows real lab data from KFSH with PDF-page images.
 * In live mode: camera / file picker → upload → Claude AI analysis.
 */
import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Modal,
  Dimensions,
  Share,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Feather } from '@expo/vector-icons'

import { supabase } from '../../src/lib/supabase/client'
import { useSession } from '../../src/hooks/useSession'
import { useAuthStore } from '../../src/store/auth'
import { uploadAndAnalyzeReport } from '../../src/lib/api/reports'
import { ZaadCard } from '../../src/components/ui/ZaadCard'
import { AppHeader } from '../../src/components/ui/AppHeader'
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme'
import { DEMO_LAB_REPORTS, DEMO_REPORT_IMAGES } from '../../src/constants/demoData'
import type { LabReport, LabFlag } from '../../src/types'

const { width: SCREEN_W } = Dimensions.get('window')

const STATUS_COLORS: Record<LabFlag['status'], string> = {
  normal:           Colors.safe.text,
  watch:            Colors.watch.text,
  nutrition_risk:   Colors.watch.text,
  see_doctor:       Colors.risk.text,
}

const STATUS_BG: Record<LabFlag['status'], string> = {
  normal:           Colors.safe.bg,
  watch:            Colors.watch.bg,
  nutrition_risk:   Colors.watch.bg,
  see_doctor:       Colors.risk.bg,
}

const STATUS_LABELS: Record<LabFlag['status'], string> = {
  normal:           'طبيعي',
  watch:            'تحت المراقبة',
  nutrition_risk:   'يؤثر على خطتك',
  see_doctor:       'راجع طبيبك',
}

// ── Image viewer modal ────────────────────────────────────────────────────────

function ImageViewerModal({
  images,
  visible,
  onClose,
}: {
  images: ImageSourcePropType[]
  visible: boolean
  onClose: () => void
}) {
  const [page, setPage] = useState(0)

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={iv.container}>
        <View style={iv.toolbar}>
          <TouchableOpacity onPress={onClose} style={iv.closeBtn}>
            <Feather name="x" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={iv.pageLabel}>{page + 1} / {images.length}</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={e =>
            setPage(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))
          }
        >
          {images.map((src, i) => (
            <ScrollView key={i} style={{ width: SCREEN_W }} maximumZoomScale={3}>
              <Image source={src} style={iv.pageImage} resizeMode="contain" />
            </ScrollView>
          ))}
        </ScrollView>

        {/* Thumbnail strip */}
        <ScrollView horizontal style={iv.strip} showsHorizontalScrollIndicator={false}>
          {images.map((src, i) => (
            <TouchableOpacity key={i} onPress={() => setPage(i)}>
              <Image
                source={src}
                style={[iv.thumb, i === page && iv.thumbActive]}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  )
}

// ── Report card ───────────────────────────────────────────────────────────────

function ReportCard({
  report,
  images,
}: {
  report: LabReport
  images?: ImageSourcePropType[]
}) {
  const [expanded, setExpanded] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)

  async function shareReport() {
    const date = report.reportDate
      ? new Date(report.reportDate).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
      : ''
    const flags = report.aiAssessment?.flags
      ?.map(f => `• ${f.labelAr}: ${f.value} ${f.unit} — ${STATUS_LABELS[f.status]}`)
      .join('\n') ?? ''
    const message = [
      `📋 ${report.fileName ?? 'تقرير مخبري'}`,
      date ? `📅 ${date}` : '',
      '',
      report.aiAssessment?.summaryAr ?? '',
      flags ? `\n📊 النتائج:\n${flags}` : '',
      report.aiAssessment?.urgentFlags?.length
        ? `\n⚠️ تنبيهات: ${report.aiAssessment.urgentFlags.join(' · ')}`
        : '',
      '',
      '— مشاركة من تطبيق زاد 🌿',
    ].filter(Boolean).join('\n')

    try {
      await Share.share({ message, title: report.fileName ?? 'تقرير مخبري' })
    } catch {
      Alert.alert('تعذّرت المشاركة', 'حاول مجدداً')
    }
  }

  return (
    <ZaadCard style={styles.reportCard}>
      {/* Header */}
      <TouchableOpacity style={styles.reportHeader} onPress={() => setExpanded(!expanded)}>
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={Colors.textMuted}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.reportTitle} numberOfLines={1}>
            {report.fileName ?? 'تقرير مخبري'}
          </Text>
          <Text style={styles.reportDate}>
            {report.reportDate
              ? new Date(report.reportDate).toLocaleDateString('ar-SA', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })
              : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={shareReport} style={styles.reportShareBtn} hitSlop={8}>
          <Feather name="share-2" size={15} color={Colors.primary} />
        </TouchableOpacity>
        <View style={[styles.statusPill,
          { backgroundColor: report.status === 'done' ? Colors.safe.bg : Colors.watch.bg }
        ]}>
          <Text style={[styles.statusText,
            { color: report.status === 'done' ? Colors.safe.text : Colors.watch.text }
          ]}>
            {report.status === 'done' ? 'تم التحليل' : 'جاري...'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Urgent banner */}
      {report.aiAssessment?.urgentFlags && report.aiAssessment.urgentFlags.length > 0 && (
        <View style={styles.urgentBanner}>
          <Feather name="alert-triangle" size={13} color={Colors.risk.text} />
          <Text style={styles.urgentText}>
            {report.aiAssessment.urgentFlags.join(' · ')}
          </Text>
        </View>
      )}

      {/* Summary */}
      {report.aiAssessment?.summaryAr && (
        <Text style={styles.summaryText}>{report.aiAssessment.summaryAr}</Text>
      )}

      {/* Flags */}
      {expanded && report.aiAssessment?.flags && (
        <View style={styles.flagsList}>
          <Text style={styles.flagsTitle}>نتائج التحليل</Text>
          {report.aiAssessment.flags.map((flag, i) => (
            <View key={i} style={[styles.flagRow, { backgroundColor: STATUS_BG[flag.status] }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.flagLabel}>{flag.labelAr}</Text>
                <Text style={styles.flagAdvice}>{flag.adviceAr}</Text>
              </View>
              <View style={styles.flagValueBox}>
                <Text style={[styles.flagValue, { color: STATUS_COLORS[flag.status] }]}>
                  {flag.value} {flag.unit}
                </Text>
                <Text style={[styles.flagStatus, { color: STATUS_COLORS[flag.status] }]}>
                  {STATUS_LABELS[flag.status]}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Document pages thumbnails */}
      {images && images.length > 0 && (
        <View>
          <Text style={styles.pagesTitle}>صور التقرير الأصلي</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pagesStrip}
          >
            {images.slice(0, 4).map((src, i) => (
              <TouchableOpacity key={i} onPress={() => setViewerOpen(true)}>
                <Image source={src} style={styles.pageThumb} resizeMode="cover" />
                {i === 3 && images.length > 4 && (
                  <View style={styles.moreOverlay}>
                    <Text style={styles.moreText}>+{images.length - 4}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {images && (
        <ImageViewerModal
          images={images}
          visible={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </ZaadCard>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function ReportsScreen() {
  const insets = useSafeAreaInsets()
  const { accessToken } = useSession()
  const isDemoMode = useAuthStore(s => s.isDemoMode)
  const queryClient = useQueryClient()

  const [selectedFile, setSelectedFile] = useState<{
    uri: string; name: string; type: string
  } | null>(null)

  // In demo mode use bundled data; in live mode query Supabase
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['lab-reports', isDemoMode],
    queryFn: async () => {
      if (isDemoMode) return DEMO_LAB_REPORTS
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data } = await supabase
        .from('lab_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      return (data ?? []) as unknown as LabReport[]
    },
  })

  const uploadMutation = useMutation({
    mutationFn: () =>
      uploadAndAnalyzeReport({
        uri: selectedFile!.uri,
        fileName: selectedFile!.name,
        mimeType: selectedFile!.type,
        accessToken: accessToken!,
      }),
    onSuccess: () => {
      setSelectedFile(null)
      queryClient.invalidateQueries({ queryKey: ['lab-reports'] })
      Alert.alert('تم التحليل', 'تم تحليل تقريرك المخبري وتحديث خطتك الغذائية')
    },
    onError: err => {
      Alert.alert('خطأ في التحليل', err instanceof Error ? err.message : 'تعذر تحليل التقرير')
    },
  })

  async function pickFromCamera() {
    if (isDemoMode) { Alert.alert('وضع تجريبي', 'رفع التقارير متاح بعد التسجيل'); return }
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') { Alert.alert('إذن الكاميرا', 'يحتاج زاد إذن الكاميرا'); return }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.85 })
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0]
      setSelectedFile({ uri: a.uri, name: `report-${Date.now()}.jpg`, type: 'image/jpeg' })
    }
  }

  async function pickFromGallery() {
    if (isDemoMode) { Alert.alert('وضع تجريبي', 'رفع التقارير متاح بعد التسجيل'); return }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') { Alert.alert('إذن الصور', 'يحتاج زاد الوصول لمكتبة الصور'); return }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.85 })
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0]
      setSelectedFile({ uri: a.uri, name: `report-${Date.now()}.jpg`, type: 'image/jpeg' })
    }
  }

  async function pickDocument() {
    if (isDemoMode) { Alert.alert('وضع تجريبي', 'رفع التقارير متاح بعد التسجيل'); return }
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'], copyToCacheDirectory: true,
    })
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0]
      setSelectedFile({ uri: a.uri, name: a.name, type: a.mimeType ?? 'application/pdf' })
    }
  }

  // Map report id → images array for demo mode
  function imagesForReport(report: LabReport) {
    if (!isDemoMode) return undefined
    if (report.id === 'report-tahaleel-jul26' || report.id === 'report-tahaleel-apr26')
      return DEMO_REPORT_IMAGES.tahaleel as unknown as ImageSourcePropType[]
    if (report.id === 'report-cath-nov22')
      return DEMO_REPORT_IMAGES.taqreer1 as unknown as ImageSourcePropType[]
    if (report.id === 'report-cardiac-eval-feb26')
      return DEMO_REPORT_IMAGES.taqreer2 as unknown as ImageSourcePropType[]
    return undefined
  }

  return (
    <>
    <AppHeader titleAr="التحاليل المخبرية" />
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Spacing.md, paddingBottom: insets.bottom + Spacing['2xl'] },
      ]}
    >
      <ZaadCard style={styles.healthHero} padding="lg">
        <View style={styles.healthHeroTop}>
          <View style={styles.healthScore}>
            <Text style={styles.healthScoreValue}>
              {reports.length ? Math.max(62, 92 - reports.length * 3) : 78}
            </Text>
            <Text style={styles.healthScoreUnit}>/ 100</Text>
          </View>
          <View style={styles.healthHeroCopy}>
            <Text style={styles.healthEyebrow}>ملخص صحتك</Text>
            <Text style={styles.healthTitle}>مؤشراتك الغذائية</Text>
            <Text style={styles.healthSubtitle}>
              {reports.length
                ? `تمت قراءة ${reports.length} تقارير وربطها بخطتك`
                : 'أضف أول تحليل لبناء ملخصك الصحي'}
            </Text>
          </View>
        </View>
        <View style={styles.healthStats}>
          <View style={styles.healthStat}>
            <View style={[styles.statDot, { backgroundColor: Colors.lime }]} />
            <Text style={styles.statValue}>
              {reports.filter(report => report.status === 'done').length}
            </Text>
            <Text style={styles.statLabel}>مكتملة</Text>
          </View>
          <View style={styles.healthStat}>
            <View style={[styles.statDot, { backgroundColor: Colors.amber }]} />
            <Text style={styles.statValue}>
              {reports.reduce((sum, report) =>
                sum + (report.aiAssessment?.flags?.filter(flag => flag.status === 'watch').length ?? 0), 0)}
            </Text>
            <Text style={styles.statLabel}>للمتابعة</Text>
          </View>
          <View style={styles.healthStat}>
            <View style={[styles.statDot, { backgroundColor: Colors.coral }]} />
            <Text style={styles.statValue}>
              {reports.reduce((sum, report) =>
                sum + (report.aiAssessment?.urgentFlags?.length ?? 0), 0)}
            </Text>
            <Text style={styles.statLabel}>تنبيهات</Text>
          </View>
        </View>
      </ZaadCard>

      {/* Upload card */}
      <ZaadCard style={styles.uploadCard}>
        <Text style={styles.uploadTitle}>
          {isDemoMode ? 'إضافة تقرير' : 'إضافة تقرير جديد'}
        </Text>

        {isDemoMode && (
          <View style={styles.demoBanner}>
            <Feather name="info" size={14} color={Colors.primary} />
            <Text style={styles.demoBannerText}>
              وضع تجريبي — التحاليل التالية من ملف حقيقي. سجّل لرفع تقاريرك.
            </Text>
          </View>
        )}

        <View style={styles.uploadOptions}>
          <TouchableOpacity style={styles.uploadOption} onPress={pickFromCamera}>
            <Feather name="camera" size={24} color={Colors.primary} />
            <Text style={styles.uploadOptionText}>تصوير</Text>
          </TouchableOpacity>
          <View style={styles.optionDivider} />
          <TouchableOpacity style={styles.uploadOption} onPress={pickFromGallery}>
            <Feather name="image" size={24} color={Colors.primary} />
            <Text style={styles.uploadOptionText}>الصور</Text>
          </TouchableOpacity>
          <View style={styles.optionDivider} />
          <TouchableOpacity style={styles.uploadOption} onPress={pickDocument}>
            <Feather name="file-text" size={24} color={Colors.primary} />
            <Text style={styles.uploadOptionText}>PDF</Text>
          </TouchableOpacity>
        </View>

        {selectedFile && (
          <View style={styles.selectedFile}>
            <Feather name="check-circle" size={16} color={Colors.primary} />
            <Text style={styles.selectedFileName} numberOfLines={1}>{selectedFile.name}</Text>
            <TouchableOpacity onPress={() => setSelectedFile(null)}>
              <Feather name="x" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {selectedFile && (
          <TouchableOpacity
            style={[styles.analyzeBtn, uploadMutation.isPending && styles.analyzeBtnDisabled]}
            onPress={() => uploadMutation.mutate()}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.analyzeBtnText}>تحليل التقرير</Text>
            }
          </TouchableOpacity>
        )}

        <Text style={styles.uploadHint}>PDF أو صورة (JPG/PNG) — حد أقصى 10MB</Text>
      </ZaadCard>

      {/* Reports list */}
      <Text style={styles.sectionTitle}>التحاليل السابقة</Text>

      {isLoading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      )}

      {!isLoading && reports.length === 0 && (
        <ZaadCard style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🔬</Text>
          <Text style={styles.emptyTitle}>لا توجد تحاليل مرفوعة بعد</Text>
          <Text style={styles.emptySubtitle}>ابدأ بتقرير واحد حديث، حتى لو كان صورة من الجوال. زاد سيحوّله إلى ملاحظات غذائية قابلة للتطبيق.</Text>
        </ZaadCard>
      )}

      {reports.map(report => (
        <ReportCard
          key={report.id}
          report={report}
          images={imagesForReport(report)}
        />
      ))}
    </ScrollView>
    </>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.base, gap: Spacing.md },

  healthHero: {
    gap: Spacing.lg,
    backgroundColor: Colors.primary,
  },
  healthHeroTop: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.base,
  },
  healthHeroCopy: { flex: 1, alignItems: 'flex-end', gap: 2 },
  healthEyebrow: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.lime,
  },
  healthTitle: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.surface,
    textAlign: 'right',
  },
  healthSubtitle: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: '#DCE7D8',
    lineHeight: Typography.size.xs * 1.6,
    textAlign: 'right',
  },
  healthScore: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lime,
  },
  healthScoreValue: {
    fontSize: Typography.size['2xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.burgundy,
    lineHeight: 29,
  },
  healthScoreUnit: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.burgundy,
  },
  healthStats: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.16)',
  },
  healthStat: { alignItems: 'center', minWidth: 64 },
  statDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 3 },
  statValue: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.surface,
  },
  statLabel: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: '#DCE7D8',
  },

  uploadCard: { gap: Spacing.md },
  uploadTitle: {
    fontSize: Typography.size.base,
    fontFamily: 'IBMPlexArabic-Bold',
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  demoBanner: {
    flexDirection: 'row-reverse',
    gap: 6,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'flex-start',
  },
  demoBannerText: {
    flex: 1,
    fontSize: Typography.size.xs,
    fontFamily: 'IBMPlexArabic-Regular',
    color: Colors.primary,
    textAlign: 'right',
    lineHeight: Typography.size.xs * 1.7,
  },
  uploadOptions: {
    flexDirection: 'row-reverse',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  uploadOption: {
    flex: 1, alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: 6, minHeight: 44,
  },
  uploadOptionText: {
    fontSize: Typography.size.xs,
    fontFamily: 'IBMPlexArabic-Medium',
    color: Colors.primary,
  },
  optionDivider: { width: 1, backgroundColor: Colors.border },
  selectedFile: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primaryLight, borderRadius: Radius.md, padding: Spacing.sm,
  },
  selectedFileName: {
    flex: 1, fontSize: Typography.size.sm, color: Colors.primary,
    fontFamily: 'IBMPlexArabic-Regular', textAlign: 'right',
  },
  analyzeBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.lg,
    paddingVertical: Spacing.md, alignItems: 'center',
    minHeight: 44, justifyContent: 'center',
  },
  analyzeBtnDisabled: { opacity: 0.6 },
  analyzeBtnText: {
    color: '#fff', fontSize: Typography.size.base,
    fontFamily: 'IBMPlexArabic-SemiBold',
  },
  uploadHint: {
    fontSize: Typography.size.xs, color: Colors.textSubtle,
    fontFamily: 'IBMPlexArabic-Regular', textAlign: 'center',
  },

  sectionTitle: {
    fontSize: Typography.size.lg, fontFamily: 'IBMPlexArabic-Bold',
    color: Colors.textPrimary, textAlign: 'right', marginTop: Spacing.sm,
  },
  loadingRow: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm,
    justifyContent: 'center', padding: Spacing.xl,
  },
  loadingText: {
    fontSize: Typography.size.sm, color: Colors.textMuted,
    fontFamily: 'IBMPlexArabic-Regular',
  },
  emptyCard: { alignItems: 'center', paddingVertical: Spacing['2xl'] },
  emptyIcon: { fontSize: 40 },
  emptyTitle: {
    fontSize: Typography.size.base, fontFamily: 'IBMPlexArabic-Bold',
    color: Colors.textPrimary, textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.size.sm, color: Colors.textMuted,
    fontFamily: 'IBMPlexArabic-Regular', textAlign: 'center',
  },

  reportCard: { gap: Spacing.sm },
  reportHeader: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm,
  },
  reportTitle: {
    fontSize: Typography.size.sm, fontFamily: 'IBMPlexArabic-SemiBold',
    color: Colors.textPrimary, textAlign: 'right',
  },
  reportDate: {
    fontSize: Typography.size.xs, color: Colors.textMuted,
    fontFamily: 'IBMPlexArabic-Regular', textAlign: 'right', marginTop: 1,
  },
  statusPill: {
    borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2,
  },
  reportShareBtn: {
    width: 28, height: 28, borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  statusText: { fontSize: Typography.size.xs, fontFamily: 'IBMPlexArabic-Medium' },

  urgentBanner: {
    flexDirection: 'row-reverse', gap: 6, alignItems: 'flex-start',
    backgroundColor: Colors.risk.bg, borderRadius: Radius.md, padding: Spacing.sm,
  },
  urgentText: {
    flex: 1, fontSize: Typography.size.xs, fontFamily: 'IBMPlexArabic-Regular',
    color: Colors.risk.text, textAlign: 'right', lineHeight: Typography.size.xs * 1.7,
  },
  summaryText: {
    fontSize: Typography.size.sm, fontFamily: 'IBMPlexArabic-Regular',
    color: Colors.textSecondary, textAlign: 'right',
    lineHeight: Typography.size.sm * 1.75,
  },

  flagsList: { gap: 6, marginTop: Spacing.sm },
  flagsTitle: {
    fontSize: Typography.size.sm, fontFamily: 'IBMPlexArabic-Bold',
    color: Colors.textPrimary, textAlign: 'right', marginBottom: 4,
  },
  flagRow: {
    flexDirection: 'row-reverse', alignItems: 'flex-start',
    borderRadius: Radius.md, padding: Spacing.sm, gap: Spacing.sm,
  },
  flagLabel: {
    fontSize: Typography.size.sm, fontFamily: 'IBMPlexArabic-SemiBold',
    color: Colors.textPrimary, textAlign: 'right',
  },
  flagAdvice: {
    fontSize: Typography.size.xs, fontFamily: 'IBMPlexArabic-Regular',
    color: Colors.textSecondary, textAlign: 'right', marginTop: 2,
    lineHeight: Typography.size.xs * 1.65,
  },
  flagValueBox: { alignItems: 'flex-end', minWidth: 80 },
  flagValue: { fontSize: Typography.size.sm, fontFamily: 'IBMPlexArabic-Bold' },
  flagStatus: { fontSize: Typography.size.xs, fontFamily: 'IBMPlexArabic-Regular' },

  pagesTitle: {
    fontSize: Typography.size.sm, fontFamily: 'IBMPlexArabic-SemiBold',
    color: Colors.textSecondary, textAlign: 'right', marginTop: Spacing.sm,
  },
  pagesStrip: { marginTop: 6 },
  pageThumb: {
    width: 80, height: 110,
    borderRadius: Radius.sm, marginLeft: 8,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  moreOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  moreText: { color: '#fff', fontFamily: 'IBMPlexArabic-Bold', fontSize: 18 },
})

// ── Image viewer styles ───────────────────────────────────────────────────────

const iv = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  closeBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  pageLabel: { color: '#fff', fontFamily: 'IBMPlexArabic-Regular', fontSize: 14 },
  pageImage: { width: SCREEN_W, height: SCREEN_W * 1.4 },
  strip: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 8, paddingHorizontal: 12,
  },
  thumb: {
    width: 48, height: 66, borderRadius: 4, marginRight: 6, opacity: 0.6,
  },
  thumbActive: { opacity: 1, borderWidth: 2, borderColor: '#fff' },
})

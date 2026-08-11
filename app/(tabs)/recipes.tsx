/**
 * زاد — Recipes screen (tab: الوصفات)
 * Browse Saudi/Gulf recipes filtered by the user's conditions.
 * Tap a recipe to see full details and macros.
 */
import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  Modal,
  Pressable,
  Share,
  Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { Feather } from '@expo/vector-icons'

import { supabase } from '../../src/lib/supabase/client'
import { useProfileStore } from '../../src/store/profile'
import { useAuthStore } from '../../src/store/auth'
import { ZaadCard } from '../../src/components/ui/ZaadCard'
import { MacroChip } from '../../src/components/ui/MacroChip'
import { AppHeader } from '../../src/components/ui/AppHeader'
import { GuidanceCard, PageIntroCard } from '../../src/components/zaad/ContentBlocks'
import { ZAAD_PAGE_CONTENT } from '../../src/constants/zaadContent'
import { DIET_TYPES } from '../../src/constants/diets'
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme'
import { REFERENCE_RECIPES } from '../../src/constants/recipeData'
import type { Recipe } from '../../src/types'

const CATEGORY_LABELS: Record<string, string> = {
  all:       'الكل',
  breakfast: 'فطور',
  lunch:     'غداء',
  dinner:    'عشاء',
  snack:     'سناك',
  soup:      'شوربة',
  salad:     'سلطة',
}

const CATEGORY_EMOJIS: Record<string, string> = {
  breakfast: '🌅',
  lunch:     '🍽️',
  dinner:    '🌙',
  snack:     '🍎',
  soup:      '🥣',
  salad:     '🥗',
}

const CATEGORY_IMAGES = {
  breakfast: require('../../assets/meals/yogurt.png'),
  lunch: require('../../assets/meals/chicken.png'),
  dinner: require('../../assets/meals/tuna-salad.png'),
  snack: require('../../assets/meals/dates-walnuts.png'),
  soup: require('../../assets/meals/chicken.png'),
  salad: require('../../assets/meals/tuna-salad.png'),
} as const

const CATEGORIES = Object.keys(CATEGORY_LABELS)

function mapDatabaseRecipe(row: Record<string, unknown>): Recipe {
  return {
    id: row.id as string,
    nameAr: row.name_ar as string,
    nameEn: row.name_en as string | undefined,
    category: row.category as Recipe['category'],
    cuisine: row.cuisine as string,
    prepTimeMin: row.prep_time_min as number | undefined,
    cookTimeMin: row.cook_time_min as number | undefined,
    servings: (row.servings as number | undefined) ?? 1,
    calories: (row.calories as number | undefined) ?? 0,
    proteinG: Number(row.protein_g ?? 0),
    carbsG: Number(row.carbs_g ?? 0),
    fatG: Number(row.fat_g ?? 0),
    fiberG: Number(row.fiber_g ?? 0),
    sodiumMg: Number(row.sodium_mg ?? 0),
    potassiumMg: Number(row.potassium_mg ?? 0),
    suitableFor: (row.suitable_for as Recipe['suitableFor']) ?? [],
    avoidFor: (row.avoid_for as Recipe['avoidFor']) ?? [],
    dietTags: (row.diet_tags as string[] | undefined) ?? [],
    ingredientsAr: (row.ingredients_ar as string[] | undefined) ?? [],
    instructionsAr: row.instructions_ar as string | undefined,
    imageUrl: row.image_url as string | undefined,
  }
}

export default function RecipesScreen() {
  const insets = useSafeAreaInsets()
  const { conditions, preferences } = useProfileStore()
  const isDemoMode = useAuthStore(s => s.isDemoMode)
  const [search, setSearch]         = useState('')
  const [category, setCategory]     = useState('all')
  const [dietFilter, setDietFilter] = useState(preferences?.dietType ?? 'all')
  const [selectedRecipe, setSelected] = useState<Recipe | null>(null)

  useEffect(() => {
    if (preferences?.dietType) setDietFilter(preferences.dietType)
  }, [preferences?.dietType])

  async function shareRecipe(recipe: Recipe) {
    const time = (recipe.prepTimeMin ?? 0) + (recipe.cookTimeMin ?? 0)
    const ingredients = (recipe.ingredientsAr ?? []).map(i => `• ${i}`).join('\n')
    const message = [
      `🥗 ${recipe.nameAr}`,
      `⏱️ ${time} دقيقة  |  🔥 ${recipe.calories} سعرة`,
      '',
      '📋 المكونات:',
      ingredients,
      recipe.instructionsAr ? `\n👨‍🍳 طريقة التحضير:\n${recipe.instructionsAr}` : '',
      '',
      '— مشاركة من تطبيق زاد 🌿',
    ].filter(Boolean).join('\n')

    try {
      await Share.share({ message, title: recipe.nameAr })
    } catch {
      Alert.alert('تعذّرت المشاركة', 'حاول مجدداً')
    }
  }

  const activeConditions = isDemoMode ? [] : conditions
  const conditionKeys = activeConditions.map(c => c.condition)

  const { data: recipes = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['recipes', conditionKeys, isDemoMode],
    queryFn: async () => {
      if (isDemoMode) return REFERENCE_RECIPES
      const q = supabase.from('recipes').select('*').order('name_ar')
      const { data } = await q.limit(100)
      const databaseRecipes = (data ?? []).map(row => mapDatabaseRecipe(row as Record<string, unknown>))
      return databaseRecipes.length > 0 ? databaseRecipes : REFERENCE_RECIPES
    },
    staleTime: 1000 * 60 * 30,
  })

  const filtered = recipes.filter(r => {
    const matchesCategory = category === 'all' || r.category === category
    const matchesSearch = !search.trim()
      || r.nameAr.includes(search)
      || (r.nameEn?.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchesDiet = dietFilter === 'all'
      || !r.dietTags?.length
      || r.dietTags.includes(dietFilter)
    return matchesCategory && matchesSearch && matchesDiet
  })

  const listHeader = (
    <View>
      <View style={styles.header}>
        <Text style={styles.pageSubtitle}>
          وصفات سعودية ومتوسطية وعالمية مناسبة لحميتك وحالتك
        </Text>
      </View>

      <View style={styles.introWrap}>
        <PageIntroCard
          {...ZAAD_PAGE_CONTENT.recipes}
          icon="book-open"
        />
      </View>

      <View style={styles.searchBar}>
        <Feather name="search" size={16} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="ابحث عن وجبة..."
          placeholderTextColor={Colors.textDisabled}
          textAlign="right"
          returnKeyType="search"
        />
        {!!search && (
          <TouchableOpacity
            onPress={() => setSearch('')}
            style={styles.clearSearchBtn}
            accessibilityRole="button"
            accessibilityLabel="مسح البحث"
          >
            <Feather name="x" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
              {CATEGORY_LABELS[cat]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.filterHeading}>
        <Text style={styles.filterHeadingText}>نمط الحمية</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        <TouchableOpacity
          style={[styles.categoryChip, dietFilter === 'all' && styles.categoryChipActive]}
          onPress={() => setDietFilter('all')}
        >
          <Text style={[styles.categoryText, dietFilter === 'all' && styles.categoryTextActive]}>
            جميع الحميات
          </Text>
        </TouchableOpacity>
        {DIET_TYPES.map(diet => (
          <TouchableOpacity
            key={diet.id}
            style={[styles.categoryChip, dietFilter === diet.id && styles.categoryChipActive]}
            onPress={() => setDietFilter(diet.id)}
            accessibilityRole="button"
            accessibilityLabel={`فلترة وصفات ${diet.label}`}
          >
            <Text style={[styles.categoryText, dietFilter === diet.id && styles.categoryTextActive]}>
              {diet.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isError && !isDemoMode && (
        <View style={styles.errorState}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>تعذّر تحميل الوصفات</Text>
          <Text style={styles.errorSub}>تحقق من اتصالك بالإنترنت</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )

  return (
    <View style={styles.screen}>
      <AppHeader titleAr="الوصفات الصحية" />

      {/* ── Recipe grid ── */}
      <FlatList
        data={filtered}
        keyExtractor={r => r.id}
        contentContainerStyle={[
          styles.grid,
          { paddingBottom: insets.bottom + Spacing['2xl'] },
        ]}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={listHeader}
        ListFooterComponent={() => (
          <View style={styles.guidanceWrap}>
            <GuidanceCard
              titleAr="كيف تختار وصفة مناسبة؟"
              bodyAr="ابدأ بالتصنيف، ثم راقب الصوديوم والسعرات، وبعدها اقرأ المكونات. الوصفة المناسبة هي التي يمكنك تكرارها بأمان."
              icon="check-circle"
              tone="safe"
            />
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🥘</Text>
            <Text style={styles.emptyTitle}>
              {isLoading ? 'جاري التحميل...' : 'لا توجد وصفات مطابقة'}
            </Text>
            {!isLoading && (
              <Text style={styles.emptySubtitle}>
                جرّب إزالة البحث أو اختيار تصنيف "الكل" لعرض وصفات زاد المناسبة.
              </Text>
            )}
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.recipeCard}
            onPress={() => setSelected(item)}
            activeOpacity={0.85}
          >
            <View style={styles.recipeImage}>
              <Image
                source={CATEGORY_IMAGES[item.category as keyof typeof CATEGORY_IMAGES] ?? CATEGORY_IMAGES.lunch}
                style={styles.recipePhoto}
                resizeMode="cover"
              />
              {item.sodiumMg && item.sodiumMg < 300 && (
                <View style={styles.lowSodiumBadge}>
                  <Text style={styles.lowSodiumText}>ملح منخفض</Text>
                </View>
              )}
            </View>
            <View style={styles.recipeInfo}>
              <Text style={styles.recipeName} numberOfLines={2}>{item.nameAr}</Text>
              <View style={styles.recipeStats}>
                <Text style={styles.recipeCalories}>{item.calories} سعرة</Text>
                <Text style={styles.recipeTime}>
                  {(item.prepTimeMin ?? 0) + (item.cookTimeMin ?? 0)} د
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* ── Recipe detail modal ── */}
      {selectedRecipe && (
        <Modal
          visible
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelected(null)}
        >
          <View style={[styles.modal, { paddingBottom: insets.bottom + Spacing.xl }]}>
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setSelected(null)}
                style={styles.closeBtn}
              >
                <Feather name="x" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {selectedRecipe.nameAr}
              </Text>
              <TouchableOpacity
                onPress={() => shareRecipe(selectedRecipe)}
                style={styles.shareBtn}
              >
                <Feather name="share-2" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              {/* Time and servings */}
              <View style={styles.recipeMeta}>
                <View style={styles.metaBadge}>
                  <Feather name="clock" size={12} color={Colors.textMuted} />
                  <Text style={styles.metaText}>
                    {(selectedRecipe.prepTimeMin ?? 0) + (selectedRecipe.cookTimeMin ?? 0)} دقيقة
                  </Text>
                </View>
                <View style={styles.metaBadge}>
                  <Feather name="users" size={12} color={Colors.textMuted} />
                  <Text style={styles.metaText}>{selectedRecipe.servings} حصص</Text>
                </View>
              </View>

              {/* Macros */}
              <View style={styles.macrosGrid}>
                <MacroChip type="calorie" value={selectedRecipe.calories} />
                <MacroChip type="protein" value={selectedRecipe.proteinG} />
                <MacroChip type="carbs"   value={selectedRecipe.carbsG} />
                <MacroChip type="fat"     value={selectedRecipe.fatG} />
                {selectedRecipe.sodiumMg && (
                  <MacroChip type="sodium" value={Math.round(selectedRecipe.sodiumMg)} unit="mg" />
                )}
              </View>

              {/* Suitable for */}
              {selectedRecipe.suitableFor.length > 0 && (
                <View style={styles.suitableSection}>
                  <Text style={styles.sectionTitle}>مناسب لـ</Text>
                  <View style={styles.tagRow}>
                    {selectedRecipe.suitableFor.map((c, i) => (
                      <View key={i} style={styles.suitableTag}>
                        <Text style={styles.suitableTagText}>{c}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Ingredients */}
              {selectedRecipe.ingredientsAr && selectedRecipe.ingredientsAr.length > 0 && (
                <View style={styles.recipeSection}>
                  <Text style={styles.sectionTitle}>المكونات</Text>
                  {selectedRecipe.ingredientsAr.map((ing, i) => (
                    <View key={i} style={styles.ingredientRow}>
                      <Text style={styles.ingredientBullet}>·</Text>
                      <Text style={styles.ingredientText}>{ing}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Instructions */}
              {selectedRecipe.instructionsAr && (
                <View style={styles.recipeSection}>
                  <Text style={styles.sectionTitle}>طريقة التحضير</Text>
                  <Text style={styles.instructionsText}>{selectedRecipe.instructionsAr}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm },
  introWrap: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
  },
  guidanceWrap: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  pageTitle: {
    fontSize: Typography.size['2xl'],
    fontFamily: 'IBMPlexArabic-Bold',
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  pageSubtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    fontFamily: 'IBMPlexArabic-Regular',
    textAlign: 'right',
    marginTop: 2,
  },

  searchBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.base,
    minHeight: 44,
    marginBottom: Spacing.md,
  },
  clearSearchBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.size.sm,
    fontFamily: 'IBMPlexArabic-Regular',
    color: Colors.textPrimary,
    minHeight: 44,
    paddingVertical: 0,
  },

  categoryScroll: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
    flexDirection: 'row-reverse',
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    minHeight: 44,
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: Typography.size.sm,
    fontFamily: 'IBMPlexArabic-Medium',
    color: Colors.textSecondary,
  },
  categoryTextActive: { color: '#fff' },
  filterHeading: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xs,
    alignItems: 'flex-end',
  },
  filterHeadingText: {
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
  },

  grid: { paddingHorizontal: Spacing.base, gap: Spacing.md },
  row: { gap: Spacing.md, justifyContent: 'space-between' },

  recipeCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    maxWidth: '48.5%',
    minHeight: 238,
  },
  recipeImage: {
    height: 124,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipePhoto: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  recipeEmoji: { fontSize: 38 },
  lowSodiumBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.safe.bg,
    borderRadius: Radius.full,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.safe.text,
  },
  lowSodiumText: {
    fontSize: 11,
    fontFamily: 'IBMPlexArabic-Medium',
    color: Colors.safe.text,
  },
  recipeInfo: {
    flex: 1,
    minHeight: 104,
    padding: Spacing.md,
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  recipeStats: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  recipeName: {
    fontSize: Typography.size.base,
    fontFamily: 'IBMPlexArabic-SemiBold',
    color: Colors.textPrimary,
    textAlign: 'right',
    lineHeight: Typography.size.base * 1.45,
  },
  recipeCalories: {
    fontSize: Typography.size.xs,
    color: Colors.primary,
    fontFamily: 'IBMPlexArabic-Medium',
    textAlign: 'right',
    flexShrink: 1,
  },
  recipeTime: {
    fontSize: Typography.size.xs,
    color: Colors.textSubtle,
    fontFamily: 'IBMPlexArabic-Regular',
    textAlign: 'right',
    minWidth: 34,
  },

  emptyState: { alignItems: 'center', paddingVertical: Spacing['3xl'], gap: Spacing.md },
  emptyIcon: { fontSize: 48 },
  emptyTitle: {
    fontSize: Typography.size.base,
    fontFamily: 'IBMPlexArabic-Medium',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  emptySubtitle: {
    paddingHorizontal: Spacing.xl,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Typography.size.sm * 1.6,
  },
  errorState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  errorIcon: { fontSize: 40 },
  errorTitle: {
    fontSize: Typography.size.base,
    fontFamily: 'IBMPlexArabic-Bold',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  errorSub: {
    fontSize: Typography.size.sm,
    fontFamily: 'IBMPlexArabic-Regular',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  retryText: {
    fontSize: Typography.size.sm,
    fontFamily: 'IBMPlexArabic-Medium',
    color: '#fff',
  },

  // Modal
  modal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingTop: Spacing.xl,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    flex: 1,
    fontSize: Typography.size.lg,
    fontFamily: 'IBMPlexArabic-Bold',
    color: Colors.textPrimary,
    textAlign: 'right',
    lineHeight: Typography.size.lg * 1.45,
  },
  modalContent: { padding: Spacing.base, paddingBottom: Spacing['3xl'], gap: Spacing.lg },

  recipeMeta: {
    flexDirection: 'row-reverse',
    gap: Spacing.sm,
  },
  metaBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    minHeight: 36,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metaText: {
    fontSize: Typography.size.xs,
    fontFamily: 'IBMPlexArabic-Regular',
    color: Colors.textMuted,
  },

  macrosGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 6,
  },

  suitableSection: { gap: Spacing.sm },
  recipeSection: { gap: Spacing.sm },
  sectionTitle: {
    fontSize: Typography.size.base,
    fontFamily: 'IBMPlexArabic-Bold',
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  tagRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6 },
  suitableTag: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  suitableTagText: {
    fontSize: Typography.size.xs,
    color: Colors.primaryDark,
    fontFamily: 'IBMPlexArabic-Medium',
  },

  ingredientRow: {
    flexDirection: 'row-reverse',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  ingredientBullet: {
    fontSize: Typography.size.base,
    color: Colors.primary,
    lineHeight: Typography.size.base * 1.6,
  },
  ingredientText: {
    flex: 1,
    fontSize: Typography.size.sm,
    fontFamily: 'IBMPlexArabic-Regular',
    color: Colors.textSecondary,
    textAlign: 'right',
    lineHeight: Typography.size.sm * 1.6,
  },

  instructionsText: {
    fontSize: Typography.size.sm,
    fontFamily: 'IBMPlexArabic-Regular',
    color: Colors.textSecondary,
    textAlign: 'right',
    lineHeight: Typography.size.sm * 1.75,
  },
})

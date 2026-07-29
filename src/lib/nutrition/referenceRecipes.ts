import { supabase } from '../supabase/client'
import type { MealItem, MealPlanMeals, Recipe } from '../../types'
import type { DietType } from '../../constants/diets'

type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack'

interface RecipeRow {
  id: string
  name_ar: string
  name_en: string | null
  category: Recipe['category']
  prep_time_min: number | null
  cook_time_min: number | null
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  sodium_mg: number | null
  suitable_for: string[] | null
  avoid_for: string[] | null
  diet_tags: string[] | null
  ingredients_ar: string[] | null
  instructions_ar: string | null
}

const SLOT_CATEGORIES: Record<MealSlot, Recipe['category'][]> = {
  breakfast: ['breakfast'],
  lunch: ['lunch'],
  dinner: ['dinner', 'soup'],
  snack: ['snack', 'salad'],
}

const SLOT_CALORIE_TARGETS: Record<MealSlot, number> = {
  breakfast: 360,
  lunch: 520,
  dinner: 430,
  snack: 180,
}

function numberValue(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function scoreRecipe(recipe: RecipeRow, slot: MealSlot, dietType: DietType) {
  const calories = numberValue(recipe.calories)
  const protein = numberValue(recipe.protein_g)
  const carbs = numberValue(recipe.carbs_g)
  const sodium = numberValue(recipe.sodium_mg)
  const dietTags = recipe.diet_tags ?? []
  const suitableFor = recipe.suitable_for ?? []
  const target = SLOT_CALORIE_TARGETS[slot]

  let score = 100
  score -= Math.abs(calories - target) / 12
  score += Math.min(protein, 45) / 3
  score -= sodium > 700 ? 18 : sodium > 550 ? 8 : 0

  if (dietTags.includes(dietType) || suitableFor.includes(dietType)) score += 30
  if (dietType === 'low_carb') score -= carbs / 6
  if (dietType === 'keto') score -= carbs / 3
  if (dietType === 'high_protein') score += protein / 2
  if (dietType === 'diabetes_friendly') score -= carbs > 55 ? 14 : 0
  if (dietType === 'dash') score -= sodium / 80
  if (dietType === 'vegetarian' && suitableFor.includes('vegetarian')) score += 25
  if (dietType === 'vegan' && suitableFor.includes('vegan')) score += 35
  if (dietType === 'gluten_free' && suitableFor.includes('gluten_free')) score += 25

  return score
}

function chooseRecipe(rows: RecipeRow[], slot: MealSlot, dietType: DietType, usedIds: Set<string>) {
  const categories = SLOT_CATEGORIES[slot]
  const candidates = rows.filter(row => categories.includes(row.category) && !usedIds.has(row.id))
  const pool = candidates.length > 0 ? candidates : rows.filter(row => !usedIds.has(row.id))

  return pool
    .slice()
    .sort((a, b) => scoreRecipe(b, slot, dietType) - scoreRecipe(a, slot, dietType))[0]
}

function mealItem(recipe: RecipeRow): MealItem {
  const sodium = numberValue(recipe.sodium_mg)

  return {
    nameAr: recipe.name_ar,
    nameEn: recipe.name_en ?? recipe.name_ar,
    calories: Math.round(numberValue(recipe.calories)),
    proteinG: numberValue(recipe.protein_g),
    carbsG: numberValue(recipe.carbs_g),
    fatG: numberValue(recipe.fat_g),
    sodiumMg: sodium,
    ingredientsAr: recipe.ingredients_ar ?? [],
    instructionsAr: recipe.instructions_ar ?? 'حضّر الوصفة وفق المكونات الموضحة واضبط الحصة حسب هدفك اليومي.',
    safetyScore: sodium > 700 ? 'suitable_with_notes' : 'suitable',
    safetyReasonAr: sodium > 700
      ? 'الوصفة من مكتبة زاد، لكن الصوديوم أعلى من المعتاد؛ قلل الملح أو صغّر الحصة.'
      : 'الوصفة مختارة من مكتبة زاد المرجعية ومناسبة كبداية ضمن الخطة.',
    alternatives: [],
  }
}

export function buildRecipeMealPlanMeals({
  rows,
  dietType,
  dietLabel,
}: {
  rows: RecipeRow[]
  dietType: DietType
  dietLabel: string
}): MealPlanMeals | null {
  if (rows.length < 4) return null

  const usedIds = new Set<string>()
  const selected = Object.fromEntries(
    (Object.keys(SLOT_CATEGORIES) as MealSlot[]).map(slot => {
      const recipe = chooseRecipe(rows, slot, dietType, usedIds)
      if (recipe) usedIds.add(recipe.id)
      return [slot, recipe ? mealItem(recipe) : null]
    }),
  ) as Record<MealSlot, MealItem | null>

  if (!selected.breakfast || !selected.lunch || !selected.dinner || !selected.snack) return null

  return {
    breakfast: selected.breakfast,
    lunch: selected.lunch,
    dinner: selected.dinner,
    snack: selected.snack,
    notes: `خطة مبنية من وصفات زاد في Supabase. تمت مراعاة نمط ${dietLabel}.`,
  }
}

export async function loadReferenceRecipes(dietType: DietType) {
  let query = supabase
    .from('recipes')
    .select('id, name_ar, name_en, category, prep_time_min, cook_time_min, calories, protein_g, carbs_g, fat_g, sodium_mg, suitable_for, avoid_for, diet_tags, ingredients_ar, instructions_ar')
    .order('name_ar')
    .limit(120)

  if (dietType !== 'balanced') {
    query = query.or(`diet_tags.cs.{${dietType}},suitable_for.cs.{${dietType}}`)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as RecipeRow[]
}

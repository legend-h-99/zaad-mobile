import { DEMO_RECIPES } from '../../constants/demoData'
import { getPlanForDate } from '../../constants/mealSchedule'
import { DIET_TYPES, type DietType } from '../../constants/diets'
import { calculateDailyTargets } from '../nutrition/targets'
import { supabase } from '../supabase/client'
import type { HealthProfile, MealItem, MealPlanMeals, Recipe } from '../../types'

type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack'

const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack']

function parseDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

function recipeById(id: string): Recipe {
  return DEMO_RECIPES.find(recipe => recipe.id === id) ?? DEMO_RECIPES[0]
}

function mealFromRecipe(recipe: Recipe): MealItem {
  return {
    nameAr: recipe.nameAr,
    nameEn: recipe.nameEn ?? recipe.nameAr,
    calories: recipe.calories,
    proteinG: recipe.proteinG,
    carbsG: recipe.carbsG,
    fatG: recipe.fatG,
    sodiumMg: recipe.sodiumMg ?? 0,
    ingredientsAr: recipe.ingredientsAr ?? [],
    instructionsAr: recipe.instructionsAr ?? 'اتبع طريقة التحضير الموصى بها لهذه الوجبة.',
    safetyScore: recipe.avoidFor.length > 0 ? 'suitable_with_notes' : 'suitable',
    safetyReasonAr: recipe.avoidFor.length > 0
      ? 'راجع الملاءمة مع حالتك الصحية وحساسياتك قبل الاعتماد اليومي.'
      : 'مناسبة كنقطة بداية غذائية عامة ضمن خطة زاد.',
    alternatives: [],
  }
}

export function buildLocalMealPlan(
  date: string,
  dietType: DietType,
  profile: Partial<HealthProfile> = {},
): {
  meals: MealPlanMeals
  caloriesTarget: number
  proteinG: number
  carbsG: number
  fatG: number
  sodiumMg: number
  aiNotes: string
} {
  const dayPlan = getPlanForDate(parseDate(date))
  const targets = calculateDailyTargets(profile)
  const dietLabel = DIET_TYPES.find(diet => diet.id === dietType)?.label ?? 'متوازن'
  const recipes = MEAL_SLOTS.map(slot => recipeById(dayPlan[slot]))
  const sodiumMg = recipes.reduce((sum, recipe) => sum + (recipe.sodiumMg ?? 0), 0)

  return {
    meals: {
      breakfast: mealFromRecipe(recipeById(dayPlan.breakfast)),
      lunch: mealFromRecipe(recipeById(dayPlan.lunch)),
      dinner: mealFromRecipe(recipeById(dayPlan.dinner)),
      snack: mealFromRecipe(recipeById(dayPlan.snack)),
      notes: `${dayPlan.noteAr} تم اعتماد نمط ${dietLabel} لهذه الخطة.`,
    },
    caloriesTarget: targets.calories,
    proteinG: targets.protein,
    carbsG: targets.carbs,
    fatG: targets.fat,
    sodiumMg,
    aiNotes: `خطة محلية مبنية من وصفات زاد وفق نمط ${dietLabel}.`,
  }
}

async function saveDietPreference(userId: string, dietType: DietType) {
  const updatedAt = new Date().toISOString()
  const { data: existing, error: selectError } = await supabase
    .from('food_preferences')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (selectError) throw selectError

  if (existing?.id) {
    const { error } = await supabase
      .from('food_preferences')
      .update({ diet_type: dietType, updated_at: updatedAt })
      .eq('id', existing.id)
    if (error) throw error
    return
  }

  const { error } = await supabase
    .from('food_preferences')
    .insert({ user_id: userId, diet_type: dietType, updated_at: updatedAt })
  if (error) throw error
}

async function saveMealPlan(
  userId: string,
  date: string,
  plan: ReturnType<typeof buildLocalMealPlan>,
) {
  const row = {
    user_id: userId,
    plan_date: date,
    calories_target: plan.caloriesTarget,
    protein_g: plan.proteinG,
    carbs_g: plan.carbsG,
    fat_g: plan.fatG,
    sodium_mg: plan.sodiumMg,
    meals: plan.meals,
    ai_notes: plan.aiNotes,
  }

  const { data: existing, error: selectError } = await supabase
    .from('meal_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('plan_date', date)
    .maybeSingle()

  if (selectError) throw selectError

  if (existing?.id) {
    const { error } = await supabase
      .from('meal_plans')
      .update(row)
      .eq('id', existing.id)
    if (error) throw error
    return
  }

  const { error } = await supabase.from('meal_plans').insert(row)
  if (error) throw error
}

export async function saveDietAndGenerateLocalPlan({
  userId,
  date,
  dietType,
  profile,
}: {
  userId: string
  date: string
  dietType: DietType
  profile?: Partial<HealthProfile> | null
}) {
  const plan = buildLocalMealPlan(date, dietType, profile ?? {})
  await saveDietPreference(userId, dietType)
  await saveMealPlan(userId, date, plan)
  return plan
}

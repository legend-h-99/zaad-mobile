import { DEMO_RECIPES } from '../../constants/demoData'
import { getPlanForDate } from '../../constants/mealSchedule'
import { DIET_TYPES, type DietType } from '../../constants/diets'
import { buildReferenceMealPlanMeals, loadReferenceFoodItems } from '../nutrition/referenceFoods'
import { buildRecipeMealPlanMeals, loadReferenceRecipes } from '../nutrition/referenceRecipes'
import { calculateDailyTargets } from '../nutrition/targets'
import { supabase } from '../supabase/client'
import type { HealthProfile, MealItem, MealPlanMeals, Recipe } from '../../types'

type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack'

const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack']

const LOW_FODMAP_MEALS: MealPlanMeals = {
  breakfast: {
    nameAr: 'بيض مخفوق بالسبانخ وخبز خالٍ من الغلوتين',
    nameEn: 'Spinach eggs with gluten-free toast',
    calories: 340, proteinG: 22, carbsG: 26, fatG: 16, sodiumMg: 280,
    ingredientsAr: ['بيض', 'سبانخ', 'خبز خالٍ من الغلوتين', 'زيت زيتون'],
    instructionsAr: 'حضّر البيض مع السبانخ بزيت الزيتون وقدّمه مع الخبز الخالي من الغلوتين.',
    safetyScore: 'suitable',
    safetyReasonAr: 'وجبة مختارة لحمية قليل FODMAP، دون بصل أو ثوم أو ألبان عادية.',
    alternatives: [],
  },
  lunch: {
    nameAr: 'دجاج مشوي مع الأرز والكوسا',
    nameEn: 'Grilled chicken with rice and zucchini',
    calories: 520, proteinG: 44, carbsG: 54, fatG: 15, sodiumMg: 320,
    ingredientsAr: ['صدر دجاج', 'أرز بسمتي', 'كوسا', 'جزر', 'ليمون', 'زيت زيتون'],
    instructionsAr: 'اشوِ الدجاج وتبّله بالليمون والأعشاب، وقدّمه مع الأرز والخضار دون بصل أو ثوم.',
    safetyScore: 'suitable',
    safetyReasonAr: 'وجبة مختارة لحمية قليل FODMAP.',
    alternatives: [],
  },
  dinner: {
    nameAr: 'سمك مشوي مع الكينوا والفاصوليا الخضراء',
    nameEn: 'Grilled fish with quinoa and green beans',
    calories: 430, proteinG: 40, carbsG: 34, fatG: 18, sodiumMg: 290,
    ingredientsAr: ['سمك أبيض', 'كينوا', 'فاصوليا خضراء', 'ليمون', 'زيت زيتون'],
    instructionsAr: 'اشوِ السمك بالليمون وقدّمه مع الكينوا والفاصوليا الخضراء.',
    safetyScore: 'suitable',
    safetyReasonAr: 'وجبة مختارة لحمية قليل FODMAP.',
    alternatives: [],
  },
  snack: {
    nameAr: 'فراولة مع جوز',
    nameEn: 'Strawberries with walnuts',
    calories: 200, proteinG: 5, carbsG: 16, fatG: 14, sodiumMg: 5,
    ingredientsAr: ['فراولة', 'جوز'],
    instructionsAr: 'قدّم الفراولة مع حفنة صغيرة من الجوز.',
    safetyScore: 'suitable',
    safetyReasonAr: 'سناك مختار لحمية قليل FODMAP.',
    alternatives: [],
  },
  notes: 'خطة قليل FODMAP تتجنب البصل والثوم والبقول والحليب العادي والمحليات السكرية عالية الفودماب. المرحلة التقييدية مؤقتة وتُراجع مع أخصائي تغذية.',
}

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
  referenceMeals?: MealPlanMeals | null,
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
  const meals = referenceMeals ?? {
    breakfast: mealFromRecipe(recipeById(dayPlan.breakfast)),
    lunch: mealFromRecipe(recipeById(dayPlan.lunch)),
    dinner: mealFromRecipe(recipeById(dayPlan.dinner)),
    snack: mealFromRecipe(recipeById(dayPlan.snack)),
    notes: `${dayPlan.noteAr} تم اعتماد نمط ${dietLabel} لهذه الخطة.`,
  }
  const sodiumMg = referenceMeals
    ? MEAL_SLOTS.reduce((sum, slot) => sum + meals[slot].sodiumMg, 0)
    : recipes.reduce((sum, recipe) => sum + (recipe.sodiumMg ?? 0), 0)

  return {
    meals,
    caloriesTarget: targets.calories,
    proteinG: targets.protein,
    carbsG: targets.carbs,
    fatG: targets.fat,
    sodiumMg,
    aiNotes: referenceMeals
      ? `خطة محلية مبنية من بيانات Supabase الغذائية وفق نمط ${dietLabel}.`
      : `خطة محلية مبنية من وصفات زاد وفق نمط ${dietLabel}.`,
  }
}

async function tryBuildRecipeMeals(dietType: DietType) {
  try {
    const dietLabel = DIET_TYPES.find(diet => diet.id === dietType)?.label ?? 'متوازن'
    let rows = await loadReferenceRecipes(dietType)

    if (rows.length < 4 && dietType !== 'balanced') {
      rows = await loadReferenceRecipes('balanced')
    }

    return buildRecipeMealPlanMeals({ rows, dietType, dietLabel })
  } catch {
    return null
  }
}

async function tryBuildReferenceMeals(dietType: DietType, profile?: Partial<HealthProfile> | null) {
  try {
    const rows = await loadReferenceFoodItems()
    const dietLabel = DIET_TYPES.find(diet => diet.id === dietType)?.label ?? 'متوازن'
    return buildReferenceMealPlanMeals({ rows, profile, dietLabel })
  } catch {
    return null
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
  const referenceMeals = dietType === 'low_fodmap'
    ? LOW_FODMAP_MEALS
    : await tryBuildRecipeMeals(dietType) ?? await tryBuildReferenceMeals(dietType, profile)
  const plan = buildLocalMealPlan(date, dietType, profile ?? {}, referenceMeals)
  await saveDietPreference(userId, dietType)
  await saveMealPlan(userId, date, plan)
  return plan
}

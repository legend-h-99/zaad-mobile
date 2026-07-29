import { supabase } from '../supabase/client'
import type { HealthProfile, MealItem, MealPlanMeals } from '../../types'

type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack'

interface FoodItemRow {
  external_id: string | null
  name_ar: string
  name_en: string | null
  category: string | null
  cuisine: string | null
  calories_kcal: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  fiber_g: number | null
  sodium_mg: number | null
}

interface MealComponent {
  food: FoodItemRow
  grams: number
}

interface ReferenceMeal {
  slot: MealSlot
  nameAr: string
  nameEn: string
  components: MealComponent[]
}

const ROUND_FIELDS = ['calories', 'proteinG', 'carbsG', 'fatG', 'sodiumMg'] as const

function numberValue(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function scale(value: number | null | undefined, grams: number) {
  return numberValue(value) * (grams / 100)
}

function round(value: number) {
  return Math.round(value * 10) / 10
}

function byExternalId(rows: FoodItemRow[]) {
  return new Map(rows.map(row => [row.external_id, row]).filter(([id]) => Boolean(id)) as [string, FoodItemRow][])
}

function componentLabel({ food, grams }: MealComponent) {
  return `${food.name_ar} ${Math.round(grams)}غ`
}

function total(components: MealComponent[], field: keyof Pick<FoodItemRow, 'calories_kcal' | 'protein_g' | 'carbs_g' | 'fat_g' | 'sodium_mg'>) {
  return components.reduce((sum, component) => sum + scale(component.food[field], component.grams), 0)
}

function mealItem(meal: ReferenceMeal, dietNote: string): MealItem {
  const item = {
    nameAr: meal.nameAr,
    nameEn: meal.nameEn,
    calories: total(meal.components, 'calories_kcal'),
    proteinG: total(meal.components, 'protein_g'),
    carbsG: total(meal.components, 'carbs_g'),
    fatG: total(meal.components, 'fat_g'),
    sodiumMg: total(meal.components, 'sodium_mg'),
    ingredientsAr: meal.components.map(componentLabel),
    instructionsAr: 'قسّم المكونات حسب الحصة الموضحة، واضبط الملح والزيت حسب حالتك الصحية.',
    safetyScore: 'suitable' as const,
    safetyReasonAr: `مبنية من قاعدة الأغذية المرجعية في زاد. ${dietNote}`,
    alternatives: [],
  }

  for (const field of ROUND_FIELDS) {
    item[field] = round(item[field])
  }

  return item
}

function requireFood(index: Map<string | null, FoodItemRow>, id: string) {
  return index.get(id)
}

function buildReferenceMeals(rows: FoodItemRow[], profile: Partial<HealthProfile> = {}): ReferenceMeal[] | null {
  const foods = byExternalId(rows)
  const kabsa = requireFood(foods, 'zaad-sa-kabsa-chicken')
  const jareesh = requireFood(foods, 'zaad-sa-jareesh')
  const foul = requireFood(foods, 'zaad-sa-foul')
  const dates = requireFood(foods, 'zaad-sa-dates')
  const tamees = requireFood(foods, 'zaad-sa-tamees')
  const laban = requireFood(foods, 'zaad-sa-laban-low-fat')
  const fish = requireFood(foods, 'zaad-sa-grilled-fish')
  const lentilSoup = requireFood(foods, 'zaad-sa-lentil-soup')

  if (!foul || !dates || !laban || !fish || !lentilSoup) return null

  const lowerCarb = profile.goal === 'blood_sugar_control'
  const proteinMeal = fish

  return [
    {
      slot: 'breakfast',
      nameAr: lowerCarb || !jareesh ? 'فول ولبن قليل الدسم' : 'جريش خفيف مع لبن',
      nameEn: lowerCarb || !jareesh ? 'Foul with low-fat laban' : 'Light jareesh with laban',
      components: lowerCarb || !jareesh
        ? [
            { food: foul, grams: 170 },
            ...(tamees ? [{ food: tamees, grams: 35 }] : []),
            { food: laban, grams: 180 },
          ]
        : [
            { food: jareesh, grams: 220 },
            { food: laban, grams: 180 },
          ],
    },
    {
      slot: 'lunch',
      nameAr: kabsa && !lowerCarb ? 'كبسة دجاج محسوبة الحصة' : 'سمك مشوي مع لبن',
      nameEn: kabsa && !lowerCarb ? 'Portioned chicken kabsa' : 'Grilled fish with laban',
      components: kabsa && !lowerCarb
        ? [
            { food: kabsa, grams: 280 },
            { food: laban, grams: 120 },
          ]
        : [
            { food: proteinMeal, grams: 220 },
            { food: laban, grams: 160 },
          ],
    },
    {
      slot: 'dinner',
      nameAr: 'شوربة عدس مع بروتين خفيف',
      nameEn: 'Lentil soup with light protein',
      components: [
        { food: lentilSoup, grams: 260 },
        { food: proteinMeal, grams: 90 },
      ],
    },
    {
      slot: 'snack',
      nameAr: 'تمر ولبن',
      nameEn: 'Dates and laban',
      components: [
        { food: dates, grams: lowerCarb ? 18 : 28 },
        { food: laban, grams: 200 },
      ],
    },
  ]
}

export async function loadReferenceFoodItems() {
  const { data, error } = await supabase
    .from('food_items')
    .select('external_id, name_ar, name_en, category, cuisine, calories_kcal, protein_g, carbs_g, fat_g, fiber_g, sodium_mg')
    .eq('country_code', 'SA')
    .order('category')
    .limit(100)

  if (error) throw error
  return (data ?? []) as FoodItemRow[]
}

export function buildReferenceMealPlanMeals({
  rows,
  profile,
  dietLabel,
}: {
  rows: FoodItemRow[]
  profile?: Partial<HealthProfile> | null
  dietLabel: string
}): MealPlanMeals | null {
  const referenceMeals = buildReferenceMeals(rows, profile ?? {})
  if (!referenceMeals) return null

  const dietNote = `تمت مراعاة نمط ${dietLabel}.`
  const meals = Object.fromEntries(
    referenceMeals.map(meal => [meal.slot, mealItem(meal, dietNote)]),
  ) as Pick<MealPlanMeals, MealSlot>

  return {
    ...meals,
    notes: `خطة مبنية من food_items السعودية في Supabase. ${dietNote}`,
  }
}

import { buildRecipeMealPlanMeals, loadReferenceRecipes } from '../src/lib/nutrition/referenceRecipes'
import { loadReferenceFoodItems } from '../src/lib/nutrition/referenceFoods'
import { DIET_TYPES } from '../src/constants/diets'

let mockResult: { data: unknown; error: Error | null } = { data: [], error: null }
const mockOr = jest.fn()
jest.mock('../src/lib/supabase/client', () => ({ supabase: { from: () => ({
  select() { return this }, eq() { return this }, order() { return this }, limit() { return this },
  or(filter: string) { mockOr(filter); return this },
  then(resolve: (result: typeof mockResult) => unknown) { return Promise.resolve(mockResult).then(resolve) },
}) } }))

type Row = Parameters<typeof buildRecipeMealPlanMeals>[0]['rows'][number]
function row(id: string, category: Row['category'], values: Partial<Row> = {}): Row {
  return { id, category, name_ar: id, name_en: null, prep_time_min: null, cook_time_min: null, calories: 400, protein_g: 20, carbs_g: 40, fat_g: 10, sodium_mg: 200, suitable_for: [], avoid_for: [], diet_tags: [], ingredients_ar: null, instructions_ar: null, ...values }
}

test.each(DIET_TYPES.map(diet => diet.id))('builds distinct meal slots and handles diet-specific scoring for %s', dietType => {
  const rows = (['breakfast', 'lunch', 'dinner', 'snack'] as const).flatMap(category => [
    row(category + '-1', category, { suitable_for: [dietType], diet_tags: [dietType], sodium_mg: 800, carbs_g: 70 }),
    row(category + '-2', category, { suitable_for: [dietType], diet_tags: [dietType], sodium_mg: 600, protein_g: 45, carbs_g: 15 }),
  ])
  const plan = buildRecipeMealPlanMeals({ rows, dietType, dietLabel: dietType })!
  const meals = [plan.breakfast, plan.lunch, plan.dinner, plan.snack]
  expect(new Set(meals.map(meal => meal.nameAr)).size).toBe(4)
  expect(meals.every(meal => Number.isFinite(meal.calories))).toBe(true)
  if (dietType === 'low_carb' || dietType === 'keto') expect(meals.every(meal => meal.carbsG === 15)).toBe(true)
})

test('missing numbers and category shortages retain complete, finite meals', () => {
  const rows = ['a', 'b', 'c', 'd'].map(id => row(id, 'lunch', { calories: null, protein_g: NaN, carbs_g: null, sodium_mg: null, diet_tags: null, suitable_for: null }))
  const plan = buildRecipeMealPlanMeals({ rows, dietType: 'balanced', dietLabel: 'متوازن' })!
  expect(plan.breakfast.calories).toBe(0)
  expect(plan.breakfast.proteinG).toBe(0)
  expect(plan.breakfast.ingredientsAr).toEqual([])
  expect(plan.breakfast.instructionsAr).toBeTruthy()
  expect(buildRecipeMealPlanMeals({ rows: [], dietType: 'balanced', dietLabel: '' })).toBeNull()
})

test('high-sodium recipes retain an explicit suitability note', () => {
  const rows = (['breakfast', 'lunch', 'dinner', 'snack'] as const).map(category => row(category, category, { sodium_mg: 900, name_en: 'English', ingredients_ar: ['ingredient'], instructions_ar: 'prepare' }))
  const plan = buildRecipeMealPlanMeals({ rows, dietType: 'balanced', dietLabel: '' })!
  expect(plan.breakfast.safetyScore).toBe('suitable_with_notes')
  expect(plan.breakfast.safetyReasonAr).toContain('الصوديوم')
})

test('catalog queries apply diet filters and propagate database failures', async () => {
  mockResult = { data: null, error: null }; mockOr.mockClear()
  await expect(loadReferenceRecipes('balanced')).resolves.toEqual([])
  expect(mockOr).not.toHaveBeenCalled()
  await loadReferenceRecipes('vegan')
  expect(mockOr).toHaveBeenCalledWith('diet_tags.cs.{vegan},suitable_for.cs.{vegan}')
  await expect(loadReferenceFoodItems()).resolves.toEqual([])
  mockResult = { data: [], error: new Error('permission denied') }
  await expect(loadReferenceRecipes('balanced')).rejects.toThrow('permission denied')
  await expect(loadReferenceFoodItems()).rejects.toThrow('permission denied')
})

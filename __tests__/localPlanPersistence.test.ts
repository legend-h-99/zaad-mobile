import { saveDietAndGenerateLocalPlan } from '../src/lib/meals/localPlan'
import { supabase } from '../src/lib/supabase/client'
import { loadReferenceRecipes, buildRecipeMealPlanMeals } from '../src/lib/nutrition/referenceRecipes'
import { loadReferenceFoodItems, buildReferenceMealPlanMeals } from '../src/lib/nutrition/referenceFoods'

jest.mock('../src/lib/supabase/client', () => ({ supabase: { from: jest.fn() } }))
jest.mock('../src/lib/nutrition/referenceRecipes', () => ({ loadReferenceRecipes: jest.fn(), buildRecipeMealPlanMeals: jest.fn() }))
jest.mock('../src/lib/nutrition/referenceFoods', () => ({ loadReferenceFoodItems: jest.fn(), buildReferenceMealPlanMeals: jest.fn() }))

let existing = false
let failTable = ''
let failOperation = ''
const writes: { table: string; operation: string; row: unknown }[] = []

beforeEach(() => {
  jest.clearAllMocks()
  existing = false; failTable = ''; failOperation = ''; writes.length = 0
  jest.mocked(loadReferenceRecipes).mockResolvedValue([])
  jest.mocked(buildRecipeMealPlanMeals).mockReturnValue(null)
  jest.mocked(loadReferenceFoodItems).mockResolvedValue([])
  jest.mocked(buildReferenceMealPlanMeals).mockReturnValue(null)
  jest.mocked(supabase.from).mockImplementation((table: string) => {
    let operation = 'select'
    const result = () => ({ data: existing ? { id: 'existing' } : null, error: failTable === table && failOperation === operation ? new Error('database failure') : null })
    const query = {
      select() { return this }, eq() { return this }, maybeSingle: async () => result(),
      update(row: unknown) { operation = 'update'; writes.push({ table, operation, row }); return this },
      insert(row: unknown) { operation = 'insert'; writes.push({ table, operation, row }); return this },
      then(resolve: (value: ReturnType<typeof result>) => unknown) { return Promise.resolve(result()).then(resolve) },
    }
    return query as unknown as ReturnType<typeof supabase.from>
  })
})

test.each([false, true])('saves preferences and a complete plan using insert/update (%s)', async update => {
  existing = update
  const plan = await saveDietAndGenerateLocalPlan({ userId: 'patient', date: '2026-11-18', dietType: 'balanced' })
  expect(writes.map(write => write.table)).toEqual(['food_preferences', 'meal_plans'])
  expect(writes.every(write => write.operation === (update ? 'update' : 'insert'))).toBe(true)
  expect(writes[1].row).toMatchObject({ user_id: 'patient', plan_date: '2026-11-18', meals: plan.meals })
})

test.each(['food_preferences', 'meal_plans'])('propagates %s failures for every persistence operation', async table => {
  for (const operation of ['select', 'insert', 'update']) {
    existing = operation === 'update'; failTable = table; failOperation = operation
    await expect(saveDietAndGenerateLocalPlan({ userId: 'patient', date: '2026-11-18', dietType: 'balanced' })).rejects.toThrow('database failure')
  }
})

test('restricted catalog shortages request the balanced catalog before local fallback', async () => {
  await saveDietAndGenerateLocalPlan({ userId: 'patient', date: '2026-11-18', dietType: 'keto' })
  expect(loadReferenceRecipes).toHaveBeenNthCalledWith(1, 'keto')
  expect(loadReferenceRecipes).toHaveBeenNthCalledWith(2, 'balanced')
})

test('catalog failures still produce a usable local plan', async () => {
  jest.mocked(loadReferenceRecipes).mockRejectedValue(new Error('offline'))
  jest.mocked(loadReferenceFoodItems).mockRejectedValue(new Error('offline'))
  await expect(saveDietAndGenerateLocalPlan({ userId: 'patient', date: '2026-11-18', dietType: 'balanced' })).resolves.toMatchObject({ meals: { breakfast: expect.any(Object), dinner: expect.any(Object) } })
})

test('low FODMAP uses the designated meals and sums their sodium', async () => {
  const plan = await saveDietAndGenerateLocalPlan({ userId: 'patient', date: '2026-11-18', dietType: 'low_fodmap' })
  expect(loadReferenceRecipes).not.toHaveBeenCalled()
  expect(plan.sodiumMg).toBe(895)
  expect(plan.meals.notes).toContain('FODMAP')
})

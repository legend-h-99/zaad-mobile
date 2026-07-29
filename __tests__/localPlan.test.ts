import { buildLocalMealPlan } from '../src/lib/meals/localPlan'

jest.mock('../src/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

describe('buildLocalMealPlan', () => {
  it('builds a complete meal plan with all meal slots and macro targets', () => {
    const plan = buildLocalMealPlan('2026-07-29', 'balanced', {
      age: 39,
      gender: 'male',
      heightCm: 170,
      weightKg: 77,
      activityLevel: 'light',
      goal: 'therapeutic',
    })

    expect(plan.meals.breakfast.nameAr).toBeTruthy()
    expect(plan.meals.lunch.nameAr).toBeTruthy()
    expect(plan.meals.dinner.nameAr).toBeTruthy()
    expect(plan.meals.snack.nameAr).toBeTruthy()
    expect(plan.meals.notes).toContain('متوازن')
    expect(plan.caloriesTarget).toBeGreaterThanOrEqual(1200)
    expect(plan.proteinG).toBeGreaterThan(0)
    expect(plan.carbsG).toBeGreaterThan(0)
    expect(plan.fatG).toBeGreaterThan(0)
    expect(plan.sodiumMg).toBeGreaterThanOrEqual(0)
  })
})

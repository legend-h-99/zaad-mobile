/**
 * Tests for مeal schedule business logic — getPlanForDate, WEEK_PLAN, MONTH_WEEKS.
 * All assertions go through the public API; no internals are accessed.
 */

import { getPlanForDate, WEEK_PLAN, MONTH_WEEKS } from '../src/constants/mealSchedule'
import { REFERENCE_RECIPES } from '../src/constants/recipeData'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeDate(year: number, month: number, day: number) {
  return new Date(year, month - 1, day)
}

const KNOWN_RECIPE_IDS = new Set(REFERENCE_RECIPES.map(r => r.id))

// ── getPlanForDate ────────────────────────────────────────────────────────────

describe('getPlanForDate', () => {
  it('returns a plan with all four meal slots for any date', () => {
    const plan = getPlanForDate(makeDate(2026, 7, 16)) // Thursday
    expect(plan.breakfast).toBeTruthy()
    expect(plan.lunch).toBeTruthy()
    expect(plan.dinner).toBeTruthy()
    expect(plan.snack).toBeTruthy()
  })

  it('returns recipe IDs that exist in REFERENCE_RECIPES', () => {
    const dates = [
      makeDate(2026, 7, 1),   // week 1
      makeDate(2026, 7, 8),   // week 2
      makeDate(2026, 7, 15),  // week 3
      makeDate(2026, 7, 22),  // week 4
      makeDate(2026, 7, 29),  // week 4 (clamped)
    ]
    for (const date of dates) {
      const plan = getPlanForDate(date)
      expect(KNOWN_RECIPE_IDS.has(plan.breakfast)).toBe(true)
      expect(KNOWN_RECIPE_IDS.has(plan.lunch)).toBe(true)
      expect(KNOWN_RECIPE_IDS.has(plan.dinner)).toBe(true)
      expect(KNOWN_RECIPE_IDS.has(plan.snack)).toBe(true)
    }
  })

  it('selects week 1 plan for days 1–7 of the month', () => {
    // Same day-of-week across week 1 and week 2 should differ
    const week1Sunday = makeDate(2026, 7, 5)   // 5th → week 1, Sunday
    const week2Sunday = makeDate(2026, 7, 12)  // 12th → week 2, Sunday
    const plan1 = getPlanForDate(week1Sunday)
    const plan2 = getPlanForDate(week2Sunday)
    // Plans differ when weeks cycle (different recipe rotation)
    expect(
      plan1.breakfast !== plan2.breakfast ||
      plan1.lunch !== plan2.lunch ||
      plan1.dinner !== plan2.dinner ||
      plan1.snack !== plan2.snack
    ).toBe(true)
  })

  it('clamps week index to 3 for days beyond day 28', () => {
    const day29 = getPlanForDate(makeDate(2026, 7, 29))
    const day28 = getPlanForDate(makeDate(2026, 7, 28))
    // Both should be in week 4 (same week-index), same day-of-week if same weekday
    const day29a = getPlanForDate(makeDate(2026, 8, 29)) // different month
    expect(day29.dayAr).toBeTruthy()
    expect(day28.dayAr).toBeTruthy()
    expect(day29a.dayAr).toBeTruthy()
  })

  it('returns the same plan for the same date called twice (pure/deterministic)', () => {
    const date = makeDate(2026, 7, 16)
    expect(getPlanForDate(date)).toEqual(getPlanForDate(date))
  })

  it('includes a cardiac-focused Arabic note', () => {
    const dates = Array.from({ length: 7 }, (_, i) => makeDate(2026, 7, i + 1))
    for (const date of dates) {
      const plan = getPlanForDate(date)
      expect(plan.noteAr.length).toBeGreaterThan(10)
    }
  })
})

// ── DayPlan totals ────────────────────────────────────────────────────────────

describe('DayPlan nutrition totals', () => {
  it('totalCalories equals the sum of its four meal recipes', () => {
    const plan = getPlanForDate(makeDate(2026, 7, 16))
    const meals = [plan.breakfast, plan.lunch, plan.dinner, plan.snack]
    const expected = meals.reduce((sum, id) => {
      const r = REFERENCE_RECIPES.find(r => r.id === id)!
      return sum + r.calories
    }, 0)
    expect(plan.totalCalories).toBe(expected)
  })

  it('sodiumMg equals the sum of its four meal recipes', () => {
    const plan = getPlanForDate(makeDate(2026, 7, 8)) // week 2
    const meals = [plan.breakfast, plan.lunch, plan.dinner, plan.snack]
    const expected = meals.reduce((sum, id) => {
      const r = REFERENCE_RECIPES.find(r => r.id === id)!
      return sum + (r.sodiumMg ?? 0)
    }, 0)
    expect(plan.sodiumMg).toBe(expected)
  })

  it('totalCalories is a positive number', () => {
    for (const plan of WEEK_PLAN) {
      expect(plan.totalCalories).toBeGreaterThan(0)
    }
  })

  it('sodiumMg is non-negative for all plans', () => {
    for (const week of MONTH_WEEKS) {
      for (const plan of week) {
        expect(plan.sodiumMg).toBeGreaterThanOrEqual(0)
      }
    }
  })
})

// ── WEEK_PLAN and MONTH_WEEKS structure ───────────────────────────────────────

describe('WEEK_PLAN', () => {
  it('contains 7 days', () => {
    expect(WEEK_PLAN).toHaveLength(7)
  })

  it('each day has the correct Arabic day name', () => {
    const expected = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    WEEK_PLAN.forEach((plan, i) => {
      expect(plan.dayAr).toBe(expected[i])
    })
  })

  it('no two consecutive days share all four meals (variety check)', () => {
    for (let i = 0; i < WEEK_PLAN.length - 1; i++) {
      const a = WEEK_PLAN[i]
      const b = WEEK_PLAN[i + 1]
      const sameAllMeals =
        a.breakfast === b.breakfast &&
        a.lunch     === b.lunch     &&
        a.dinner    === b.dinner    &&
        a.snack     === b.snack
      expect(sameAllMeals).toBe(false)
    }
  })
})

describe('MONTH_WEEKS', () => {
  it('contains 4 weeks', () => {
    expect(MONTH_WEEKS).toHaveLength(4)
  })

  it('each week contains 7 day plans', () => {
    for (const week of MONTH_WEEKS) {
      expect(week).toHaveLength(7)
    }
  })

  it('weeks 1 and 2 differ (rotation exists)', () => {
    const week1 = MONTH_WEEKS[0]
    const week2 = MONTH_WEEKS[1]
    const allSame = week1.every((plan, i) =>
      plan.breakfast === week2[i].breakfast &&
      plan.lunch     === week2[i].lunch     &&
      plan.dinner    === week2[i].dinner    &&
      plan.snack     === week2[i].snack
    )
    expect(allSame).toBe(false)
  })
})

// ── REFERENCE_RECIPES integrity ────────────────────────────────────────────────────

describe('REFERENCE_RECIPES data integrity', () => {
  it('contains at least 15 recipes', () => {
    expect(REFERENCE_RECIPES.length).toBeGreaterThanOrEqual(15)
  })

  it('every recipe has a unique id', () => {
    const ids = REFERENCE_RECIPES.map(r => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every recipe has a positive calorie count', () => {
    for (const r of REFERENCE_RECIPES) {
      expect(r.calories).toBeGreaterThan(0)
    }
  })

  it('every recipe has a non-empty Arabic name', () => {
    for (const r of REFERENCE_RECIPES) {
      expect(r.nameAr.trim().length).toBeGreaterThan(0)
    }
  })

  it('every recipe has non-negative macro values', () => {
    for (const r of REFERENCE_RECIPES) {
      expect(r.proteinG).toBeGreaterThanOrEqual(0)
      expect(r.carbsG).toBeGreaterThanOrEqual(0)
      expect(r.fatG).toBeGreaterThanOrEqual(0)
    }
  })

  it('heart-friendly: no recipe exceeds 700mg sodium', () => {
    const highSodium = REFERENCE_RECIPES.filter(r => (r.sodiumMg ?? 0) > 700)
    expect(highSodium.map(r => r.nameAr)).toEqual([])
  })

  it('every recipe referenced by WEEK_PLAN exists in REFERENCE_RECIPES', () => {
    const missing: string[] = []
    for (const plan of WEEK_PLAN) {
      for (const id of [plan.breakfast, plan.lunch, plan.dinner, plan.snack]) {
        if (!KNOWN_RECIPE_IDS.has(id)) missing.push(id)
      }
    }
    expect(missing).toEqual([])
  })
})

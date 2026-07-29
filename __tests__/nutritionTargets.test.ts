import { calculateDailyTargets, targetsFromCalories } from '../src/lib/nutrition/targets'

describe('nutrition targets', () => {
  it('returns rounded positive targets for a complete profile', () => {
    const targets = calculateDailyTargets({
      age: 30,
      gender: 'female',
      heightCm: 165,
      weightKg: 65,
      activityLevel: 'moderate',
      goal: 'weight_loss',
    })

    expect(targets.calories).toBeGreaterThanOrEqual(1200)
    expect(targets.calories % 50).toBe(0)
    expect(targets.protein).toBeGreaterThan(0)
    expect(targets.carbs).toBeGreaterThan(0)
    expect(targets.fat).toBeGreaterThan(0)
  })

  it('increases calories for weight gain compared with weight loss', () => {
    const base = {
      age: 35,
      gender: 'male' as const,
      heightCm: 175,
      weightKg: 78,
      activityLevel: 'light' as const,
    }

    const loss = calculateDailyTargets({ ...base, goal: 'weight_loss' })
    const gain = calculateDailyTargets({ ...base, goal: 'weight_gain' })

    expect(gain.calories).toBeGreaterThan(loss.calories)
  })

  it('normalizes manually adjusted calories to fifty-calorie steps', () => {
    expect(targetsFromCalories(1830, 70).calories).toBe(1850)
  })
})

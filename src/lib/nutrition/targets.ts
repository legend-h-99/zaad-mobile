import type { ActivityLevel, HealthGoal } from '../../types'

export interface DailyTargets {
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface TargetProfile {
  age?: number
  gender?: 'male' | 'female'
  heightCm?: number
  weightKg?: number
  activityLevel?: ActivityLevel
  goal?: HealthGoal
}

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.35,
  moderate: 1.5,
  active: 1.7,
}

export function calculateDailyTargets(profile: TargetProfile): DailyTargets {
  const age = profile.age ?? 30
  const height = profile.heightCm ?? 170
  const weight = profile.weightKg ?? 70
  const activityFactor = ACTIVITY_FACTORS[profile.activityLevel ?? 'light']
  const base = profile.gender === 'female'
    ? 10 * weight + 6.25 * height - 5 * age - 161
    : 10 * weight + 6.25 * height - 5 * age + 5
  const adjustment = profile.goal === 'weight_loss'
    ? -350
    : profile.goal === 'weight_gain'
      ? 300
      : 0
  const calories = Math.max(1200, Math.round((base * activityFactor + adjustment) / 50) * 50)

  return targetsFromCalories(calories, weight)
}

export function targetsFromCalories(calories: number, weightKg = 70): DailyTargets {
  const normalizedCalories = Math.max(1200, Math.round(calories / 50) * 50)
  return {
    calories: normalizedCalories,
    protein: Math.round(weightKg * 1.45),
    carbs: Math.round((normalizedCalories * 0.43) / 4),
    fat: Math.round((normalizedCalories * 0.29) / 9),
  }
}

/**
 * زاد — Shared constants (ported from web app /lib/utils.ts)
 * These are pure data — no React, no platform imports.
 * Safe to import in both web and mobile.
 */

export const CONDITIONS_AR: Record<string, string> = {
  diabetes_t2:      'السكري النوع الثاني',
  obesity:          'السمنة',
  hypertension:     'ارتفاع الضغط',
  high_cholesterol: 'ارتفاع الدهون',
  fatty_liver:      'الكبد الدهني',
  kidney:           'أمراض الكلى',
  gout:             'النقرس',
  ibs:              'القولون العصبي',
  pregnancy:        'الحمل',
}

export const RESTRICTIONS_AR: Record<string, string> = {
  low_sugar:      'سكر منخفض',
  low_sodium:     'صوديوم منخفض',
  low_fat:        'دهون منخفضة',
  low_purine:     'بيورين منخفض',
  low_potassium:  'بوتاسيوم منخفض',
  low_phosphorus: 'فسفور منخفض',
  high_fiber:     'غني بالألياف',
  high_protein:   'غني بالبروتين',
}

export const ONBOARDING_CONDITIONS = [
  { value: 'diabetes_t2',      labelAr: 'السكري من النوع الثاني', icon: 'droplet' },
  { value: 'hypertension',     labelAr: 'ارتفاع ضغط الدم',       icon: 'heart'   },
  { value: 'high_cholesterol', labelAr: 'ارتفاع الكوليسترول',    icon: 'activity'},
  { value: 'obesity',          labelAr: 'السمنة / زيادة الوزن',  icon: 'scale'   },
  { value: 'fatty_liver',      labelAr: 'الكبد الدهني',          icon: 'zap'     },
  { value: 'ibs',              labelAr: 'القولون العصبي',        icon: 'activity'},
] as const

export const HEALTH_GOALS = [
  { value: 'blood_sugar_control', labelAr: 'ضبط السكر'      },
  { value: 'cholesterol',         labelAr: 'خفض الدهون'      },
  { value: 'therapeutic',         labelAr: 'تغذية علاجية'    },
  { value: 'weight_loss',         labelAr: 'خسارة الوزن'     },
  { value: 'weight_gain',         labelAr: 'زيادة الوزن'     },
] as const

export const CUISINE_TYPES = [
  { value: 'saudi',         labelAr: 'سعودي'   },
  { value: 'gulf',          labelAr: 'خليجي'   },
  { value: 'mediterranean', labelAr: 'متوسطي'  },
  { value: 'vegetarian',    labelAr: 'نباتي'   },
] as const

export const FOOD_ALLERGIES = [
  { value: 'nuts',     labelAr: 'مكسرات'         },
  { value: 'dairy',    labelAr: 'ألبان'            },
  { value: 'gluten',   labelAr: 'جلوتين'          },
  { value: 'seafood',  labelAr: 'مأكولات بحرية'  },
  { value: 'eggs',     labelAr: 'بيض'             },
] as const

export const MEAL_META = {
  breakfast: { labelAr: 'الفطور',  timeAr: 'صباحاً',         icon: 'sunrise' },
  lunch:     { labelAr: 'الغداء',  timeAr: 'ظهراً',           icon: 'sun'     },
  dinner:    { labelAr: 'العشاء',  timeAr: 'مساءً',           icon: 'moon'    },
  snack:     { labelAr: 'السناك',  timeAr: 'وجبة خفيفة',     icon: 'apple'   },
} as const

export type MealKey = keyof typeof MEAL_META
export const MEAL_KEYS: MealKey[] = ['breakfast', 'lunch', 'snack', 'dinner']

// BMI calculation and categorisation
export function calcBMI(weightKg: number, heightCm: number): number | null {
  const h = heightCm / 100
  if (!weightKg || !h || h <= 0) return null
  return Math.round((weightKg / (h * h)) * 10) / 10
}

export function bmiCategory(bmi: number): { labelAr: string; color: string } {
  if (bmi < 18.5) return { labelAr: 'نقص في الوزن', color: '#D97706' }
  if (bmi < 25)   return { labelAr: 'وزن طبيعي',    color: '#16A34A' }
  if (bmi < 30)   return { labelAr: 'زيادة في الوزن',color: '#D97706' }
  return                  { labelAr: 'سمنة',          color: '#DC2626' }
}

// Harris-Benedict caloric needs estimator
export function calcDailyCalories(params: {
  weightKg: number
  heightCm: number
  age: number
  gender: 'male' | 'female'
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active'
}): number {
  const { weightKg, heightCm, age, gender, activityLevel } = params
  const bmr = gender === 'male'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161

  const factors = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 }
  return Math.round(bmr * factors[activityLevel])
}

export function toggleArrayItem<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter(x => x !== value) : [...list, value]
}

// Lab value status thresholds (mirrors web app analyze-report.ts rules)
export const LAB_THRESHOLDS = {
  hba1c:       { watch: 5.7, risk: 7.0, critical: 9.0 },
  fbs:         { watch: 100, risk: 126, critical: 200 },
  ldl:         { watch: 100, risk: 130, critical: 160 },
  triglycerides:{ watch: 150,risk: 200, critical: 500 },
  potassium:   { watch: 5.0, risk: 5.5, critical: 6.0 },
  creatinine:  { maleRisk: 1.3, femaleRisk: 1.1, critical: 2.0 },
  egfr:        { risk: 60, critical: 30 },
  uricAcid:    { risk: 7.0, critical: 9.0 },
  vitaminD:    { critical: 20, watch: 30 },
} as const

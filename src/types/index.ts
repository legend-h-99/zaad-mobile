/**
 * زاد — Shared TypeScript types
 * Mirrors the Supabase schema and web app interfaces exactly.
 * Import these in both mobile and (future) shared package.
 */

// ── Health Profile ────────────────────────────────────────────────────────────

export interface HealthProfile {
  id: string
  userId: string
  fullName: string
  age?: number
  gender?: 'male' | 'female'
  heightCm?: number
  weightKg?: number
  waistCm?: number
  goal?: HealthGoal
  activityLevel?: ActivityLevel
  city?: string
  foodBudgetDaily?: number
  createdAt: string
  updatedAt: string
}

export type HealthGoal =
  | 'weight_loss'
  | 'weight_gain'
  | 'blood_sugar_control'
  | 'cholesterol'
  | 'energy'
  | 'therapeutic'

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active'

// ── Multi-profile Accounts ──────────────────────────────────────────────────

export interface PatientProfile {
  id: string
  ownerUserId: string
  displayName: string
  fullName?: string
  age?: number
  gender?: 'male' | 'female'
  heightCm?: number
  weightKg?: number
  waistCm?: number
  goal?: HealthGoal
  activityLevel?: ActivityLevel
  city?: string
  foodBudgetDaily?: number
  relationship?: string
  isPrimary: boolean
  createdAt: string
  updatedAt: string
  archivedAt?: string
}

export interface ProfileMembership {
  id: string
  profileId: string
  userId: string
  role: 'owner' | 'caregiver' | 'dietitian'
  relationship?: string
  permissions: Record<string, boolean>
  createdAt: string
  revokedAt?: string
}

// ── Medical Conditions ────────────────────────────────────────────────────────

export type ConditionKey =
  | 'diabetes_t2'
  | 'obesity'
  | 'hypertension'
  | 'high_cholesterol'
  | 'fatty_liver'
  | 'kidney'
  | 'gout'
  | 'ibs'
  | 'pregnancy'

export interface MedicalCondition {
  id: string
  userId: string
  condition: ConditionKey
  severity?: 'mild' | 'moderate' | 'severe'
  diagnosedAt?: string
  notes?: string
  createdAt: string
}

// ── Medications ───────────────────────────────────────────────────────────────

export interface Medication {
  id: string
  userId: string
  name: string
  nameAr?: string
  dosage?: string
  frequency?: string
  nutritionImpact?: MedicationNutritionImpact
  createdAt: string
}

export interface MedicationNutritionImpact {
  nutrient: string
  impact: string
  adviceAr: string
}

// ── Lab Reports ───────────────────────────────────────────────────────────────

export interface LabReport {
  id: string
  userId: string
  reportDate?: string
  fileUrl?: string
  fileName?: string
  rawText?: string
  extractedValues?: LabValues | null
  aiAssessment?: LabAssessment | null
  nutritionFlags?: { restrictions: string[]; urgent: string[] } | null
  status: 'processing' | 'done' | 'error'
  createdAt: string
}

export interface LabValues {
  // Sugar
  fbs?: number        // fasting blood sugar mg/dL
  hba1c?: number      // %
  insulin?: number
  // Lipids
  cholesterol?: number
  ldl?: number
  hdl?: number
  triglycerides?: number
  // Kidney
  creatinine?: number
  egfr?: number
  urea?: number
  potassium?: number
  sodium?: number
  // Liver
  alt?: number
  ast?: number
  ggt?: number
  // Blood
  hemoglobin?: number
  ferritin?: number
  b12?: number
  vitaminD?: number
  // Inflammation
  crp?: number
  esr?: number
  // Other
  uricAcid?: number
  tsh?: number
}

export interface LabAssessment {
  values: LabValues
  flags: LabFlag[]
  nutritionRestrictions: string[]
  urgentFlags: string[]
  summaryAr: string
}

export interface LabFlag {
  key: string
  value: number
  unit: string
  status: 'normal' | 'watch' | 'nutrition_risk' | 'see_doctor'
  labelAr: string
  adviceAr: string
}

export interface LabObservation {
  id: string
  profileId: string
  reportId?: string
  markerKey: string
  labelAr?: string
  value: number
  unit?: string
  status?: LabFlag['status']
  observedAt: string
  source?: string
  createdAt: string
}

// ── Meal Plans ────────────────────────────────────────────────────────────────

export interface MealPlan {
  id: string
  userId: string
  planDate: string
  caloriesTarget?: number
  proteinG?: number
  carbsG?: number
  fatG?: number
  sodiumMg?: number
  meals: MealPlanMeals
  aiNotes?: string
  createdAt: string
}

export interface MealPlanMeals {
  breakfast: MealItem
  lunch: MealItem
  dinner: MealItem
  snack: MealItem
  notes: string
}

export interface MealItem {
  nameAr: string
  nameEn: string
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  sodiumMg: number
  ingredientsAr: string[]
  instructionsAr: string
  safetyScore: 'suitable' | 'suitable_with_notes' | 'avoid'
  safetyReasonAr: string
  alternatives: string[]
}

// ── Recipes ───────────────────────────────────────────────────────────────────

export interface Recipe {
  id: string
  nameAr: string
  nameEn?: string
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'soup' | 'salad'
  cuisine: string
  prepTimeMin?: number
  cookTimeMin?: number
  servings: number
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  fiberG?: number
  sodiumMg?: number
  potassiumMg?: number
  suitableFor: ConditionKey[]
  avoidFor: ConditionKey[]
  dietTags?: string[]
  ingredientsAr?: string[]
  instructionsAr?: string
  imageUrl?: string
}

// ── Progress Logs ─────────────────────────────────────────────────────────────

export interface ProgressLog {
  id: string
  userId: string
  logDate: string
  weightKg?: number
  waistCm?: number
  glucoseMg?: number
  bloodPressureSys?: number
  bloodPressureDia?: number
  mealsFollowed?: boolean
  notes?: string
  createdAt: string
}

export interface HealthMeasurement {
  id: string
  profileId: string
  measurementType: string
  value: number
  unit?: string
  measuredAt: string
  source?: string
  notes?: string
  createdAt: string
}

// ── Food Preferences ──────────────────────────────────────────────────────────

export interface FoodPreferences {
  id: string
  userId: string
  dietType?: string
  cuisineTypes?: string[]
  allergies?: string[]
  dislikes?: string[]
  preferredProtein?: string[]
  updatedAt: string
}

// ── Onboarding State ──────────────────────────────────────────────────────────

export interface OnboardingData {
  conditions: ConditionKey[]
  profile: {
    age: string
    gender: '' | 'male' | 'female'
    heightCm: string
    weightKg: string
    city: string
    goal: string
  }
  preferences: {
    cuisineTypes: string[]
    allergies: string[]
  }
  labFile: {
    uri: string
    name: string
    type: string
  } | null
  labAnalyzed: boolean
}

// ── API Response types ────────────────────────────────────────────────────────

export interface ApiError {
  error: string
  code?: string
}

export interface GenerateMealPlanResponse {
  meals: MealPlanMeals
}

export interface AnalyzeReportResponse {
  assessment: LabAssessment
  reportId: string
}

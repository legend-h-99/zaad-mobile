/**
 * زاد — Profile store (Zustand)
 * Caches the user's health profile and conditions in memory.
 * Supabase is the source of truth; this is the read-through cache.
 */
import { create } from 'zustand'
import type { HealthProfile, MedicalCondition, FoodPreferences, Medication } from '../types'
import { supabase } from '../lib/supabase/client'

interface ProfileState {
  profile: HealthProfile | null
  conditions: MedicalCondition[]
  preferences: FoodPreferences | null
  medications: Medication[]
  isLoading: boolean
  error: string | null

  // Actions
  loadProfile: (userId: string) => Promise<void>
  clearProfile: () => void
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  conditions: [],
  preferences: null,
  medications: [],
  isLoading: false,
  error: null,

  loadProfile: async (userId: string) => {
    set({ isLoading: true, error: null })
    try {
      const [profileRes, conditionsRes, prefsRes, medsRes] = await Promise.all([
        supabase
          .from('health_profiles')
          .select('*')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('medical_conditions')
          .select('*')
          .eq('user_id', userId),
        supabase
          .from('food_preferences')
          .select('*')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('medications')
          .select('*')
          .eq('user_id', userId),
      ])

      set({
        profile: profileRes.data ? mapProfile(profileRes.data) : null,
        conditions: conditionsRes.data?.map(mapCondition) ?? [],
        preferences: prefsRes.data ? mapPreferences(prefsRes.data) : null,
        medications: medsRes.data?.map(mapMedication) ?? [],
        isLoading: false,
      })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'خطأ في تحميل الملف الشخصي',
        isLoading: false,
      })
    }
  },

  clearProfile: () =>
    set({
      profile: null,
      conditions: [],
      preferences: null,
      medications: [],
      error: null,
    }),
}))

// ── Mapping from snake_case DB → camelCase TS ─────────────────────────────────

function mapProfile(row: Record<string, unknown>): HealthProfile {
  return {
    id:              row.id as string,
    userId:          row.user_id as string,
    fullName:        row.full_name as string,
    age:             row.age as number | undefined,
    gender:          row.gender as 'male' | 'female' | undefined,
    heightCm:        row.height_cm as number | undefined,
    weightKg:        row.weight_kg as number | undefined,
    waistCm:         row.waist_cm as number | undefined,
    goal:            row.goal as HealthProfile['goal'],
    activityLevel:   row.activity_level as HealthProfile['activityLevel'],
    city:            row.city as string | undefined,
    foodBudgetDaily: row.food_budget_daily as number | undefined,
    createdAt:       row.created_at as string,
    updatedAt:       row.updated_at as string,
  }
}

function mapCondition(row: Record<string, unknown>): MedicalCondition {
  return {
    id:          row.id as string,
    userId:      row.user_id as string,
    condition:   row.condition as MedicalCondition['condition'],
    severity:    row.severity as MedicalCondition['severity'],
    diagnosedAt: row.diagnosed_at as string | undefined,
    notes:       row.notes as string | undefined,
    createdAt:   row.created_at as string,
  }
}

function mapPreferences(row: Record<string, unknown>): FoodPreferences {
  return {
    id:              row.id as string,
    userId:          row.user_id as string,
    dietType:        row.diet_type as string | undefined,
    cuisineTypes:    row.cuisine_types as string[] | undefined,
    allergies:       row.allergies as string[] | undefined,
    dislikes:        row.dislikes as string[] | undefined,
    preferredProtein:row.preferred_protein as string[] | undefined,
    updatedAt:       row.updated_at as string,
  }
}

function mapMedication(row: Record<string, unknown>): Medication {
  return {
    id:              row.id as string,
    userId:          row.user_id as string,
    name:            row.name as string,
    nameAr:          row.name_ar as string | undefined,
    dosage:          row.dosage as string | undefined,
    frequency:       row.frequency as string | undefined,
    nutritionImpact: row.nutrition_impact as Medication['nutritionImpact'],
    createdAt:       row.created_at as string,
  }
}

import { buildReferenceMealPlanMeals } from '../src/lib/nutrition/referenceFoods'

jest.mock('../src/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

const referenceRows = [
  { external_id: 'zaad-sa-foul', name_ar: 'فول مدمس', name_en: 'Fava bean stew', category: 'legumes', cuisine: 'saudi', calories_kcal: 110, protein_g: 7.5, carbs_g: 17.5, fat_g: 1, fiber_g: 5.4, sodium_mg: 180 },
  { external_id: 'zaad-sa-jareesh', name_ar: 'جريش', name_en: 'Jareesh', category: 'grain_dish', cuisine: 'saudi', calories_kcal: 118, protein_g: 4.2, carbs_g: 20.5, fat_g: 2.1, fiber_g: 2.7, sodium_mg: 160 },
  { external_id: 'zaad-sa-dates', name_ar: 'تمر', name_en: 'Dates', category: 'fruit', cuisine: 'saudi', calories_kcal: 277, protein_g: 1.8, carbs_g: 75, fat_g: 0.2, fiber_g: 6.7, sodium_mg: 1 },
  { external_id: 'zaad-sa-laban-low-fat', name_ar: 'لبن قليل الدسم', name_en: 'Low-fat laban', category: 'dairy', cuisine: 'saudi', calories_kcal: 45, protein_g: 3.4, carbs_g: 4.8, fat_g: 1.5, fiber_g: 0, sodium_mg: 45 },
  { external_id: 'zaad-sa-grilled-fish', name_ar: 'سمك مشوي', name_en: 'Grilled fish', category: 'protein', cuisine: 'saudi', calories_kcal: 145, protein_g: 24, carbs_g: 0, fat_g: 5, fiber_g: 0, sodium_mg: 95 },
  { external_id: 'zaad-sa-lentil-soup', name_ar: 'شوربة عدس', name_en: 'Lentil soup', category: 'soup', cuisine: 'saudi', calories_kcal: 95, protein_g: 5.8, carbs_g: 14, fat_g: 2, fiber_g: 4, sodium_mg: 140 },
  { external_id: 'zaad-sa-tamees', name_ar: 'تميس', name_en: 'Tamees bread', category: 'bread', cuisine: 'saudi', calories_kcal: 285, protein_g: 8.5, carbs_g: 55, fat_g: 3.5, fiber_g: 2.4, sodium_mg: 410 },
  { external_id: 'zaad-sa-kabsa-chicken', name_ar: 'كبسة دجاج', name_en: 'Chicken kabsa', category: 'composite_dish', cuisine: 'saudi', calories_kcal: 165, protein_g: 12, carbs_g: 19, fat_g: 4.2, fiber_g: 1.1, sodium_mg: 250 },
]

describe('reference food meal plan', () => {
  it('builds complete meals from food_items rows', () => {
    const meals = buildReferenceMealPlanMeals({
      rows: referenceRows,
      dietLabel: 'متوازن',
      profile: { goal: 'therapeutic' },
    })

    expect(meals?.breakfast.nameAr).toContain('جريش')
    expect(meals?.lunch.nameAr).toContain('كبسة')
    expect(meals?.dinner.proteinG).toBeGreaterThan(30)
    expect(meals?.snack.ingredientsAr.join('،')).toContain('تمر')
    expect(meals?.notes).toContain('food_items')
  })

  it('switches to a lower-carb breakfast and lunch for blood sugar control', () => {
    const meals = buildReferenceMealPlanMeals({
      rows: referenceRows,
      dietLabel: 'منخفض الكربوهيدرات',
      profile: { goal: 'blood_sugar_control' },
    })

    expect(meals?.breakfast.nameAr).toContain('فول')
    expect(meals?.lunch.nameAr).toContain('سمك')
    expect(meals?.snack.carbsG).toBeLessThan(25)
  })
})

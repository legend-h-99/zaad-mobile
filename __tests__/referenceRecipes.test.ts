import { buildRecipeMealPlanMeals } from '../src/lib/nutrition/referenceRecipes'

type TestRecipeRow = Parameters<typeof buildRecipeMealPlanMeals>[0]['rows'][number]

jest.mock('../src/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

const recipeRows: TestRecipeRow[] = [
  {
    id: 'breakfast-1',
    name_ar: 'جريش خفيف',
    name_en: 'Light jareesh',
    category: 'breakfast',
    prep_time_min: 10,
    cook_time_min: 30,
    calories: 360,
    protein_g: 18,
    carbs_g: 48,
    fat_g: 9,
    sodium_mg: 360,
    suitable_for: ['balanced'],
    avoid_for: [],
    diet_tags: ['balanced'],
    ingredients_ar: ['جريش', 'لبن'],
    instructions_ar: 'يطهى الجريش ببطء.',
  },
  {
    id: 'lunch-1',
    name_ar: 'مطازيز',
    name_en: 'Mutaziz',
    category: 'lunch',
    prep_time_min: 40,
    cook_time_min: 70,
    calories: 520,
    protein_g: 25,
    carbs_g: 64,
    fat_g: 18,
    sodium_mg: 680,
    suitable_for: ['balanced'],
    avoid_for: [],
    diet_tags: ['balanced'],
    ingredients_ar: ['لحم', 'خضار', 'عجين بر'],
    instructions_ar: 'تطهى المطازيز في الصلصة.',
  },
  {
    id: 'dinner-1',
    name_ar: 'شوربة الجمبري',
    name_en: 'Shrimp soup',
    category: 'soup',
    prep_time_min: 15,
    cook_time_min: 25,
    calories: 240,
    protein_g: 26,
    carbs_g: 20,
    fat_g: 7,
    sodium_mg: 560,
    suitable_for: ['balanced', 'high_protein'],
    avoid_for: [],
    diet_tags: ['balanced', 'high_protein'],
    ingredients_ar: ['جمبري', 'طماطم'],
    instructions_ar: 'تطهى الشوربة حتى ينضج الجمبري.',
  },
  {
    id: 'snack-1',
    name_ar: 'هريس المانجو',
    name_en: 'Mango harees',
    category: 'snack',
    prep_time_min: 15,
    cook_time_min: 20,
    calories: 260,
    protein_g: 5,
    carbs_g: 48,
    fat_g: 6,
    sodium_mg: 120,
    suitable_for: ['balanced', 'vegetarian'],
    avoid_for: [],
    diet_tags: ['balanced', 'vegetarian'],
    ingredients_ar: ['مانجو', 'حليب'],
    instructions_ar: 'يخلط الهريس مع المانجو.',
  },
]

describe('reference recipe meal plan', () => {
  it('builds all meal slots from Supabase recipe rows', () => {
    const meals = buildRecipeMealPlanMeals({
      rows: [...recipeRows],
      dietType: 'balanced',
      dietLabel: 'متوازن',
    })

    expect(meals?.breakfast.nameAr).toBe('جريش خفيف')
    expect(meals?.lunch.nameAr).toBe('مطازيز')
    expect(meals?.dinner.nameAr).toBe('شوربة الجمبري')
    expect(meals?.snack.nameAr).toBe('هريس المانجو')
    expect(meals?.notes).toContain('وصفات زاد')
  })
})

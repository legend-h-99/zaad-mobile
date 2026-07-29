/**
 * زاد — Demo account data
 * Real lab data from King Faisal Specialist Hospital & Research Centre.
 * Patient: HFrEF + DCM with ICD & CardioMEMS implant.
 */
import type { LabReport, HealthProfile, MedicalCondition, ProgressLog } from '../types'

// ── Demo user identity ────────────────────────────────────────────────────────

export const DEMO_USER_ID = 'demo-hussam-2026'
export type DemoUserId =
  | 'demo-hussam-2026'
  | 'demo-noura-2026'
  | 'demo-fahad-2026'
  | 'demo-layla-2026'

export interface DemoUserOption {
  id: DemoUserId
  nameAr: string
  labelAr: string
  cityAr: string
  summaryAr: string
  icon: string
}

export const DEMO_USERS: DemoUserOption[] = [
  {
    id: 'demo-hussam-2026',
    nameAr: 'حسام',
    labelAr: 'قلب وضغط',
    cityAr: 'الرياض',
    summaryAr: 'قصور قلب، جهاز ICD وCardioMEMS، هدفه ضبط الصوديوم والوزن.',
    icon: 'ق',
  },
  {
    id: 'demo-noura-2026',
    nameAr: 'نورة',
    labelAr: 'سكري نوع ٢',
    cityAr: 'جدة',
    summaryAr: 'تركز على سكر الدم، اختيار الكارب الذكي، ووجبات عملية للدوام.',
    icon: 'س',
  },
  {
    id: 'demo-fahad-2026',
    nameAr: 'فهد',
    labelAr: 'كوليسترول وضغط',
    cityAr: 'الدمام',
    summaryAr: 'يريد أكل خليجي أخف، دهون مشبعة أقل، ومتابعة ضغط أسبوعية.',
    icon: 'ض',
  },
  {
    id: 'demo-layla-2026',
    nameAr: 'ليلى',
    labelAr: 'نزول وزن',
    cityAr: 'المدينة',
    summaryAr: 'هدفها نزول وزن تدريجي مع وصفات مشبعة وسناك منظم.',
    icon: 'و',
  },
]

export const DEMO_PROFILE: HealthProfile = {
  id:         'demo-profile-1',
  userId:     DEMO_USER_ID,
  fullName:   'حسام الدين المسملي',
  age:        39,
  gender:     'male',
  heightCm:   170,
  weightKg:   77,
  goal:       'therapeutic',
  activityLevel: 'sedentary',
  city:       'الرياض',
  createdAt:  '2026-01-01T00:00:00Z',
  updatedAt:  '2026-07-02T00:00:00Z',
}

export const DEMO_PROFILES: Record<DemoUserId, HealthProfile> = {
  'demo-hussam-2026': DEMO_PROFILE,
  'demo-noura-2026': {
    id: 'demo-profile-noura',
    userId: 'demo-noura-2026',
    fullName: 'نورة عبدالله',
    age: 46,
    gender: 'female',
    heightCm: 162,
    weightKg: 83,
    goal: 'blood_sugar_control',
    activityLevel: 'light',
    city: 'جدة',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-07-10T00:00:00Z',
  },
  'demo-fahad-2026': {
    id: 'demo-profile-fahad',
    userId: 'demo-fahad-2026',
    fullName: 'فهد الراشد',
    age: 54,
    gender: 'male',
    heightCm: 176,
    weightKg: 91,
    goal: 'cholesterol',
    activityLevel: 'sedentary',
    city: 'الدمام',
    createdAt: '2026-03-05T00:00:00Z',
    updatedAt: '2026-07-12T00:00:00Z',
  },
  'demo-layla-2026': {
    id: 'demo-profile-layla',
    userId: 'demo-layla-2026',
    fullName: 'ليلى الحربي',
    age: 31,
    gender: 'female',
    heightCm: 165,
    weightKg: 88,
    goal: 'weight_loss',
    activityLevel: 'moderate',
    city: 'المدينة',
    createdAt: '2026-04-15T00:00:00Z',
    updatedAt: '2026-07-08T00:00:00Z',
  },
}

export const DEMO_CONDITIONS: MedicalCondition[] = [
  {
    id: 'cond-1', userId: DEMO_USER_ID,
    condition: 'hypertension',
    severity: 'moderate',
    notes: 'اعتلال عضلة القلب التوسعي — HFrEF — EF كان 15% ارتفع إلى 45%',
    createdAt: '2022-11-07T00:00:00Z',
  },
]

export const DEMO_CONDITIONS_BY_USER: Record<DemoUserId, MedicalCondition[]> = {
  'demo-hussam-2026': DEMO_CONDITIONS,
  'demo-noura-2026': [
    {
      id: 'cond-noura-1', userId: 'demo-noura-2026',
      condition: 'diabetes_t2',
      severity: 'moderate',
      notes: 'HbA1c آخر قراءة 7.4% — التركيز على توزيع الكارب والألياف',
      createdAt: '2026-02-01T00:00:00Z',
    },
    {
      id: 'cond-noura-2', userId: 'demo-noura-2026',
      condition: 'obesity',
      severity: 'mild',
      notes: 'هدف نزول ٥٪ من الوزن خلال ٤ أشهر',
      createdAt: '2026-02-01T00:00:00Z',
    },
  ],
  'demo-fahad-2026': [
    {
      id: 'cond-fahad-1', userId: 'demo-fahad-2026',
      condition: 'hypertension',
      severity: 'moderate',
      notes: 'ضغط منزلي متوسط 138/86',
      createdAt: '2026-03-05T00:00:00Z',
    },
    {
      id: 'cond-fahad-2', userId: 'demo-fahad-2026',
      condition: 'high_cholesterol',
      severity: 'moderate',
      notes: 'LDL مرتفع — تقليل الدهون المشبعة وزيادة الألياف',
      createdAt: '2026-03-05T00:00:00Z',
    },
  ],
  'demo-layla-2026': [
    {
      id: 'cond-layla-1', userId: 'demo-layla-2026',
      condition: 'obesity',
      severity: 'moderate',
      notes: 'تحتاج وجبات مشبعة وسناك منظم لتقليل الجوع الليلي',
      createdAt: '2026-04-15T00:00:00Z',
    },
  ],
}

// ── Progress logs ─────────────────────────────────────────────────────────────

export const DEMO_PROGRESS: ProgressLog[] = [
  {
    id: 'log-1', userId: DEMO_USER_ID,
    logDate: '2026-07-02',
    weightKg: 77,
    bloodPressureSys: 88, bloodPressureDia: 56,
    notes: 'قياس ضغط الشريان الرئوي من CardioMEMS = 21 mmHg',
    createdAt: '2026-07-02T00:00:00Z',
  },
  {
    id: 'log-2', userId: DEMO_USER_ID,
    logDate: '2026-04-27',
    weightKg: 77,
    notes: 'ESR 31 مرتفع — التهاب مستمر',
    createdAt: '2026-04-27T00:00:00Z',
  },
]

export const DEMO_PROGRESS_BY_USER: Record<DemoUserId, ProgressLog[]> = {
  'demo-hussam-2026': DEMO_PROGRESS,
  'demo-noura-2026': [
    {
      id: 'log-noura-1', userId: 'demo-noura-2026',
      logDate: '2026-07-12',
      weightKg: 83,
      glucoseMg: 132,
      mealsFollowed: true,
      notes: 'سكر الصيام أفضل بعد تقليل العصائر واستبدال الخبز الأبيض',
      createdAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'log-noura-2', userId: 'demo-noura-2026',
      logDate: '2026-07-11',
      glucoseMg: 148,
      mealsFollowed: false,
      notes: 'وجبة عشاء متأخرة مع رز أكثر من المعتاد',
      createdAt: '2026-07-11T00:00:00Z',
    },
  ],
  'demo-fahad-2026': [
    {
      id: 'log-fahad-1', userId: 'demo-fahad-2026',
      logDate: '2026-07-12',
      weightKg: 91,
      bloodPressureSys: 136,
      bloodPressureDia: 84,
      mealsFollowed: true,
      notes: 'استخدم بديل قليل الملح في الغداء',
      createdAt: '2026-07-12T00:00:00Z',
    },
  ],
  'demo-layla-2026': [
    {
      id: 'log-layla-1', userId: 'demo-layla-2026',
      logDate: '2026-07-12',
      weightKg: 88,
      mealsFollowed: true,
      notes: 'المشي ٣٠ دقيقة وسناك زبادي بدل الحلويات',
      createdAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'log-layla-2', userId: 'demo-layla-2026',
      logDate: '2026-07-09',
      weightKg: 88.6,
      mealsFollowed: true,
      notes: 'التزمت بالفطور البروتيني',
      createdAt: '2026-07-09T00:00:00Z',
    },
  ],
}

export function getDemoUser(userId: string): DemoUserOption {
  return DEMO_USERS.find(user => user.id === userId) ?? DEMO_USERS[0]
}

export function getDemoProfile(userId: string): HealthProfile {
  return DEMO_PROFILES[userId as DemoUserId] ?? DEMO_PROFILE
}

export function getDemoConditions(userId: string): MedicalCondition[] {
  return DEMO_CONDITIONS_BY_USER[userId as DemoUserId] ?? DEMO_CONDITIONS
}

export function getDemoProgress(userId: string): ProgressLog[] {
  return DEMO_PROGRESS_BY_USER[userId as DemoUserId] ?? DEMO_PROGRESS
}

// ── Lab report images (bundled assets) ───────────────────────────────────────
// Pages from تحاليل.pdf — King Faisal Hospital July 2026

export const DEMO_REPORT_IMAGES = {
  tahaleel: [
    require('../../assets/demo/reports/tahaleelPage-1.png'),
    require('../../assets/demo/reports/tahaleelPage-2.png'),
    require('../../assets/demo/reports/tahaleelPage-3.png'),
    require('../../assets/demo/reports/tahaleelPage-4.png'),
    require('../../assets/demo/reports/tahaleelPage-5.png'),
    require('../../assets/demo/reports/tahaleelPage-6.png'),
    require('../../assets/demo/reports/tahaleelPage-7.png'),
  ],
  taqreer1: [
    require('../../assets/demo/reports/taqreer1Page-1.png'),
    require('../../assets/demo/reports/taqreer1Page-2.png'),
    require('../../assets/demo/reports/taqreer1Page-3.png'),
    require('../../assets/demo/reports/taqreer1Page-4.png'),
    require('../../assets/demo/reports/taqreer1Page-5.png'),
    require('../../assets/demo/reports/taqreer1Page-6.png'),
  ],
  taqreer2: [
    require('../../assets/demo/reports/taqreer2Page-1.png'),
    require('../../assets/demo/reports/taqreer2Page-2.png'),
  ],
} as const

// ── Lab reports with real extracted values ────────────────────────────────────

// ── Demo recipes — heart-friendly Saudi/Gulf cuisine ─────────────────────────

import type { Recipe } from '../types'

export const DEMO_RECIPES: Recipe[] = [
  // ── فطور ─────────────────────────────────────────────────────────────────
  {
    id: 'r1',
    nameAr: 'شوفان بالتمر والمكسرات',
    nameEn: 'Oatmeal with Dates & Nuts',
    category: 'breakfast',
    cuisine: 'saudi',
    prepTimeMin: 5,
    cookTimeMin: 10,
    servings: 1,
    calories: 340,
    proteinG: 12,
    carbsG: 48,
    fatG: 10,
    fiberG: 6,
    sodiumMg: 45,
    potassiumMg: 380,
    suitableFor: ['hypertension', 'high_cholesterol'],
    avoidFor: ['diabetes_t2'],
    ingredientsAr: [
      '½ كوب شوفان مطحون',
      'كوب حليب قليل الدسم',
      '٢ تمرة مجففة مفرومة',
      'ملعقة كبيرة لوز مفروم',
      'قرفة حسب الرغبة',
    ],
    instructionsAr: 'اطبخ الشوفان مع الحليب على نار متوسطة مع التقليب. أضف التمر والمكسرات والقرفة. قدّم دافئاً.',
  },
  {
    id: 'r2',
    nameAr: 'بيض مسلوق مع خبز أسمر وأفوكادو',
    nameEn: 'Boiled Eggs with Whole Wheat & Avocado',
    category: 'breakfast',
    cuisine: 'mediterranean',
    prepTimeMin: 5,
    cookTimeMin: 10,
    servings: 1,
    calories: 310,
    proteinG: 18,
    carbsG: 22,
    fatG: 16,
    fiberG: 5,
    sodiumMg: 180,
    potassiumMg: 420,
    suitableFor: ['hypertension', 'high_cholesterol'],
    avoidFor: [],
    ingredientsAr: [
      'بيضتان مسلوقتان',
      'شريحة خبز أسمر',
      '¼ أفوكادو مهروس',
      'عصير ليمون',
      'فلفل أسود',
    ],
    instructionsAr: 'اسلق البيض ١٠ دقائق. اهرس الأفوكادو مع الليمون والفلفل. افرده على الخبز وضع البيض فوقه.',
  },
  {
    id: 'r3',
    nameAr: 'لبن يوغرت بالفراولة والعسل',
    nameEn: 'Greek Yogurt with Strawberries',
    category: 'breakfast',
    cuisine: 'mediterranean',
    prepTimeMin: 3,
    cookTimeMin: 0,
    servings: 1,
    calories: 190,
    proteinG: 14,
    carbsG: 26,
    fatG: 3,
    fiberG: 2,
    sodiumMg: 60,
    suitableFor: ['hypertension', 'high_cholesterol', 'obesity'],
    avoidFor: ['diabetes_t2'],
    ingredientsAr: [
      '١ كوب زبادي يوناني خالي الدسم',
      '½ كوب فراولة طازجة مقطعة',
      'ملعقة صغيرة عسل',
      'رشة قرفة',
    ],
    instructionsAr: 'ضع الزبادي في الطبق، أضف الفراولة والعسل والقرفة. قدّم فوراً.',
  },

  // ── غداء ─────────────────────────────────────────────────────────────────
  {
    id: 'r4',
    nameAr: 'مرق دجاج بالخضار والكركم',
    nameEn: 'Chicken Vegetable Broth with Turmeric',
    category: 'lunch',
    cuisine: 'saudi',
    prepTimeMin: 15,
    cookTimeMin: 45,
    servings: 2,
    calories: 280,
    proteinG: 28,
    carbsG: 18,
    fatG: 8,
    fiberG: 4,
    sodiumMg: 320,
    potassiumMg: 520,
    suitableFor: ['hypertension', 'high_cholesterol', 'kidney'],
    avoidFor: [],
    ingredientsAr: [
      '٢٠٠ جرام صدر دجاج',
      'جزر، كوسة، بطاطس — مكعبات صغيرة',
      'بصلة متوسطة',
      'ملعقة صغيرة كركم',
      'فلفل أسود وكمون',
      'ملح بالحد الأدنى',
    ],
    instructionsAr: 'اسلق الدجاج مع الخضار والتوابل على نار هادئة ٤٥ دقيقة. قدّم دافئاً بقليل من عصير الليمون.',
  },
  {
    id: 'r5',
    nameAr: 'سمكة مشوية مع الأرز البني',
    nameEn: 'Grilled Fish with Brown Rice',
    category: 'lunch',
    cuisine: 'gulf',
    prepTimeMin: 10,
    cookTimeMin: 25,
    servings: 1,
    calories: 420,
    proteinG: 36,
    carbsG: 42,
    fatG: 9,
    fiberG: 3,
    sodiumMg: 240,
    potassiumMg: 680,
    suitableFor: ['hypertension', 'high_cholesterol'],
    avoidFor: [],
    ingredientsAr: [
      '١٥٠ جرام سمك هامور أو نجيل',
      '½ كوب أرز بني مسلوق',
      'ليمون، ثوم، زيت زيتون',
      'كزبرة طازجة',
      'شرائح طماطم وبصل',
    ],
    instructionsAr: 'تبّل السمكة بالثوم والليمون وزيت الزيتون. اشوِها على الشواية ٢٥ دقيقة. قدّم مع الأرز البني والكزبرة.',
  },
  {
    id: 'r6',
    nameAr: 'عدس أحمر مع خبز أسمر',
    nameEn: 'Red Lentil Soup',
    category: 'soup',
    cuisine: 'saudi',
    prepTimeMin: 10,
    cookTimeMin: 30,
    servings: 2,
    calories: 230,
    proteinG: 14,
    carbsG: 38,
    fatG: 3,
    fiberG: 10,
    sodiumMg: 180,
    potassiumMg: 480,
    suitableFor: ['hypertension', 'high_cholesterol', 'diabetes_t2', 'obesity'],
    avoidFor: ['kidney'],
    ingredientsAr: [
      '١ كوب عدس أحمر منقوع',
      'بصلة، جزرة، طماطم',
      'ملعقة صغيرة كركم وكمون',
      'عصير ليمونة',
      'زيت زيتون ملعقة كبيرة',
    ],
    instructionsAr: 'حمّر البصل والجزر بزيت الزيتون. أضف العدس والماء والتوابل. اطبخ ٣٠ دقيقة ثم اخلط. أضف الليمون وقدّم.',
  },
  {
    id: 'r7',
    nameAr: 'دجاج مشوي بالأعشاب والليمون',
    nameEn: 'Herb & Lemon Grilled Chicken',
    category: 'lunch',
    cuisine: 'mediterranean',
    prepTimeMin: 15,
    cookTimeMin: 30,
    servings: 1,
    calories: 320,
    proteinG: 38,
    carbsG: 5,
    fatG: 14,
    fiberG: 1,
    sodiumMg: 210,
    suitableFor: ['hypertension', 'high_cholesterol', 'diabetes_t2'],
    avoidFor: [],
    ingredientsAr: [
      '١٥٠ جرام صدر دجاج',
      'ليمون كامل عصيراً وقشراً',
      'ثوم، روزماري، زعتر',
      'ملعقة كبيرة زيت زيتون',
    ],
    instructionsAr: 'انقع الدجاج ١٥ دقيقة بالليمون والأعشاب والزيت. اشوِه على الجريل ٣٠ دقيقة مقلوباً في النصف.',
  },

  // ── عشاء ─────────────────────────────────────────────────────────────────
  {
    id: 'r8',
    nameAr: 'شوربة الخضار الكريمية',
    nameEn: 'Creamy Vegetable Soup',
    category: 'dinner',
    cuisine: 'mediterranean',
    prepTimeMin: 10,
    cookTimeMin: 25,
    servings: 2,
    calories: 180,
    proteinG: 6,
    carbsG: 24,
    fatG: 7,
    fiberG: 5,
    sodiumMg: 160,
    suitableFor: ['hypertension', 'obesity', 'high_cholesterol'],
    avoidFor: [],
    ingredientsAr: [
      'كوسة، جزر، بطاطس حلوة',
      'بصل وثوم',
      'ملعقة كبيرة زيت زيتون',
      'كركم وفلفل أبيض',
      'حليب قليل الدسم ¼ كوب',
    ],
    instructionsAr: 'حمّر البصل والثوم. أضف الخضار والماء والتوابل. اطبخ حتى تنضج ثم اخلط وأضف الحليب.',
  },
  {
    id: 'r9',
    nameAr: 'تونة مع سلطة خضراء',
    nameEn: 'Tuna with Green Salad',
    category: 'dinner',
    cuisine: 'mediterranean',
    prepTimeMin: 10,
    cookTimeMin: 0,
    servings: 1,
    calories: 240,
    proteinG: 26,
    carbsG: 8,
    fatG: 10,
    fiberG: 4,
    sodiumMg: 290,
    suitableFor: ['hypertension', 'high_cholesterol', 'diabetes_t2', 'obesity'],
    avoidFor: [],
    ingredientsAr: [
      '١ علبة تونة في الماء (مصفاة)',
      'خس، طماطم، خيار، بصل أخضر',
      'ملعقة زيت زيتون + خل تفاح',
      'فلفل أسود وعصير ليمون',
    ],
    instructionsAr: 'قطّع الخضار وضعها في الطبق. رتّب التونة فوقها. ارش الزيت والخل والليمون والفلفل.',
  },
  {
    id: 'r10',
    nameAr: 'بيض مقلي بالزيت الخفيف مع خضار',
    nameEn: 'Lightly Fried Eggs with Vegetables',
    category: 'dinner',
    cuisine: 'saudi',
    prepTimeMin: 5,
    cookTimeMin: 8,
    servings: 1,
    calories: 220,
    proteinG: 14,
    carbsG: 10,
    fatG: 12,
    fiberG: 3,
    sodiumMg: 170,
    suitableFor: ['hypertension', 'high_cholesterol'],
    avoidFor: [],
    ingredientsAr: [
      'بيضتان',
      'طماطم وبصل وفلفل أخضر',
      'نصف ملعقة زيت زيتون',
      'فلفل أسود وقليل من الملح',
    ],
    instructionsAr: 'حمّر الخضار بالزيت على نار متوسطة. اكسر البيض وقلّبه مع الخضار حتى ينضج.',
  },

  // ── سناك ─────────────────────────────────────────────────────────────────
  {
    id: 'r11',
    nameAr: 'تمر وجوز',
    nameEn: 'Dates & Walnuts',
    category: 'snack',
    cuisine: 'saudi',
    prepTimeMin: 2,
    cookTimeMin: 0,
    servings: 1,
    calories: 160,
    proteinG: 3,
    carbsG: 24,
    fatG: 7,
    fiberG: 2,
    sodiumMg: 5,
    potassiumMg: 180,
    suitableFor: ['hypertension', 'high_cholesterol'],
    avoidFor: ['diabetes_t2'],
    ingredientsAr: ['٣ تمرات', '٤ نصف جوزة'],
    instructionsAr: 'تناول التمر والجوز معاً كوجبة خفيفة مغذية.',
  },
  {
    id: 'r12',
    nameAr: 'فواكه طازجة موسمية',
    nameEn: 'Fresh Seasonal Fruits',
    category: 'snack',
    cuisine: 'gulf',
    prepTimeMin: 5,
    cookTimeMin: 0,
    servings: 1,
    calories: 120,
    proteinG: 1,
    carbsG: 30,
    fatG: 0,
    fiberG: 4,
    sodiumMg: 5,
    suitableFor: ['hypertension', 'high_cholesterol', 'obesity'],
    avoidFor: ['diabetes_t2'],
    ingredientsAr: [
      'تفاحة أو برتقالة أو مانجو',
      'كيوي أو فراولة حسب الموسم',
    ],
    instructionsAr: 'اقطع الفواكه الطازجة وقدّمها فوراً كوجبة خفيفة صحية.',
  },

  // ── سلطة ─────────────────────────────────────────────────────────────────
  {
    id: 'r13',
    nameAr: 'سلطة فتوش الشامية',
    nameEn: 'Fattoush Salad',
    category: 'salad',
    cuisine: 'mediterranean',
    prepTimeMin: 15,
    cookTimeMin: 0,
    servings: 2,
    calories: 160,
    proteinG: 4,
    carbsG: 22,
    fatG: 6,
    fiberG: 4,
    sodiumMg: 140,
    suitableFor: ['hypertension', 'high_cholesterol', 'diabetes_t2', 'obesity'],
    avoidFor: [],
    ingredientsAr: [
      'خس روماني، طماطم، خيار، فجل',
      'بصل أخضر، نعناع، بقدونس',
      'رقيفة خبز محمصة',
      'عصير ليمون، زيت زيتون، خل رمان',
      'زعتر، ملح قليل',
    ],
    instructionsAr: 'قطّع جميع الخضار. أضف التتبيلة. ارش الخبز المحمص وقدّم فوراً.',
  },
  {
    id: 'r14',
    nameAr: 'سلطة طماطم بالزيتون والأعشاب',
    nameEn: 'Tomato Olive Herb Salad',
    category: 'salad',
    cuisine: 'mediterranean',
    prepTimeMin: 10,
    cookTimeMin: 0,
    servings: 1,
    calories: 110,
    proteinG: 2,
    carbsG: 12,
    fatG: 6,
    fiberG: 3,
    sodiumMg: 190,
    suitableFor: ['hypertension', 'high_cholesterol', 'diabetes_t2', 'obesity', 'gout'],
    avoidFor: [],
    ingredientsAr: [
      '٢ طماطم كبيرة مقطعة',
      '١٠ حبات زيتون أسود منزوع النواة',
      'ريحان طازج أو أوريجانو',
      'ملعقة زيت زيتون + ليمون',
    ],
    instructionsAr: 'امزج الطماطم والزيتون والأعشاب. أضف الزيت والليمون وقدّم فوراً.',
  },
  {
    id: 'r15',
    nameAr: 'حمص بالطحينة',
    nameEn: 'Hummus with Tahini',
    category: 'snack',
    cuisine: 'saudi',
    prepTimeMin: 10,
    cookTimeMin: 0,
    servings: 2,
    calories: 190,
    proteinG: 9,
    carbsG: 22,
    fatG: 8,
    fiberG: 6,
    sodiumMg: 220,
    potassiumMg: 310,
    suitableFor: ['hypertension', 'high_cholesterol', 'diabetes_t2', 'obesity'],
    avoidFor: ['kidney'],
    ingredientsAr: [
      '١ علبة حمص مسلوق مصفى',
      '٢ ملعقة طحينة',
      'ثوم، ليمون، كمون',
      'زيت زيتون للتزيين',
      'بابريكا وبقدونس',
    ],
    instructionsAr: 'اخلط جميع المكونات في الخلاط حتى الحصول على قوام ناعم. قدّم مع خبز أسمر أو خضار طازجة.',
  },
]

// ── Lab reports ────────────────────────────────────────────────────────────────

export const DEMO_LAB_REPORTS: LabReport[] = [
  // ── Report 1: Full CBC + Chemistry — KFSH July 2 2026 ──────────────────────
  {
    id: 'report-tahaleel-jul26',
    userId: DEMO_USER_ID,
    reportDate: '2026-07-02',
    fileName: 'تحاليل — مستشفى الملك فيصل — يوليو ٢٠٢٦',
    status: 'done',
    extractedValues: {
      hemoglobin:   153,   // g/L — طبيعي (135-180)
      creatinine:   92.8,  // umol/L — طبيعي (64-115)
      esr:          31,    // mm/Hr — مرتفع H (ref 0-15)
      crp:          31.7,  // mg/L — مرتفع (التهاب)
      sodium:       101,   // mmol/L — طبيعي (98-111)
    },
    aiAssessment: {
      values: {
        hemoglobin:   153,
        creatinine:   92.8,
        esr:          31,
        crp:          31.7,
        sodium:       101,
      },
      summaryAr:
        'التحاليل الأخيرة بتاريخ ٢ يوليو ٢٠٢٦ تُظهر تحسناً في تخثر الدم (INR عاد طبيعياً). ' +
        'ارتفاع في ESR وCRP يشير إلى التهاب مستمر يتطلب متابعة. ' +
        'الهيموغلوبين والكرياتينين ضمن الحدود الطبيعية.',
      flags: [
        {
          key: 'esr', value: 31, unit: 'mm/Hr',
          status: 'see_doctor',
          labelAr: 'سرعة الترسيب ESR',
          adviceAr: 'مرتفع (المرجع 0-15). يشير إلى التهاب — راجع طبيبك.',
        },
        {
          key: 'crp', value: 31.7, unit: 'mg/L',
          status: 'see_doctor',
          labelAr: 'بروتين سي التفاعلي CRP',
          adviceAr: 'ارتفاع واضح يدل على التهاب نشط. تجنب الأطعمة المشبعة والمعالجة.',
        },
        {
          key: 'hemoglobin', value: 153, unit: 'g/L',
          status: 'normal',
          labelAr: 'الهيموغلوبين',
          adviceAr: 'طبيعي. حافظ على تناول الحديد والبروتين.',
        },
        {
          key: 'creatinine', value: 92.8, unit: 'umol/L',
          status: 'normal',
          labelAr: 'الكرياتينين',
          adviceAr: 'وظائف الكلى طبيعية. استمر في شرب الماء الكافي.',
        },
        {
          key: 'inr', value: 1.0, unit: 'ratio',
          status: 'normal',
          labelAr: 'INR — تخثر الدم',
          adviceAr: 'عاد طبيعياً بعد أن كان مرتفعاً. تابع مع طبيبك.',
        },
      ],
      nutritionRestrictions: ['low_sodium', 'low_fat', 'high_protein'],
      urgentFlags: [
        'ESR مرتفع ٣١ — التهاب مستمر',
        'CRP مرتفع ٣١.٧ — راجع طبيبك',
      ],
    },
    createdAt: '2026-07-02T10:00:00Z',
  },

  // ── Report 2: Cardiac Evaluation — KFSH April 27 2026 ─────────────────────
  {
    id: 'report-tahaleel-apr26',
    userId: DEMO_USER_ID,
    reportDate: '2026-04-27',
    fileName: 'تحاليل — مستشفى الملك فيصل — أبريل ٢٠٢٦',
    status: 'done',
    extractedValues: {
      hemoglobin: 134,
      esr:        31,
      creatinine: 97.5,
    },
    aiAssessment: {
      values: { hemoglobin: 134, esr: 31, creatinine: 97.5 },
      summaryAr:
        'تحاليل أبريل ٢٠٢٦ — ESR مرتفع لا يزال. PT/PTT مرتفعان مما يستدعي متابعة الجرعة الدوائية. ' +
        'الهيموغلوبين في الحد الأدنى للطبيعي.',
      flags: [
        {
          key: 'hemoglobin', value: 134, unit: 'g/L',
          status: 'watch',
          labelAr: 'الهيموغلوبين',
          adviceAr: 'في الحد الأدنى الطبيعي. زد الأطعمة الغنية بالحديد كالسبانخ والعدس.',
        },
        {
          key: 'esr', value: 31, unit: 'mm/Hr',
          status: 'see_doctor',
          labelAr: 'سرعة الترسيب ESR',
          adviceAr: 'مرتفع منذ أبريل — التهاب مستمر. ابتعد عن المقليات والسكريات.',
        },
        {
          key: 'pt', value: 20.7, unit: 'ثانية',
          status: 'see_doctor',
          labelAr: 'وقت البروثرومبين PT',
          adviceAr: 'مرتفع. راجع طبيبك لتعديل جرعة مضاد التخثر.',
        },
      ],
      nutritionRestrictions: ['low_sodium', 'low_fat'],
      urgentFlags: ['PT مرتفع ٢٠.٧ — راجع جرعة الوارفارين'],
    },
    createdAt: '2026-04-27T10:00:00Z',
  },

  // ── Report 3: Cardiac Catheterization — KFSH Heart Institute Nov 2022 ──────
  {
    id: 'report-cath-nov22',
    userId: DEMO_USER_ID,
    reportDate: '2022-11-07',
    fileName: 'قسطرة قلبية يمينية — معهد الملك فيصل للقلب — نوفمبر ٢٠٢٢',
    status: 'done',
    extractedValues: {},
    aiAssessment: {
      values: {},
      summaryAr:
        'قسطرة قلبية يمينية بتاريخ ٧ نوفمبر ٢٠٢٢. ضغط الشريان الرئوي: ٥٠/٢٢/٣٦ mmHg (ارتفاع). ' +
        'ضغط البطين الأيمن: ٤٨/٩ mmHg. PCW: ٢٣ mmHg. ' +
        'تم تركيب جهاز CardioMEMS لمراقبة ضغط الشريان الرئوي. ' +
        'آخر قراءة CardioMEMS: ٢١ mmHg.',
      flags: [
        {
          key: 'pa_pressure', value: 36, unit: 'mmHg',
          status: 'see_doctor',
          labelAr: 'ضغط الشريان الرئوي (متوسط)',
          adviceAr: 'ارتفاع ضغط رئوي — تابع مع طبيب القلب. قلل الصوديوم والسوائل الزائدة.',
        },
        {
          key: 'pcw', value: 23, unit: 'mmHg',
          status: 'see_doctor',
          labelAr: 'ضغط الإسفين الرئوي PCW',
          adviceAr: 'مرتفع — يدل على ارتفاع ضغط البطين الأيسر. نظام غذائي قليل الملح.',
        },
      ],
      nutritionRestrictions: ['low_sodium', 'low_fat', 'high_protein'],
      urgentFlags: [
        'ارتفاع ضغط الشريان الرئوي — PA 50/22/36 mmHg',
        'اعتلال عضلة القلب التوسعي — EF ١٥٪ وقت القسطرة',
      ],
    },
    createdAt: '2022-11-07T12:00:00Z',
  },

  // ── Report 4: Cardiac Evaluation letter — KFSH Feb 2026 ───────────────────
  {
    id: 'report-cardiac-eval-feb26',
    userId: DEMO_USER_ID,
    reportDate: '2026-02-06',
    fileName: 'تقرير القلب الشامل — مستشفى الملك فيصل — فبراير ٢٠٢٦',
    status: 'done',
    extractedValues: {},
    aiAssessment: {
      values: {},
      summaryAr:
        'تقرير متابعة فبراير ٢٠٢٦: HFrEF مع EF كان ١٥٪ تحسّن إلى ٤٠-٤٥٪ في مارس ٢٠٢٥. ' +
        'تخطيط القلب الكهربائي أكتوبر ٢٠٢٥: نظم جيبي طبيعي. ' +
        'إيكو مارس ٢٠٢٥: LV متوسع خفيفاً، GLS سلبي (-11.2٪). ' +
        'لا يوجد تجلط ولا انصباب تأموري. جهاز ICD في البطين الأيمن.',
      flags: [
        {
          key: 'ef', value: 42.5, unit: '%',
          status: 'watch',
          labelAr: 'كسر القذف EF',
          adviceAr: 'تحسّن من ١٥٪ إلى ٤٠-٤٥٪ — استمر في التزام خطة العلاج والتغذية.',
        },
        {
          key: 'gls', value: -11.2, unit: '%',
          status: 'watch',
          labelAr: 'إجهاد الطولي الكلي GLS',
          adviceAr: 'منخفض — يشير إلى ضعف انقباضي معتدل. تغذية علاجية قلبية مهمة.',
        },
      ],
      nutritionRestrictions: ['low_sodium', 'low_fat', 'high_protein'],
      urgentFlags: [],
    },
    createdAt: '2026-02-06T10:00:00Z',
  },
]

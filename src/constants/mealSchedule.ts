/**
 * زاد — Weekly & Monthly Meal Schedule
 * Built for HFrEF / cardiac patients: low-sodium, heart-friendly.
 * Pulls recipe IDs from REFERENCE_RECIPES (r1–r15).
 * Index 0 = Sunday, 6 = Saturday.
 */

import { REFERENCE_RECIPES } from './recipeData'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DayPlan {
  dayAr: string        // e.g. الأحد
  breakfast: string    // recipe id
  lunch: string
  dinner: string
  snack: string
  totalCalories: number
  proteinG: number
  carbsG: number
  fatG: number
  sodiumMg: number
  noteAr: string       // cardiac-focused tip
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getRecipe(id: string) {
  return REFERENCE_RECIPES.find(r => r.id === id)!
}

function buildDay(
  dayAr: string,
  breakfast: string,
  lunch: string,
  dinner: string,
  snack: string,
  noteAr: string,
): DayPlan {
  const meals = [breakfast, lunch, dinner, snack].map(getRecipe)
  const totalCalories = meals.reduce((s, r) => s + r.calories, 0)
  const proteinG      = meals.reduce((s, r) => s + r.proteinG, 0)
  const carbsG        = meals.reduce((s, r) => s + r.carbsG, 0)
  const fatG          = meals.reduce((s, r) => s + r.fatG, 0)
  const sodiumMg      = meals.reduce((s, r) => s + (r.sodiumMg ?? 0), 0)
  return { dayAr, breakfast, lunch, dinner, snack, totalCalories, proteinG, carbsG, fatG, sodiumMg, noteAr }
}

// ── Week 1 (base week) ────────────────────────────────────────────────────────
// Day names: الأحد=0, الاثنين=1, الثلاثاء=2, الأربعاء=3, الخميس=4, الجمعة=5, السبت=6

const WEEK1: DayPlan[] = [
  buildDay(
    'الأحد',
    'r1',  // شوفان
    'r4',  // مرق دجاج
    'r8',  // شوربة خضار
    'r11', // تمر وجوز
    'ابدأ أسبوعك بوجبة فطور غنية بالألياف — الشوفان يخفض الكوليسترول ويحمي القلب.',
  ),
  buildDay(
    'الاثنين',
    'r2',  // بيض + أفوكادو
    'r5',  // سمك مشوي
    'r9',  // تونة + سلطة
    'r12', // فواكه
    'الأوميجا 3 في السمك يقلل الالتهاب — مهم لمريض HFrEF. ابتعد عن ملح الطعام الزائد اليوم.',
  ),
  buildDay(
    'الثلاثاء',
    'r3',  // زبادي + فراولة
    'r7',  // دجاج مشوي
    'r10', // بيض + خضار
    'r15', // حمص
    'الزبادي مصدر بروتين وبروبيوتيك — يدعم صحة الأمعاء والقلب. راقب الصوديوم في الحمص.',
  ),
  buildDay(
    'الأربعاء',
    'r1',  // شوفان
    'r6',  // عدس أحمر
    'r8',  // شوربة خضار
    'r11', // تمر وجوز
    'العدس غني بالبوتاسيوم والألياف — يساعد على ضبط ضغط الدم. اشرب الماء الكافي.',
  ),
  buildDay(
    'الخميس',
    'r2',  // بيض + أفوكادو
    'r4',  // مرق دجاج
    'r9',  // تونة + سلطة
    'r13', // فتوش
    'الأفوكادو يحتوي دهوناً أحادية غير مشبعة تحمي الشريان الأورطي. ابتعد عن الملح الزائد اليوم — ضغط الشريان الرئوي حساس للصوديوم.',
  ),
  buildDay(
    'الجمعة',
    'r3',  // زبادي + فراولة
    'r5',  // سمك مشوي
    'r10', // بيض + خضار
    'r12', // فواكه
    'يوم الجمعة — خفف الملح تماماً وأضف الليمون بديلاً للنكهة. قلل السوائل إذا كان وزنك زاد أمس.',
  ),
  buildDay(
    'السبت',
    'r1',  // شوفان
    'r7',  // دجاج مشوي
    'r8',  // شوربة خضار
    'r15', // حمص
    'في نهاية الأسبوع ابتعد عن الوجبات الجاهزة — الصوديوم المخفي فيها يرفع حِمل القلب.',
  ),
]

// ── Weeks 2–4: slight variation (rotate breakfast & snacks) ──────────────────

const WEEK2: DayPlan[] = [
  buildDay('الأحد',    'r3', 'r4',  'r9',  'r12', 'صيام الالتهاب: تجنب السكريات المضافة — قيمة CRP لديك تستجيب للتغذية.'),
  buildDay('الاثنين',  'r1', 'r7',  'r8',  'r11', 'الشوفان + دجاج مشوي = يوم منخفض الصوديوم. ابتعد عن الملح الزائد اليوم — ضغط الشريان الرئوي حساس للصوديوم.'),
  buildDay('الثلاثاء', 'r2', 'r5',  'r10', 'r13', 'الأوميجا 3 وبروتين البيض معاً — يدعمان وظيفة عضلة القلب (EF).'),
  buildDay('الأربعاء', 'r3', 'r6',  'r9',  'r15', 'العدس + التونة — بروتين نباتي وحيواني في يوم واحد. راقب صوديوم الحمص.'),
  buildDay('الخميس',  'r1', 'r4',  'r8',  'r12', 'مرق الدجاج منخفض الصوديوم هو الأفضل لك — اطلب تحضيره بلا ملح مضاف.'),
  buildDay('الجمعة',  'r2', 'r7',  'r10', 'r11', 'نهاية الأسبوع — وزّن نفسك صباحاً. زيادة 1 كجم خلال يومين = احتباس سوائل: راجع طبيبك.'),
  buildDay('السبت',   'r3', 'r5',  'r9',  'r14', 'سلطة الطماطم غنية بالليكوبين — مضاد أكسدة يحمي أوعية القلب الدموية.'),
]

const WEEK3: DayPlan[] = [
  buildDay('الأحد',    'r2', 'r6',  'r8',  'r11', 'فطور البيض يمنحك بروتيناً كاملاً — أساس مهم لعضلة القلب المتعافية.'),
  buildDay('الاثنين',  'r3', 'r4',  'r9',  'r12', 'الزبادي والتونة مصدران ممتازان للبروتين قليل الدهون. راقب الصوديوم يومياً.'),
  buildDay('الثلاثاء', 'r1', 'r7',  'r10', 'r15', 'الكركم في مرق الدجاج مضاد التهاب طبيعي ضمن نمط غذائي متوازن.'),
  buildDay('الأربعاء', 'r2', 'r5',  'r8',  'r13', 'السمك المشوي + شوربة الخضار = يوم خفيف على القلب. لا تضف ملحاً للطعام.'),
  buildDay('الخميس',  'r3', 'r6',  'r9',  'r11', 'ابتعد عن الملح الزائد اليوم، وراجع قياساتك الصحية الدورية إذا كانت متاحة.'),
  buildDay('الجمعة',  'r1', 'r4',  'r10', 'r12', 'يوم الجمعة: استمتع بوجباتك الصحية — المطبخ المنزلي دائماً أخف في الصوديوم من المطاعم.'),
  buildDay('السبت',   'r2', 'r7',  'r8',  'r14', 'زيت الزيتون في الدجاج المشوي يقلل LDL — الدهون الجيدة للقلب.'),
]

const WEEK4: DayPlan[] = [
  buildDay('الأحد',    'r3', 'r7',  'r9',  'r11', 'أسبوعك الأخير من الشهر — راجع وزنك ومعدل الصوديوم اليومي مع طبيبك.'),
  buildDay('الاثنين',  'r1', 'r5',  'r8',  'r12', 'الأرز البني مع السمك يمنحك كربوهيدرات بطيئة الامتصاص — لا يرفع السكر فجأة.'),
  buildDay('الثلاثاء', 'r2', 'r4',  'r10', 'r13', 'البروتين العالي في مرق الدجاج يدعم تعافي عضلة القلب. ابتعد عن الملح الزائد اليوم.'),
  buildDay('الأربعاء', 'r3', 'r6',  'r9',  'r15', 'العدس والتونة ومصادر بروتين متنوعة — أهمية التنوع في التغذية العلاجية.'),
  buildDay('الخميس',  'r1', 'r7',  'r8',  'r11', 'أعشاب الدجاج المشوي (روزماري وزعتر) تحتوي مضادات أكسدة تحمي القلب.'),
  buildDay('الجمعة',  'r2', 'r5',  'r10', 'r12', 'ختام الشهر بأسلوب صحي — السمك والبيض والخضار هم أفضل أصدقاء القلب.'),
  buildDay('السبت',   'r3', 'r4',  'r9',  'r14', 'انتهى شهر كامل من التغذية العلاجية — أنت تسير في الطريق الصحيح نحو EF أعلى.'),
]

// ── Exports ───────────────────────────────────────────────────────────────────

export const WEEK_PLAN: DayPlan[] = WEEK1

export const MONTH_WEEKS: DayPlan[][] = [WEEK1, WEEK2, WEEK3, WEEK4]

/**
 * Returns the DayPlan for any given Date.
 * Cycles through the 4-week plan based on week-of-year parity.
 * Day-of-week (0=Sun … 6=Sat) selects the row within the week.
 */
export function getPlanForDate(date: Date): DayPlan {
  // Which week of the month (0-3)
  const dayOfMonth = date.getDate()
  const weekIndex  = Math.min(Math.floor((dayOfMonth - 1) / 7), 3)
  // Which day of week (0=Sun … 6=Sat)
  const dayOfWeek  = date.getDay()
  return MONTH_WEEKS[weekIndex][dayOfWeek]
}

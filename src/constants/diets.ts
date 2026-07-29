export const DIET_TYPES = [
  { id: 'balanced', label: 'متوازن', description: 'تنويع المجموعات الغذائية بنسب معتدلة' },
  { id: 'mediterranean', label: 'متوسطي', description: 'خضار وحبوب كاملة وزيت زيتون وأسماك' },
  { id: 'dash', label: 'DASH للضغط', description: 'صوديوم أقل وألياف وخضار أكثر' },
  { id: 'low_carb', label: 'قليل الكربوهيدرات', description: 'نشويات أقل مع بروتين وخضار أكثر' },
  { id: 'high_protein', label: 'عالي البروتين', description: 'لدعم الشبع والعضلات والتعافي' },
  { id: 'vegetarian', label: 'نباتي', description: 'بقول وبيض وألبان دون لحوم' },
  { id: 'vegan', label: 'نباتي صرف', description: 'مصادر نباتية بالكامل' },
  { id: 'keto', label: 'كيتو', description: 'كربوهيدرات شديدة الانخفاض ودهون صحية' },
  { id: 'gluten_free', label: 'خالٍ من الغلوتين', description: 'بدون القمح والشعير ومشتقاتهما' },
  { id: 'diabetes_friendly', label: 'مناسب لضبط السكر', description: 'ألياف أعلى وكربوهيدرات موزعة' },
] as const

export type DietType = (typeof DIET_TYPES)[number]['id']

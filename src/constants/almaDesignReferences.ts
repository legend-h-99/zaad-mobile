export interface AlmaReferenceLink {
  titleAr: string
  subtitleAr: string
  url: string
}

export const ALMA_REFERENCE_SCREENS: AlmaReferenceLink[] = [
  {
    titleAr: 'الصفحة الرئيسية والأهداف',
    subtitleAr: 'بطاقات هدف مركزة، حالة يومية، وقرارات قليلة في الشاشة الأولى',
    url: 'https://mobbin.com/screens/decbd1d7-a973-4d84-821d-a7dc1e83d85f',
  },
  {
    titleAr: 'الإعدادات والملف',
    subtitleAr: 'قوائم صفية واضحة مع أيقونة وحالة مختصرة لكل خيار',
    url: 'https://mobbin.com/screens/80e5c289-9a37-4813-8659-ff6c41dc3400',
  },
  {
    titleAr: 'العضوية',
    subtitleAr: 'صفحة قرار واحدة تعرض القيمة قبل الدفع أو الترقية',
    url: 'https://mobbin.com/screens/92f20343-cb3b-476c-b730-8d0380bec68e',
  },
  {
    titleAr: 'التفضيلات',
    subtitleAr: 'خيارات شخصية قابلة للتعديل بدون ازدحام بصري',
    url: 'https://mobbin.com/screens/53058dac-046b-4e11-a9bb-08bc073bce2d',
  },
]

export const ALMA_REFERENCE_FLOWS: AlmaReferenceLink[] = [
  {
    titleAr: 'إنشاء الملف',
    subtitleAr: 'تدرّج من المعلومات العامة إلى التفضيلات الشخصية',
    url: 'https://mobbin.com/flows/d483f878-758d-4672-90e7-3bc78581efb8',
  },
  {
    titleAr: 'التهيئة',
    subtitleAr: 'Onboarding طويل لكنه مقسّم بخطوات صغيرة ومطمئنة',
    url: 'https://mobbin.com/flows/6e3d85dd-e2ea-4747-93a7-1104b0e06c9e',
  },
  {
    titleAr: 'الملف الشخصي',
    subtitleAr: 'تنقل من المنزل إلى الملف والدوائر والمدرب',
    url: 'https://mobbin.com/flows/00a1b39a-71b7-4459-bf59-f6623c69b398',
  },
  {
    titleAr: 'التفضيلات',
    subtitleAr: 'تحرير تفضيلات المستخدم كمسار مستقل وقصير',
    url: 'https://mobbin.com/flows/4138769c-3b7e-45ad-a8fe-a6a5cfbe62c2',
  },
]

export const ZAAD_ALMA_UI_PATTERNS = [
  'بطاقة هدف رئيسية واحدة في أعلى الشاشة بدل عدة بطاقات متنافسة',
  'صفوف إعدادات طويلة اللمس مع أيقونة واضحة وسطر وصف قصير',
  'شرائح اختيار أفقية للتصنيف والتفضيلات بدل قوائم مزدحمة',
  'بطاقات صحية بلون حالة واضح ونص يشرح المعنى، لا لون فقط',
  'شاشات قرار قصيرة: عنوان، قيمة مباشرة، إجراء أساسي واحد، وخيار ثانوي',
  'تدرج إعداد الملف الصحي إلى خطوات صغيرة مع مؤشر تقدم دائم',
]

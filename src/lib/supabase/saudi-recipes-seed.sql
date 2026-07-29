-- Zaad Saudi/Gulf recipe library seed
-- Run after nutrition-reference-migration.sql and the base recipes schema.
-- The instructions are brief adapted summaries, not verbatim cookbook text.

alter table recipes
  add column if not exists source_id uuid references nutrition_sources(id) on delete set null,
  add column if not exists external_id text,
  add column if not exists source_notes_ar text;

create unique index if not exists recipes_external_id_unique
  on recipes(external_id);

create index if not exists recipes_source_id_idx on recipes(source_id);

insert into nutrition_sources
  (slug, name_ar, name_en, scope, source_type, authority, url, license_note, priority, notes_ar)
values
  ('sfct-a-pdf', 'جداول تراكيب الأغذية السعودي PDF', 'Saudi Food Composition Tables PDF', 'saudi', 'recipes', 'SFDA', null, 'بيانات غذائية ووصفات مرجعية؛ تحقق من الترخيص قبل الاستيراد الكامل.', 2, 'مصدر أساسي للوصفات السعودية مع قيم مغذية.'),
  ('national-day-menu-arabic-2024', 'قائمة طعام اليوم الوطني العربية', 'National Day Menu Arabic', 'saudi', 'recipes', 'Saudi Culinary Arts Commission', null, 'ملف مقدم من المستخدم؛ استخدمنا ملخصات وصفية فقط.', 15, 'قائمة أطباق وطنية سعودية.'),
  ('thirty-dish-trip', 'رحلة ثلاثين طبق', '30 Dish Trip', 'saudi', 'recipes', null, null, 'ملف مقدم من المستخدم؛ استخدمنا ملخصات وصفية فقط.', 20, 'وصفات ومشروبات وأطباق من مناطق سعودية.'),
  ('sohba-main-dishes', 'صحبة طيبة - أطباق رئيسية', 'Sohba Main Dishes', 'arab', 'recipes', 'Osaima Jaber Alayoubi', null, 'ملف مقدم من المستخدم؛ استخدمنا ملخصات وصفية فقط.', 30, 'أطباق رئيسية عربية ومتوسطية.'),
  ('houria-soups', 'شوربات حورية المطبخ', 'Houria Soups', 'arab', 'recipes', null, null, 'ملف مقدم من المستخدم؛ استخدمنا ملخصات وصفية فقط.', 35, 'مجموعة شوربات.'),
  ('our-kitchen-adventures', 'Our Kitchen Adventures', 'Our Kitchen Adventures', 'saudi', 'recipes', null, null, 'ملف مقدم من المستخدم؛ استخدمنا ملخصات وصفية فقط.', 40, 'وصفات من التراث المحلي والمطبخ العائلي.')
on conflict (slug) do update set
  name_ar = excluded.name_ar,
  name_en = excluded.name_en,
  scope = excluded.scope,
  source_type = excluded.source_type,
  authority = excluded.authority,
  url = excluded.url,
  license_note = excluded.license_note,
  priority = excluded.priority,
  notes_ar = excluded.notes_ar;

with recipe_rows as (
  select *
  from (values
    ('sfct-qursan', 'sfct-a-pdf', 'قرصان', 'Qursan', 'lunch', 'saudi', 35, 85, 4, 823, 23.3, 89.0, 47.0, 8.0, 2625, ARRAY['balanced']::text[], ARRAY['kidney','hypertension']::text[], ARRAY['دقيق بر', 'لحم أو دجاج', 'خضار موسمية', 'طماطم', 'بهارات سعودية', 'سمن بكمية مضبوطة']::text[], 'يحضّر مرق غني بالخضار والبروتين، ثم تضاف رقائق القرصان تدريجيًا حتى تلين وتتشرّب النكهة.', 'قيمة غذائية مشتقة من SFCT-A لكل حصة تقريبية.'),
    ('sfct-jareesh', 'sfct-a-pdf', 'جريش', 'Jareesh', 'breakfast', 'saudi', 15, 90, 4, 988, 51.3, 105.3, 45.0, 22.8, 1250, ARRAY['balanced','high_protein']::text[], ARRAY['kidney','hypertension']::text[], ARRAY['حبوب جريش منقوعة', 'لبن طازج', 'بصل', 'كمون', 'سمن', 'ملح قليل']::text[], 'يشوح البصل ثم يضاف الجريش واللبن ويطهى ببطء حتى يصبح قوامه كريميًا؛ يضبط الملح والسمن حسب الخطة.', 'قيمة غذائية مشتقة من SFCT-A لكل حصة تقريبية.'),
    ('sfct-margoug-veg', 'sfct-a-pdf', 'مرقوق خضار', 'Vegetable margoug', 'dinner', 'saudi', 45, 105, 4, 555, 33.8, 90.3, 14.3, 8.0, 932, ARRAY['balanced']::text[], ARRAY['kidney','hypertension']::text[], ARRAY['دقيق بر', 'لحم غنم', 'قرع', 'كوسا', 'باذنجان', 'فاصولياء', 'طماطم', 'ليمون أسود']::text[], 'تعجن رقائق المرقوق وتطهى داخل مرق اللحم والخضار حتى تتماسك النكهة ويصبح الطبق طريًا.', 'قيمة غذائية مشتقة من SFCT-A لكل حصة تقريبية.'),
    ('sfct-khameer', 'sfct-a-pdf', 'قرص خمير / قرص عمر', 'Khameer bread', 'breakfast', 'saudi', 20, 25, 4, 635, 21.5, 99.3, 20.3, 6.0, 137, ARRAY['balanced','vegetarian']::text[], ARRAY['diabetes_t2']::text[], ARRAY['دقيق بر', 'حليب', 'بهارات دافئة', 'حبة سوداء', 'قليل من الزيت']::text[], 'يعجن الدقيق مع الحليب والبهارات، يترك ليرتاح، ثم يخبز كأقراص حتى يتحمر السطح.', 'قيمة غذائية مشتقة من SFCT-A لكل حصة تقريبية.'),
    ('sfct-qishd', 'sfct-a-pdf', 'قشد', 'Qishd', 'snack', 'saudi', 10, 15, 4, 535, 4.3, 88.8, 20.0, 4.0, 28, ARRAY['balanced','vegetarian']::text[], ARRAY['diabetes_t2','high_cholesterol']::text[], ARRAY['تمر', 'دقيق', 'سمن', 'هيل']::text[], 'يمزج التمر مع الدقيق والسمن على نار هادئة حتى يتجانس؛ يقدم بكميات صغيرة كحلوى تراثية.', 'قيمة غذائية مشتقة من SFCT-A لكل حصة تقريبية.'),
    ('sfct-mahala', 'sfct-a-pdf', 'محلى', 'Mahala', 'breakfast', 'saudi', 20, 35, 4, 845, 22.0, 152.5, 19.5, 8.0, 265, ARRAY['balanced','vegetarian']::text[], ARRAY['diabetes_t2']::text[], ARRAY['دقيق بر', 'تمر', 'سمن', 'هيل', 'ماء']::text[], 'يحضر خليط الدقيق والتمر ويطهى حتى يثخن، ثم يضاف السمن والهيل باعتدال.', 'قيمة غذائية مشتقة من SFCT-A لكل حصة تقريبية.'),
    ('sfct-hamees', 'sfct-a-pdf', 'حميس', 'Hamees', 'lunch', 'saudi', 15, 45, 4, 408, 20.3, 23.8, 26.3, 3.0, 835, ARRAY['balanced','low_carb']::text[], ARRAY['hypertension']::text[], ARRAY['لحم', 'بصل', 'طماطم', 'بهارات مشكلة', 'فلفل أسود']::text[], 'يطهى اللحم مع البصل والطماطم والبهارات حتى ينضج ويتركز المرق؛ يقدم مع خضار جانبية.', 'قيمة غذائية مشتقة من SFCT-A لكل حصة تقريبية.'),
    ('sfct-hanini-riyadh', 'sfct-a-pdf', 'حنيني الرياض', 'Riyadh hanini', 'snack', 'saudi', 20, 20, 6, 1502, 30.2, 255.0, 48.0, 10.0, 542, ARRAY['balanced','vegetarian']::text[], ARRAY['diabetes_t2','obesity','high_cholesterol']::text[], ARRAY['قرصان جاف', 'تمر منزوع النوى', 'زبدة', 'دقيق بر']::text[], 'يطحن القرصان ويمزج مع التمر والزبدة ثم يقلب على نار متوسطة حتى يتجانس؛ يفضل تقسيمه إلى حصص صغيرة.', 'قيمة غذائية مشتقة من SFCT-A لكل حصة تقريبية.'),
    ('sfct-bukhari-lamb', 'sfct-a-pdf', 'أرز بخاري باللحم', 'Bukhari rice with lamb', 'lunch', 'saudi', 25, 80, 4, 978, 30.8, 104.0, 48.5, 4.0, 1883, ARRAY['balanced']::text[], ARRAY['hypertension','kidney']::text[], ARRAY['أرز', 'لحم غنم', 'جزر', 'بصل', 'بهارات بخاري', 'زيت']::text[], 'يطهى اللحم بالبهارات ثم يضاف الأرز والجزر حتى ينضج الطبق؛ تقلل كمية الملح في النسخة العلاجية.', 'قيمة غذائية مشتقة من SFCT-A لكل حصة تقريبية.'),
    ('sfct-aysh-lamb', 'sfct-a-pdf', 'عيش باللحم', 'Aish with lamb', 'lunch', 'saudi', 30, 75, 6, 835, 36.0, 73.0, 49.0, 6.0, 820, ARRAY['balanced','high_protein']::text[], ARRAY['kidney']::text[], ARRAY['عجين', 'لحم', 'بصل', 'بهارات', 'سمن']::text[], 'يحضر العجين والحشوة ثم يطهى الطبق حتى تنضج الحشوة ويتماسك الخبز.', 'قيمة غذائية مشتقة من SFCT-A لكل حصة تقريبية.'),
    ('sfct-aysh-chicken', 'sfct-a-pdf', 'عيش بالدجاج', 'Aish with chicken', 'lunch', 'saudi', 30, 70, 6, 815, 37.5, 78.2, 44.0, 6.0, 888, ARRAY['balanced','high_protein']::text[], ARRAY['kidney','hypertension']::text[], ARRAY['عجين', 'دجاج', 'بصل', 'بهارات', 'قليل من السمن']::text[], 'تطهى حشوة الدجاج بالبهارات ثم تجمع مع العجين وتطهى حتى تنضج بالكامل.', 'قيمة غذائية مشتقة من SFCT-A لكل حصة تقريبية.'),
    ('sfct-jubniya-fallah', 'sfct-a-pdf', 'جبنية فلة', 'Jubniya fallah', 'snack', 'saudi', 20, 20, 4, 378, 5.0, 49.3, 18.0, 2.0, 478, ARRAY['balanced','vegetarian']::text[], ARRAY['diabetes_t2','hypertension']::text[], ARRAY['دقيق', 'جبن', 'شيرة', 'زيت للقلي']::text[], 'تحضر عجينة الجبنية وتقلى حتى تصبح ذهبية، ثم تقدم بكمية شيرة خفيفة.', 'قيمة غذائية مشتقة من SFCT-A لكل حصة تقريبية.'),
    ('sfct-saleeg-lamb', 'sfct-a-pdf', 'السليق الطائفي باللحم', 'Taif saleeg with lamb', 'dinner', 'saudi', 15, 75, 4, 743, 23.3, 76.0, 37.8, 0.0, 2045, ARRAY['balanced']::text[], ARRAY['hypertension','kidney','high_cholesterol']::text[], ARRAY['أرز مصري', 'لحم غنم', 'مستكة', 'سمن غنم', 'ماء']::text[], 'يطهى اللحم حتى ينضج، ثم يطهى الأرز في المرق ويقدم مع اللحم وكمية مضبوطة من السمن.', 'قيمة غذائية مشتقة من SFCT-A لكل حصة تقريبية.'),
    ('sfct-saleeg-chicken', 'sfct-a-pdf', 'السليق الطائفي بالدجاج', 'Taif saleeg with chicken', 'dinner', 'saudi', 15, 65, 4, 548, 31.3, 68.8, 16.0, 0.0, 2035, ARRAY['balanced','high_protein']::text[], ARRAY['hypertension','kidney']::text[], ARRAY['أرز مصري', 'دجاج', 'مستكة', 'سمن غنم', 'ماء']::text[], 'يطهى الدجاج ثم يستخدم المرق لطهي الأرز حتى يصبح قوامه ناعمًا؛ تقلل المستكة والسمن عند الحاجة.', 'قيمة غذائية مشتقة من SFCT-A لكل حصة تقريبية.'),
    ('sfct-fried-fish', 'sfct-a-pdf', 'سمك مقلي', 'Fried fish', 'lunch', 'gulf', 15, 20, 4, 338, 58.5, 4.3, 9.0, 0.0, 211, ARRAY['balanced','high_protein','low_carb']::text[], ARRAY['kidney']::text[], ARRAY['سمك', 'دقيق خفيف', 'بهارات', 'زيت للقلي']::text[], 'يتبل السمك ويغطى بطبقة خفيفة ثم يطهى حتى ينضج؛ يمكن شويه لتقليل الدهون.', 'قيمة غذائية مشتقة من SFCT-A لكل حصة تقريبية.'),
    ('sfct-wheat-aseeda', 'sfct-a-pdf', 'عصيدة بدقيق البر', 'Wheat aseeda', 'breakfast', 'saudi', 10, 30, 4, 618, 5.5, 117.5, 18.0, 6.0, 32, ARRAY['balanced','vegetarian']::text[], ARRAY['diabetes_t2']::text[], ARRAY['دقيق بر', 'سمن', 'ماء', 'تمر أو عسل بكمية قليلة']::text[], 'يطهى الدقيق مع الماء حتى يثخن القوام، ثم يضاف السمن بكمية محدودة ويقدم دافئًا.', 'قيمة غذائية مشتقة من SFCT-A لكل حصة تقريبية.'),
    ('sfct-kebab-miroua', 'sfct-a-pdf', 'كباب ميروا / كباب غملي', 'Kebab miroua', 'dinner', 'saudi', 20, 30, 4, 125, 10.3, 10.5, 5.5, 2.0, 179, ARRAY['balanced','low_carb','diabetes_friendly']::text[], ARRAY[]::text[], ARRAY['لحم مفروم', 'دقيق أو خبز مطحون', 'بصل', 'بهارات', 'أعشاب']::text[], 'يمزج اللحم مع البصل والبهارات ويشكل كأقراص صغيرة ثم يطهى حتى ينضج.', 'قيمة غذائية مشتقة من SFCT-A لكل حصة تقريبية.'),
    ('sfct-mushabbak', 'sfct-a-pdf', 'مشبك', 'Mushabbak', 'snack', 'saudi', 25, 20, 4, 728, 4.5, 94.5, 37.5, 1.0, 578, ARRAY['balanced','vegetarian']::text[], ARRAY['diabetes_t2','obesity','hypertension']::text[], ARRAY['دقيق', 'نشا', 'خميرة', 'زيت للقلي', 'شيرة']::text[], 'تحضر عجينة سائلة وتشكّل في الزيت ثم تقدم بكمية شيرة مضبوطة.', 'قيمة غذائية مشتقة من SFCT-A لكل حصة تقريبية.'),
    ('sfct-musharmal', 'sfct-a-pdf', 'مشرمل', 'Musharmal', 'lunch', 'saudi', 20, 45, 4, 848, 74.5, 33.3, 52.8, 2.0, 815, ARRAY['balanced','high_protein','low_carb']::text[], ARRAY['kidney','high_cholesterol']::text[], ARRAY['لحم', 'طماطم', 'بصل', 'بهارات', 'سمن']::text[], 'يطهى اللحم مع الخضار والبهارات حتى يتركز الطعم؛ يوازن الطبق بخضار وألياف جانبية.', 'قيمة غذائية مشتقة من SFCT-A لكل حصة تقريبية.'),
    ('national-mantu', 'national-day-menu-arabic-2024', 'منتو', 'Mantu', 'lunch', 'saudi', 45, 35, 4, 360, 22.0, 42.0, 12.0, 3.0, 520, ARRAY['balanced','high_protein']::text[], ARRAY['hypertension']::text[], ARRAY['عجينة رقيقة', 'لحم مفروم', 'بصل', 'كمون', 'فلفل أسود', 'صلصة خفيفة']::text[], 'تحشى العجينة باللحم المتبل وتطهى على البخار، ثم تقدم مع صلصة خفيفة ورشة كمون.', 'تقدير افتتاحي من قائمة اليوم الوطني.'),
    ('national-kubaiba-hail', 'national-day-menu-arabic-2024', 'كبيبة حائل', 'Hail kubaiba', 'lunch', 'saudi', 40, 55, 4, 420, 20.0, 38.0, 20.0, 4.0, 680, ARRAY['balanced']::text[], ARRAY['hypertension']::text[], ARRAY['ورق عنب', 'لحم', 'رز أو حبوب', 'سمن بلدي', 'بهارات الرصار']::text[], 'تلف الحشوة داخل ورق العنب بشكل رباعي أو خماسي وتطهى في مرق غني بالبهارات المحلية.', 'تقدير افتتاحي من قائمة اليوم الوطني.'),
    ('national-shrimp-hamsa', 'national-day-menu-arabic-2024', 'حمسة ربيان', 'Shrimp hamsa', 'dinner', 'gulf', 15, 20, 4, 260, 30.0, 12.0, 9.0, 2.0, 410, ARRAY['balanced','high_protein','low_carb','diabetes_friendly']::text[], ARRAY['seafood_allergy','kidney']::text[], ARRAY['ربيان', 'بصل', 'فلفل', 'طماطم', 'ليمون أسود', 'بهارات خليجية']::text[], 'يشوح الربيان سريعًا مع البصل والطماطم والبهارات حتى ينضج دون أن يجف.', 'تقدير افتتاحي من قائمة اليوم الوطني.'),
    ('national-mutabbaq', 'national-day-menu-arabic-2024', 'مطبق', 'Mutabbaq', 'dinner', 'saudi', 35, 20, 4, 430, 24.0, 46.0, 17.0, 3.0, 620, ARRAY['balanced','high_protein']::text[], ARRAY['hypertension']::text[], ARRAY['عجينة مطبق', 'بيض', 'لحم مفروم', 'كراث', 'بصل', 'بهارات']::text[], 'تحشى رقائق العجين بمزيج البيض واللحم والكراث، ثم تطهى على الصاج حتى تتحمر.', 'تقدير افتتاحي من قائمة اليوم الوطني.'),
    ('national-luqaimat', 'national-day-menu-arabic-2024', 'لقيمات', 'Luqaimat', 'snack', 'saudi', 30, 20, 6, 240, 4.0, 44.0, 6.0, 1.0, 190, ARRAY['balanced','vegetarian']::text[], ARRAY['diabetes_t2','obesity']::text[], ARRAY['دقيق', 'خميرة', 'هيل', 'زعفران', 'زيت للقلي', 'شيرة خفيفة']::text[], 'تحضر عجينة خفيفة وتترك لتختمر، ثم تقلى ككرات صغيرة وتقدم بكمية شيرة معتدلة.', 'تقدير افتتاحي من قائمة اليوم الوطني.'),
    ('trip-tamees', 'thirty-dish-trip', 'خبز التميس', 'Tamees bread', 'breakfast', 'saudi', 45, 8, 4, 285, 8.5, 55.0, 3.5, 2.4, 410, ARRAY['balanced','vegetarian']::text[], ARRAY['hypertension','diabetes_t2']::text[], ARRAY['دقيق', 'خميرة', 'ماء دافئ', 'زيت زيتون', 'سمسم أو حبة سوداء']::text[], 'تعجن المكونات وتفرد كقرص رقيق ثم تخبز على حرارة عالية حتى ينتفخ ويتحمر الوجه.', 'تقدير افتتاحي من رحلة ثلاثين طبق.'),
    ('trip-harees-soup', 'thirty-dish-trip', 'شوربة الهريس', 'Harees soup', 'soup', 'saudi', 20, 60, 4, 310, 18.0, 38.0, 9.0, 5.0, 420, ARRAY['balanced','high_protein']::text[], ARRAY['hypertension']::text[], ARRAY['قمح هريس', 'دجاج أو لحم', 'بصل', 'بهارات خفيفة', 'مرق']::text[], 'يطهى الهريس مع البروتين والمرق حتى يلين، ثم يهرس جزئيًا للحصول على قوام شوربة.', 'تقدير افتتاحي من رحلة ثلاثين طبق.'),
    ('soups-eggplant-cream', 'houria-soups', 'كريمة الباذنجان', 'Eggplant cream soup', 'soup', 'arab', 15, 35, 4, 220, 6.0, 24.0, 11.0, 5.0, 360, ARRAY['balanced','vegetarian']::text[], ARRAY['high_cholesterol']::text[], ARRAY['باذنجان مشوي', 'بطاطس', 'بصل', 'مرق', 'طحين', 'كريمة اختيارية']::text[], 'يشوى الباذنجان ثم يطهى مع البطاطس والبصل والمرق ويخلط حتى يصبح ناعمًا؛ يمكن تقليل الكريمة.', 'ملخص معاد صياغته من ملف الشوربات.'),
    ('sohba-salt-baked-fish', 'sohba-main-dishes', 'السمك في غلاف الملح', 'Salt baked fish', 'lunch', 'mediterranean', 15, 25, 4, 250, 34.0, 0.0, 11.0, 0.0, 520, ARRAY['balanced','high_protein','low_carb','diabetes_friendly']::text[], ARRAY['hypertension','kidney']::text[], ARRAY['سمكة كاملة', 'بياض بيض', 'ملح للتغليف لا يؤكل', 'شمر أو زعتر طازج']::text[], 'تغلف السمكة بطبقة ملحية للحبس الحراري ثم تخبز وتزال القشرة قبل التقديم.', 'ملخص معاد صياغته من صحبة طيبة.'),
    ('kitchen-lemon-mint', 'our-kitchen-adventures', 'عصير الليمون بالنعناع', 'Lemon mint drink', 'snack', 'saudi', 10, 0, 4, 80, 0.4, 20.0, 0.1, 0.5, 8, ARRAY['balanced','vegetarian','vegan','gluten_free']::text[], ARRAY['diabetes_t2']::text[], ARRAY['ليمون', 'نعناع', 'ماء بارد', 'عسل بكمية قليلة']::text[], 'يعصر الليمون ويمزج مع النعناع والماء البارد ومحلي خفيف حسب الحاجة.', 'تقدير افتتاحي من Our Kitchen Adventures.')
  ) as r(external_id, source_slug, name_ar, name_en, category, cuisine, prep_time_min, cook_time_min, servings, calories, protein_g, carbs_g, fat_g, fiber_g, sodium_mg, suitable_for, avoid_for, ingredients_ar, instructions_ar, source_notes_ar)
)
insert into recipes (
  external_id,
  source_id,
  name_ar,
  name_en,
  category,
  cuisine,
  prep_time_min,
  cook_time_min,
  servings,
  calories,
  protein_g,
  carbs_g,
  fat_g,
  fiber_g,
  sodium_mg,
  suitable_for,
  avoid_for,
  diet_tags,
  ingredients_ar,
  instructions_ar,
  source_notes_ar
)
select
  r.external_id,
  s.id,
  r.name_ar,
  r.name_en,
  r.category,
  r.cuisine,
  r.prep_time_min,
  r.cook_time_min,
  r.servings,
  r.calories,
  r.protein_g,
  r.carbs_g,
  r.fat_g,
  r.fiber_g,
  r.sodium_mg,
  r.suitable_for,
  r.avoid_for,
  case
    when r.category = 'snack' and r.calories > 500 then ARRAY['balanced']::text[]
    when 'low_carb' = any(r.suitable_for) then ARRAY['balanced','low_carb']::text[]
    when 'high_protein' = any(r.suitable_for) then ARRAY['balanced','high_protein']::text[]
    else ARRAY['balanced']::text[]
  end,
  to_jsonb(r.ingredients_ar),
  r.instructions_ar,
  r.source_notes_ar
from recipe_rows r
join nutrition_sources s on s.slug = r.source_slug
on conflict (external_id) do update set
  source_id = excluded.source_id,
  name_ar = excluded.name_ar,
  name_en = excluded.name_en,
  category = excluded.category,
  cuisine = excluded.cuisine,
  prep_time_min = excluded.prep_time_min,
  cook_time_min = excluded.cook_time_min,
  servings = excluded.servings,
  calories = excluded.calories,
  protein_g = excluded.protein_g,
  carbs_g = excluded.carbs_g,
  fat_g = excluded.fat_g,
  fiber_g = excluded.fiber_g,
  sodium_mg = excluded.sodium_mg,
  suitable_for = excluded.suitable_for,
  avoid_for = excluded.avoid_for,
  diet_tags = excluded.diet_tags,
  ingredients_ar = excluded.ingredients_ar,
  instructions_ar = excluded.instructions_ar,
  source_notes_ar = excluded.source_notes_ar;

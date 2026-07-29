-- Zaad recipe library supplement from Markdown extractions
-- Run after saudi-recipes-seed.sql. Instructions are short adapted summaries.

insert into nutrition_sources
  (slug, name_ar, name_en, scope, source_type, authority, url, license_note, priority, notes_ar)
values
  ('saudi-recipe-markdown-supplement', 'دفعة Markdown للوصفات السعودية والعربية', 'Saudi and Arab recipe Markdown supplement', 'arab', 'recipes', null, null, 'ملفات مقدمة من المستخدم؛ استخدمنا ملخصات وصفية فقط.', 45, 'دفعة تكمل مكتبة الوصفات من ملفات Markdown المستخرجة.')
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
    ('sohba-maqluba-eggplant-lamb', 'sohba-main-dishes', 'مقلوبة الباذنجان باللحم', 'Eggplant maqluba with lamb', 'lunch', 'levant', 35, 75, 6, 560, 26.0, 58.0, 25.0, 6.0, 640, ARRAY['balanced']::text[], ARRAY['hypertension','high_cholesterol']::text[], ARRAY['لحم ضأن', 'باذنجان', 'أرز', 'حمص', 'جزر', 'لوز أو صنوبر', 'بهارات']::text[], 'تطهى قطع اللحم وتصفى المرقة، ثم ترتب طبقات الباذنجان والخضار والأرز وتطهى حتى ينضج الأرز وتقلب للتقديم.', 'ملخص معاد صياغته من صحبة طيبة.'),
    ('sohba-dawood-basha', 'sohba-main-dishes', 'داوود باشا', 'Dawood basha', 'dinner', 'levant', 25, 40, 4, 430, 28.0, 20.0, 26.0, 4.0, 580, ARRAY['balanced','low_carb']::text[], ARRAY['hypertension','high_cholesterol']::text[], ARRAY['لحم مفروم', 'صنوبر', 'بندورة', 'بصل', 'بهار حلو', 'قرفة', 'زيت زيتون']::text[], 'تشكل كرات اللحم وتحمّر، ثم تطهى في صلصة بندورة متبلة حتى تتماسك النكهة؛ تقدم مع أرز أو خضار.', 'ملخص معاد صياغته من صحبة طيبة.'),
    ('sohba-stuffed-peppers', 'sohba-main-dishes', 'فلفل محشي', 'Stuffed peppers', 'lunch', 'levant', 35, 55, 6, 360, 16.0, 46.0, 13.0, 5.0, 520, ARRAY['balanced']::text[], ARRAY['hypertension']::text[], ARRAY['فلفل رومي', 'أرز قصير الحبة', 'لحم مفروم', 'ثوم', 'نعناع', 'بندورة', 'معجون بندورة']::text[], 'يحشى الفلفل بخليط الأرز واللحم والبهارات، ثم يطهى في صلصة بندورة ونعناع حتى ينضج الحشو.', 'ملخص معاد صياغته من صحبة طيبة.'),
    ('sohba-dry-beans-lamb', 'sohba-main-dishes', 'فاصوليا يابسة باللحم', 'Dry beans with lamb', 'lunch', 'levant', 25, 90, 6, 470, 31.0, 42.0, 19.0, 11.0, 610, ARRAY['balanced','high_protein']::text[], ARRAY['hypertension','kidney']::text[], ARRAY['فاصوليا بيضاء', 'لحم ضأن', 'بصل', 'ثوم', 'بندورة', 'كزبرة', 'قرفة']::text[], 'تنقع الفاصوليا ثم تطهى مع اللحم والبندورة والبهارات حتى تلين وتصبح الصلصة كثيفة.', 'ملخص معاد صياغته من صحبة طيبة.'),
    ('sohba-bulgur-nuts', 'sohba-main-dishes', 'برغل مفلفل بالمكسرات', 'Bulgur with nuts', 'dinner', 'levant', 15, 30, 4, 390, 10.0, 58.0, 13.0, 9.0, 380, ARRAY['balanced','vegetarian']::text[], ARRAY['nut_allergy']::text[], ARRAY['برغل خشن', 'بصل', 'مرق أو ماء', 'لوز', 'صنوبر', 'بهارات خفيفة']::text[], 'يشوح البصل ثم يضاف البرغل والمرق ويطهى حتى يتفتح، ويزين بالمكسرات المحمصة بكمية معتدلة.', 'ملخص معاد صياغته من صحبة طيبة.'),
    ('sohba-shish-kebab', 'sohba-main-dishes', 'شيش كباب', 'Shish kebab', 'dinner', 'levant', 20, 18, 4, 410, 34.0, 8.0, 27.0, 2.0, 510, ARRAY['balanced','high_protein','low_carb']::text[], ARRAY['high_cholesterol']::text[], ARRAY['لحم ضأن هبر', 'بصل', 'عصير ليمون', 'زيت زيتون', 'بهار حلو', 'كزبرة']::text[], 'تتبل مكعبات اللحم بالليمون والزيت والبهارات، ثم تشك في أسياخ وتشوى حتى تنضج.', 'ملخص معاد صياغته من صحبة طيبة.'),
    ('sohba-shish-tawook', 'sohba-main-dishes', 'شيش طاووق', 'Shish tawook', 'dinner', 'levant', 20, 18, 4, 330, 38.0, 7.0, 16.0, 1.0, 540, ARRAY['balanced','high_protein','low_carb','diabetes_friendly']::text[], ARRAY['hypertension']::text[], ARRAY['صدر دجاج', 'لبن', 'ثوم', 'ليمون', 'كزبرة', 'بابريكا', 'زيت زيتون']::text[], 'يتبل الدجاج باللبن والثوم والليمون والبهارات، ثم يشوى على أسياخ ويقدم مع سلطة أو ثوم خفيف.', 'ملخص معاد صياغته من صحبة طيبة.'),
    ('sohba-molokhia-chicken', 'sohba-main-dishes', 'ملوخية بالدجاج', 'Molokhia with chicken', 'lunch', 'levant', 20, 55, 6, 380, 32.0, 18.0, 21.0, 6.0, 590, ARRAY['balanced','high_protein']::text[], ARRAY['hypertension']::text[], ARRAY['دجاج', 'ملوخية', 'ثوم', 'كزبرة', 'ليمون', 'مرق', 'قرفة']::text[], 'يطهى الدجاج في مرق عطري، ثم تضاف الملوخية وتنهى بتقلية الثوم والكزبرة وعصير الليمون.', 'ملخص معاد صياغته من صحبة طيبة.'),
    ('sohba-vermicelli-rice', 'sohba-main-dishes', 'أرز بالشعيرية', 'Vermicelli rice', 'lunch', 'levant', 10, 25, 4, 310, 6.0, 58.0, 6.0, 1.0, 300, ARRAY['balanced','vegetarian']::text[], ARRAY['diabetes_t2']::text[], ARRAY['أرز', 'شعيرية', 'زبد أو زيت', 'ماء أو مرق', 'ملح قليل']::text[], 'تحمص الشعيرية ثم يضاف الأرز والسائل ويطهى على نار هادئة حتى يتفلفل.', 'ملخص معاد صياغته من صحبة طيبة.'),
    ('sohba-potato-kibbeh', 'sohba-main-dishes', 'كبة بطاطا محشوة', 'Stuffed potato kibbeh', 'dinner', 'levant', 45, 35, 6, 420, 16.0, 52.0, 17.0, 6.0, 520, ARRAY['balanced']::text[], ARRAY['diabetes_t2','hypertension']::text[], ARRAY['بطاطا', 'برغل', 'لحم مفروم أو سبانخ', 'بصل', 'صنوبر', 'سماق', 'بهارات']::text[], 'تجهز عجينة البطاطا والبرغل، تحشى بحشوة اللحم أو السبانخ، ثم تخبز أو تقلى حسب النسخة المطلوبة.', 'ملخص معاد صياغته من صحبة طيبة.'),
    ('sohba-zucchini-tomato-oil', 'sohba-main-dishes', 'كوسا وبندورة بالزيت', 'Zucchini tomato in olive oil', 'dinner', 'levant', 15, 25, 4, 180, 4.0, 16.0, 11.0, 5.0, 260, ARRAY['balanced','vegetarian','vegan','diabetes_friendly']::text[], ARRAY[]::text[], ARRAY['كوسا', 'بندورة', 'بصل', 'ثوم', 'نعناع', 'زيت زيتون']::text[], 'تشوح الكوسا مع البصل والثوم، ثم تضاف البندورة والنعناع وتطهى حتى تلين؛ تقدم دافئة أو باردة.', 'ملخص معاد صياغته من صحبة طيبة.'),
    ('sohba-kofta-tray', 'sohba-main-dishes', 'كفتة بالصينية', 'Kofta tray bake', 'lunch', 'levant', 25, 45, 6, 480, 28.0, 32.0, 27.0, 4.0, 650, ARRAY['balanced','high_protein']::text[], ARRAY['hypertension','high_cholesterol']::text[], ARRAY['لحم مفروم', 'بقدونس', 'بصل', 'بطاطا', 'بندورة', 'رب بندورة', 'بهارات']::text[], 'تفرد الكفتة في صينية، وتغطى بشرائح البطاطا والبندورة وصلصة رب البندورة، ثم تخبز حتى تنضج.', 'ملخص معاد صياغته من صحبة طيبة.'),
    ('sohba-sfeeha-lamb', 'sohba-main-dishes', 'صفيحة اللحم', 'Lamb sfeeha', 'snack', 'levant', 45, 18, 8, 290, 12.0, 34.0, 11.0, 2.0, 430, ARRAY['balanced']::text[], ARRAY['hypertension']::text[], ARRAY['دقيق', 'لبن', 'لحم ضأن مفروم', 'بصل', 'بندورة', 'بقدونس', 'دبس رمان']::text[], 'تحضر عجينة طرية وتترك لتختمر، ثم تفرد وتغطى بحشوة اللحم المتبلة وتخبز حتى تتحمر الحواف.', 'ملخص معاد صياغته من صحبة طيبة.'),
    ('sohba-kibbeh-tray', 'sohba-main-dishes', 'كبة بالصينية', 'Baked kibbeh tray', 'lunch', 'levant', 45, 40, 8, 430, 22.0, 34.0, 24.0, 5.0, 560, ARRAY['balanced']::text[], ARRAY['hypertension','high_cholesterol']::text[], ARRAY['برغل ناعم', 'لحم هبر', 'بصل', 'لحم مفروم للحشو', 'صنوبر', 'سماق', 'دبس رمان']::text[], 'تجهز عجينة الكبة وتفرد طبقاتها مع الحشوة في صينية، ثم تخبز حتى تتماسك وتتحمر.', 'ملخص معاد صياغته من صحبة طيبة.'),
    ('sohba-fried-kibbeh', 'sohba-main-dishes', 'كبة مقلية', 'Fried kibbeh', 'snack', 'levant', 55, 25, 8, 350, 19.0, 28.0, 19.0, 4.0, 520, ARRAY['balanced','high_protein']::text[], ARRAY['hypertension','high_cholesterol']::text[], ARRAY['برغل ناعم', 'لحم ضأن هبر', 'بصل', 'حشوة لحم', 'صنوبر', 'بهارات']::text[], 'تشكل عجينة الكبة حول الحشوة، ثم تطهى حتى تنضج؛ يمكن خبزها لتقليل الدهون.', 'ملخص معاد صياغته من صحبة طيبة.'),
    ('sohba-moussaka', 'sohba-main-dishes', 'مسقعة بالحمص ودبس الرمان', 'Eggplant moussaka with chickpeas', 'dinner', 'levant', 25, 45, 6, 310, 9.0, 34.0, 16.0, 9.0, 420, ARRAY['balanced','vegetarian','vegan']::text[], ARRAY['ibs']::text[], ARRAY['باذنجان', 'حمص', 'بصل', 'ثوم', 'بندورة', 'دبس رمان', 'صنوبر']::text[], 'تخبز شرائح الباذنجان ثم تطهى مع صلصة البندورة والحمص ودبس الرمان وتزين بالصنوبر.', 'ملخص معاد صياغته من صحبة طيبة.'),
    ('sohba-mini-lamb-burger', 'sohba-main-dishes', 'برجر ضأن صغير', 'Mini lamb burger', 'dinner', 'levant', 15, 15, 4, 390, 24.0, 22.0, 24.0, 2.0, 570, ARRAY['balanced','high_protein']::text[], ARRAY['hypertension','high_cholesterol']::text[], ARRAY['لحم ضأن مفروم', 'بصل', 'بقدونس', 'قرفة', 'بهار حلو', 'كزبرة', 'خبز صغير']::text[], 'يمزج اللحم مع البصل والبقدونس والبهارات، ثم يشكل أقراصًا صغيرة وتشوى أو تطهى في مقلاة.', 'ملخص معاد صياغته من صحبة طيبة.'),

    ('soups-zucchini-artichoke-cream', 'houria-soups', 'كريمة الكوسة والأرضي شوكي', 'Zucchini artichoke cream soup', 'soup', 'mediterranean', 15, 30, 4, 240, 7.0, 24.0, 13.0, 6.0, 410, ARRAY['balanced','vegetarian']::text[], ARRAY['high_cholesterol']::text[], ARRAY['كوسة', 'أرضي شوكي', 'كراث', 'ثوم', 'بقدونس', 'مرق', 'كريمة حامضة']::text[], 'تشوح الخضار العطرية ثم تطهى الكوسة والأرضي شوكي في المرق وتخلط حتى تصبح كريمية.', 'ملخص معاد صياغته من شوربات حورية.'),
    ('soups-leek-cream', 'houria-soups', 'كريمة الكراث', 'Leek cream soup', 'soup', 'mediterranean', 15, 25, 4, 230, 6.0, 28.0, 10.0, 4.0, 390, ARRAY['balanced','vegetarian']::text[], ARRAY['high_cholesterol']::text[], ARRAY['كراث', 'بصل', 'طحين', 'مرق دجاج أو خضار', 'كريمة', 'جوزة الطيب']::text[], 'يطهى الكراث والبصل برفق، ثم يضاف الطحين والمرق وتخلط الشوربة مع الكريمة قبل التقديم.', 'ملخص معاد صياغته من شوربات حورية.'),
    ('soups-oat-harira', 'houria-soups', 'حريرة الشوفان', 'Oat harira soup', 'soup', 'maghrebi', 15, 45, 6, 280, 14.0, 38.0, 8.0, 7.0, 480, ARRAY['balanced','high_protein']::text[], ARRAY['hypertension']::text[], ARRAY['شوفان', 'حمص أو عدس', 'طماطم', 'بصل', 'كزبرة', 'مرق', 'بهارات']::text[], 'تطهى البقول والطماطم والبهارات ثم يضاف الشوفان ليعطي قوامًا غنيًا ومشبعًا.', 'ملخص معاد صياغته من شوربات حورية.'),
    ('soups-spinach-greens', 'houria-soups', 'شوربة السبانخ والخضار الورقية', 'Spinach greens soup', 'soup', 'mediterranean', 15, 40, 4, 210, 10.0, 25.0, 8.0, 8.0, 360, ARRAY['balanced','vegetarian','diabetes_friendly']::text[], ARRAY['kidney']::text[], ARRAY['سبانخ', 'سلق', 'جرجير', 'عدس بني', 'كراث', 'ثوم', 'بطاطس']::text[], 'تشوح الخضار العطرية ثم تطهى الورقيات والعدس والبطاطس في المرق وتخلط مع عصرة ليمون.', 'ملخص معاد صياغته من شوربات حورية.'),
    ('soups-fish', 'houria-soups', 'شوربة السمك', 'Fish soup', 'soup', 'mediterranean', 20, 45, 4, 260, 30.0, 18.0, 8.0, 4.0, 520, ARRAY['balanced','high_protein','low_carb']::text[], ARRAY['seafood_allergy','kidney']::text[], ARRAY['سمك أبيض', 'جمبري اختياري', 'بطاطس', 'جزر', 'كراث', 'طماطم', 'زعتر وغار']::text[], 'يحضر مرق بالخضار والسمك، ثم يصفى ويعاد مع قطع السمك والتوابل حتى تنضج.', 'ملخص معاد صياغته من شوربات حورية.'),
    ('soups-crab', 'houria-soups', 'شوربة السلطعون', 'Crab soup', 'soup', 'mediterranean', 15, 25, 4, 220, 18.0, 20.0, 9.0, 2.0, 610, ARRAY['balanced','high_protein']::text[], ARRAY['seafood_allergy','hypertension']::text[], ARRAY['لحم سلطعون', 'بصل', 'أرز', 'حليب أو كريمة', 'شبت', 'تاباسكو', 'شمر']::text[], 'يطهى البصل والأرز ثم يضاف السلطعون والحليب أو الكريمة والشبت للحصول على شوربة بحرية ناعمة.', 'ملخص معاد صياغته من شوربات حورية.'),
    ('soups-white-vermicelli', 'houria-soups', 'شوربة بيضاء بالشعيرية', 'White vermicelli soup', 'soup', 'arab', 10, 20, 4, 190, 8.0, 25.0, 6.0, 1.0, 430, ARRAY['balanced']::text[], ARRAY['hypertension']::text[], ARRAY['شعيرية', 'مرق دجاج', 'حليب أو كريمة خفيفة', 'فلفل أبيض', 'بقدونس']::text[], 'تطهى الشعيرية في المرق ثم يضاف الحليب أو الكريمة الخفيفة وتقدم ساخنة بقوام لطيف.', 'ملخص معاد صياغته من شوربات حورية.'),
    ('soups-cauliflower-cream', 'houria-soups', 'شوربة الزهرة', 'Cauliflower soup', 'soup', 'mediterranean', 15, 35, 4, 210, 9.0, 22.0, 10.0, 5.0, 370, ARRAY['balanced','vegetarian','diabetes_friendly']::text[], ARRAY['high_cholesterol']::text[], ARRAY['زهرة', 'بصل', 'ثوم', 'مرق', 'كريمة', 'كمون', 'جبن بارميزان اختياري']::text[], 'تطهى الزهرة مع البصل والثوم والمرق، ثم تخلط وتنهى بكمون وقليل من الكريمة أو الجبن.', 'ملخص معاد صياغته من شوربات حورية.'),
    ('soups-freekeh-meatballs', 'houria-soups', 'شوربة فريك بكرات اللحم', 'Freekeh meatball soup', 'soup', 'arab', 25, 45, 6, 330, 22.0, 34.0, 12.0, 7.0, 520, ARRAY['balanced','high_protein']::text[], ARRAY['hypertension']::text[], ARRAY['فريك', 'لحم مفروم', 'بصل', 'مرق', 'بهارات', 'بقدونس']::text[], 'تشكل كرات لحم صغيرة وتطهى مع الفريك والمرق حتى يصبح القوام غنيًا ومشبعًا.', 'ملخص معاد صياغته من شوربات حورية.'),
    ('soups-mushroom', 'houria-soups', 'شوربة فطر', 'Mushroom soup', 'soup', 'mediterranean', 10, 25, 4, 200, 7.0, 18.0, 11.0, 3.0, 360, ARRAY['balanced','vegetarian']::text[], ARRAY['high_cholesterol']::text[], ARRAY['فطر', 'زبدة', 'طحين', 'مرق', 'كريمة', 'بقدونس']::text[], 'يشوح الفطر ثم يضاف الطحين والمرق وتخلط الشوربة، مع ترك بعض قطع الفطر للتقديم.', 'ملخص معاد صياغته من شوربات حورية.'),
    ('soups-lisan-asfour-oat', 'houria-soups', 'شوربة لسان العصفور بالشوفان', 'Orzo oat soup', 'soup', 'arab', 10, 25, 4, 230, 9.0, 36.0, 6.0, 4.0, 430, ARRAY['balanced']::text[], ARRAY['diabetes_t2','hypertension']::text[], ARRAY['لسان عصفور', 'شوفان', 'مرق', 'طماطم اختيارية', 'بصل', 'بهارات']::text[], 'يحمص لسان العصفور قليلًا ثم يطهى مع الشوفان والمرق حتى تصبح الشوربة متماسكة.', 'ملخص معاد صياغته من شوربات حورية.'),
    ('soups-asparagus', 'houria-soups', 'شوربة الهليون', 'Asparagus soup', 'soup', 'mediterranean', 15, 30, 4, 210, 8.0, 20.0, 11.0, 5.0, 350, ARRAY['balanced','vegetarian','diabetes_friendly']::text[], ARRAY['high_cholesterol']::text[], ARRAY['هليون', 'بصل', 'كرفس', 'طحين', 'مرق', 'كريمة', 'كزبرة']::text[], 'يطهى الهليون مع البصل والكرفس والمرق، ثم يخلط ويزين برؤوس الهليون.', 'ملخص معاد صياغته من شوربات حورية.'),
    ('soups-shrimp', 'houria-soups', 'شوربة الجمبري', 'Shrimp soup', 'soup', 'gulf', 15, 25, 4, 240, 26.0, 20.0, 7.0, 3.0, 560, ARRAY['balanced','high_protein','low_carb']::text[], ARRAY['seafood_allergy','kidney','hypertension']::text[], ARRAY['جمبري', 'طماطم', 'ثوم', 'زعتر', 'غار', 'كزبرة', 'معكرونة قليلة']::text[], 'يطهى الجمبري في مرق عطري ثم يضاف إلى قاعدة طماطم وكزبرة مع كمية صغيرة من المعكرونة.', 'ملخص معاد صياغته من شوربات حورية.'),
    ('soups-lentil-wheat', 'houria-soups', 'شوربة عدس أحمر بالقمح', 'Red lentil wheat soup', 'soup', 'arab', 15, 40, 6, 290, 15.0, 46.0, 6.0, 10.0, 420, ARRAY['balanced','vegetarian','vegan']::text[], ARRAY['ibs']::text[], ARRAY['عدس أحمر', 'قمح', 'بصل', 'جزر', 'كمون', 'مرق خضار']::text[], 'يطهى العدس والقمح مع الخضار والكمون حتى يلين الخليط ويهرس جزئيًا.', 'ملخص معاد صياغته من شوربات حورية.'),
    ('soups-legumes-chicken', 'houria-soups', 'شوربة البقوليات والدجاج', 'Legume chicken soup', 'soup', 'arab', 20, 55, 6, 340, 26.0, 36.0, 10.0, 9.0, 520, ARRAY['balanced','high_protein']::text[], ARRAY['kidney','hypertension']::text[], ARRAY['دجاج', 'حمص', 'عدس', 'فاصوليا', 'بصل', 'طماطم', 'بهارات']::text[], 'تطهى البقول المنقوعة مع الدجاج والخضار حتى تنضج وتصبح الشوربة غنية بالبروتين والألياف.', 'ملخص معاد صياغته من شوربات حورية.'),
    ('soups-quaker', 'houria-soups', 'شوربة كويكر', 'Quaker oat soup', 'soup', 'gulf', 10, 25, 4, 220, 12.0, 32.0, 6.0, 5.0, 430, ARRAY['balanced']::text[], ARRAY['hypertension']::text[], ARRAY['شوفان', 'دجاج أو لحم مفروم', 'طماطم', 'بصل', 'مرق', 'بهارات خليجية']::text[], 'يطهى الشوفان مع مرق خفيف وطماطم وبروتين بسيط حتى يعطي قوامًا ناعمًا مناسبًا للعشاء.', 'ملخص معاد صياغته من شوربات حورية.'),
    ('soups-potato', 'houria-soups', 'شوربة البطاطس', 'Potato soup', 'soup', 'mediterranean', 10, 30, 4, 240, 7.0, 35.0, 8.0, 4.0, 360, ARRAY['balanced','vegetarian']::text[], ARRAY['diabetes_t2']::text[], ARRAY['بطاطس', 'بصل', 'كراث اختياري', 'مرق', 'حليب', 'فلفل أبيض']::text[], 'تطهى البطاطس مع البصل والمرق ثم تخلط وتخفف بالحليب حتى تصبح كريمية.', 'ملخص معاد صياغته من شوربات حورية.'),

    ('national-karkadeh-drink', 'national-day-menu-arabic-2024', 'كجراتي / شراب الكركديه', 'Karkadeh drink', 'snack', 'saudi', 10, 10, 4, 70, 0.2, 17.0, 0.0, 0.3, 12, ARRAY['balanced','vegetarian','vegan','gluten_free']::text[], ARRAY['diabetes_t2']::text[], ARRAY['كركديه', 'ماء', 'سكر أو عسل بكمية قليلة', 'ثلج']::text[], 'ينقع الكركديه أو يغلى برفق ثم يبرد ويحلى بكمية مضبوطة حسب الخطة.', 'ملخص معاد صياغته من قائمة اليوم الوطني.'),
    ('national-balila-pickle', 'national-day-menu-arabic-2024', 'مخلل البليلة', 'Balila pickle', 'snack', 'saudi', 15, 0, 6, 120, 5.0, 20.0, 2.0, 5.0, 520, ARRAY['balanced','vegetarian','vegan']::text[], ARRAY['hypertension','ibs']::text[], ARRAY['حمص مسلوق', 'خل', 'كمون', 'فلفل', 'ليمون', 'خضار مخللة']::text[], 'يمزج الحمص المسلوق مع تتبيلة خل وليمون وكمون، ويقدم كإضافة صغيرة بجانب الأطباق.', 'ملخص معاد صياغته من قائمة اليوم الوطني.'),
    ('national-mutaziz', 'national-day-menu-arabic-2024', 'مطازيز', 'Mutaziz', 'lunch', 'saudi', 40, 70, 6, 520, 25.0, 64.0, 18.0, 8.0, 680, ARRAY['balanced']::text[], ARRAY['hypertension','diabetes_t2']::text[], ARRAY['مطازيز جافة أو عجين بر', 'لحم', 'خضار', 'طماطم', 'ليمون أسود', 'بهارات']::text[], 'تطهى الخضار واللحم في صلصة غنية، ثم تضاف قطع المطازيز حتى تلين وتمتص النكهة.', 'ملخص معاد صياغته من قائمة اليوم الوطني.'),
    ('national-mango-harees', 'national-day-menu-arabic-2024', 'هريس المانجو', 'Mango harees dessert', 'snack', 'saudi', 15, 20, 6, 260, 5.0, 48.0, 6.0, 3.0, 120, ARRAY['balanced','vegetarian']::text[], ARRAY['diabetes_t2','obesity']::text[], ARRAY['مانجو', 'قمح هريس أو شوفان', 'حليب', 'هيل', 'محلي خفيف']::text[], 'يطهى الهريس أو الشوفان بالحليب ثم يخلط مع المانجو والهيل ويقدم كحلوى بكميات صغيرة.', 'ملخص معاد صياغته من قائمة اليوم الوطني.'),
    ('national-mastic-scented-water', 'national-day-menu-arabic-2024', 'ماء مبخر بالمستكة', 'Mastic scented water', 'snack', 'saudi', 5, 5, 4, 5, 0.0, 1.0, 0.0, 0.0, 4, ARRAY['balanced','vegetarian','vegan','gluten_free','diabetes_friendly']::text[], ARRAY[]::text[], ARRAY['ماء', 'مستكة', 'ماء ورد اختياري', 'ثلج']::text[], 'يعطر الماء بالمستكة وقليل من ماء الورد ويقدم باردًا كخيار منخفض السعرات.', 'ملخص معاد صياغته من قائمة اليوم الوطني.')
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
    when 'diabetes_friendly' = any(r.suitable_for) then ARRAY['balanced','diabetes_friendly']::text[]
    when 'low_carb' = any(r.suitable_for) then ARRAY['balanced','low_carb']::text[]
    when 'high_protein' = any(r.suitable_for) then ARRAY['balanced','high_protein']::text[]
    when 'vegetarian' = any(r.suitable_for) then ARRAY['balanced','vegetarian']::text[]
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

-- Zaad nutrition reference layer
-- Run after the base schema. This adds public read-only reference data for
-- Saudi/Gulf food composition, branded foods, standards, and recipe ingredients.

create extension if not exists "uuid-ossp";

create table if not exists nutrition_sources (
  id              uuid primary key default uuid_generate_v4(),
  slug            text not null unique,
  name_ar         text not null,
  name_en         text,
  scope           text not null check (scope in ('saudi','gulf','arab','global')),
  source_type     text not null check (source_type in ('composition','branded_foods','standards','recipes','taxonomy')),
  authority       text,
  url             text,
  license_note    text,
  priority        int not null default 100,
  notes_ar        text,
  created_at      timestamptz default now()
);

create table if not exists food_items (
  id                uuid primary key default uuid_generate_v4(),
  source_id         uuid references nutrition_sources(id) on delete set null,
  external_id       text,
  name_ar           text not null,
  name_en           text,
  canonical_name_ar text,
  category          text,
  cuisine           text,
  country_code      char(2),
  serving_unit      text default '100g',
  serving_grams     numeric(8,2) default 100,
  calories_kcal     numeric(8,2),
  protein_g         numeric(8,2),
  carbs_g           numeric(8,2),
  fat_g             numeric(8,2),
  fiber_g           numeric(8,2),
  sugar_g           numeric(8,2),
  sodium_mg         numeric(10,2),
  potassium_mg      numeric(10,2),
  calcium_mg        numeric(10,2),
  iron_mg           numeric(10,2),
  vitamin_d_mcg     numeric(10,2),
  vitamin_b12_mcg   numeric(10,2),
  folate_mcg        numeric(10,2),
  confidence        text not null default 'reference' check (confidence in ('reference','estimated','label','demo')),
  metadata          jsonb not null default '{}'::jsonb,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  unique(source_id, external_id)
);

create table if not exists branded_foods (
  id                uuid primary key default uuid_generate_v4(),
  source_id         uuid references nutrition_sources(id) on delete set null,
  barcode           text unique,
  brand             text,
  product_name_ar   text,
  product_name_en   text,
  category          text,
  country_code      char(2),
  serving_size      text,
  serving_grams     numeric(8,2),
  calories_kcal_100g numeric(8,2),
  protein_g_100g    numeric(8,2),
  carbs_g_100g      numeric(8,2),
  fat_g_100g        numeric(8,2),
  sugar_g_100g      numeric(8,2),
  sodium_mg_100g    numeric(10,2),
  allergens         text[] default array[]::text[],
  ingredients_ar    text,
  ingredients_en    text,
  label_claims      text[] default array[]::text[],
  metadata          jsonb not null default '{}'::jsonb,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create table if not exists recipe_ingredients (
  id              uuid primary key default uuid_generate_v4(),
  recipe_id       uuid references recipes(id) on delete cascade,
  food_item_id    uuid references food_items(id) on delete set null,
  name_ar         text not null,
  name_en         text,
  quantity        numeric(10,2),
  unit            text,
  grams           numeric(10,2),
  preparation_ar  text,
  sort_order      int not null default 0,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz default now()
);

create table if not exists food_standards (
  id              uuid primary key default uuid_generate_v4(),
  source_id       uuid references nutrition_sources(id) on delete set null,
  standard_code   text,
  title_ar        text not null,
  title_en        text,
  scope           text not null check (scope in ('saudi','gulf','arab','global')),
  topic           text not null,
  applies_to      text[] default array[]::text[],
  rule_summary_ar text,
  url             text,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz default now(),
  unique(source_id, standard_code)
);

alter table nutrition_sources      enable row level security;
alter table food_items             enable row level security;
alter table branded_foods          enable row level security;
alter table recipe_ingredients     enable row level security;
alter table food_standards         enable row level security;

drop policy if exists "nutrition sources public read" on nutrition_sources;
create policy "nutrition sources public read"
  on nutrition_sources for select using (true);

drop policy if exists "food items public read" on food_items;
create policy "food items public read"
  on food_items for select using (true);

drop policy if exists "branded foods public read" on branded_foods;
create policy "branded foods public read"
  on branded_foods for select using (true);

drop policy if exists "recipe ingredients public read" on recipe_ingredients;
create policy "recipe ingredients public read"
  on recipe_ingredients for select using (true);

drop policy if exists "food standards public read" on food_standards;
create policy "food standards public read"
  on food_standards for select using (true);

create index if not exists nutrition_sources_scope_priority_idx
  on nutrition_sources(scope, priority, slug);
create index if not exists food_items_name_ar_idx on food_items(name_ar);
create index if not exists food_items_category_country_idx on food_items(category, country_code);
create index if not exists food_items_source_idx on food_items(source_id);
create index if not exists food_items_metadata_gin_idx on food_items using gin(metadata);
create index if not exists branded_foods_barcode_idx on branded_foods(barcode);
create index if not exists branded_foods_brand_idx on branded_foods(brand);
create index if not exists branded_foods_source_idx on branded_foods(source_id);
create index if not exists recipe_ingredients_recipe_sort_idx on recipe_ingredients(recipe_id, sort_order);
create index if not exists recipe_ingredients_food_item_idx on recipe_ingredients(food_item_id);
create index if not exists food_standards_topic_scope_idx on food_standards(topic, scope);

insert into nutrition_sources
  (slug, name_ar, name_en, scope, source_type, authority, url, license_note, priority, notes_ar)
values
  ('sfda-saudi-food-composition', 'قاعدة/جداول تراكيب الأغذية السعودية', 'Saudi Food Composition Tables', 'saudi', 'composition', 'SFDA / FAO INFOODS', 'https://www.fao.org/food-composition/tables-and-databases/detail/saudi-arabia--2025%29-saudi-food-composition-tables/en', 'تحقق من شروط المصدر قبل الاستيراد التجاري الكامل.', 1, 'المصدر الأساسي المقترح للأغذية والأطباق السعودية.'),
  ('sfda-registered-food-products', 'إشعارات تسويق المنتجات الغذائية SFDA', 'SFDA registered food products', 'saudi', 'branded_foods', 'SFDA', 'https://www.sfda.gov.sa/en/products', 'تحقق من شروط استخدام بيانات SFDA.', 5, 'طبقة المنتجات المحلية والمستوردة المسجلة.'),
  ('saudi-branded-food-database', 'Saudi Branded Food Database', 'Saudi Branded Food Database', 'saudi', 'branded_foods', 'SFDA research reference', 'https://www.sfda.gov.sa/sites/default/files/2026-04/SFDA2124.pdf', 'مرجع بحثي؛ يحتاج مراجعة الترخيص قبل الاستخراج الآلي.', 6, 'يفيد في مقارنة ملصقات الأغذية المعبأة في السوق السعودي.'),
  ('gso-standards', 'مواصفات GSO الخليجية', 'GSO Standards', 'gulf', 'standards', 'GSO', 'https://www.gso.org.sa/en/standards/', 'قد تكون بعض المواصفات مدفوعة أو مقيدة.', 10, 'مرجع للملصقات، الإضافات، السلامة والجودة خليجيًا.'),
  ('fao-infoods-middle-east', 'FAO/INFOODS الشرق الأوسط', 'FAO/INFOODS Middle East', 'gulf', 'composition', 'FAO/INFOODS', 'https://www.fao.org/infoods/infoods/tables-and-databases/middle-east/en/', 'اتبع شروط كل جدول مرتبط.', 20, 'فهرس يغطي السعودية والبحرين والكويت ومصادر خليجية أخرى.'),
  ('usda-fooddata-central', 'USDA FoodData Central', 'USDA FoodData Central', 'global', 'composition', 'USDA', 'https://fdc.nal.usda.gov/', 'بيانات USDA FoodData Central متاحة عادة كبيانات عامة CC0.', 50, 'طبقة عالمية لسد فجوات الأغذية غير المحلية.'),
  ('open-food-facts', 'Open Food Facts', 'Open Food Facts', 'global', 'branded_foods', 'Open Food Facts', 'https://github.com/openfoodfacts/openfoodfacts-server', 'راجع رخصة Open Database License واشتراطات النسبة.', 55, 'مفيد للباركود والمكونات والحساسية عالميًا.'),
  ('codex-alimentarius', 'Codex Alimentarius', 'Codex Alimentarius', 'global', 'standards', 'FAO/WHO', 'https://www.fao.org/fao-who-codexalimentarius', 'مرجع مواصفات دولي.', 60, 'مرجع للسلامة والإضافات والإرشادات الغذائية.'),
  ('recipe-nlg', 'RecipeNLG', 'RecipeNLG', 'global', 'recipes', 'Hugging Face dataset', 'https://huggingface.co/datasets/mbien/recipe_nlg', 'راجع ترخيص dataset قبل الاستخدام الإنتاجي.', 80, 'مفيد لتحليل بنية الوصفات بعد التنظيف والترجمة.')
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

with sfda as (
  select id from nutrition_sources where slug = 'sfda-saudi-food-composition'
)
insert into food_items
  (source_id, external_id, name_ar, name_en, canonical_name_ar, category, cuisine, country_code, calories_kcal, protein_g, carbs_g, fat_g, fiber_g, sodium_mg, confidence, metadata)
select
  sfda.id,
  item.external_id,
  item.name_ar,
  item.name_en,
  item.canonical_name_ar,
  item.category,
  item.cuisine,
  'SA',
  item.calories_kcal,
  item.protein_g,
  item.carbs_g,
  item.fat_g,
  item.fiber_g,
  item.sodium_mg,
  'demo',
  jsonb_build_object('seed_note_ar', 'قيمة افتتاحية للتصنيف والربط. استبدلها بقيمة المصدر الرسمي عند الاستيراد الكامل.')
from sfda
cross join (
  values
    ('zaad-sa-kabsa-chicken', 'كبسة دجاج', 'Chicken kabsa', 'كبسة دجاج', 'composite_dish', 'saudi', 165, 12.0, 19.0, 4.2, 1.1, 250),
    ('zaad-sa-jareesh', 'جريش', 'Jareesh', 'جريش', 'grain_dish', 'saudi', 118, 4.2, 20.5, 2.1, 2.7, 160),
    ('zaad-sa-foul', 'فول مدمس', 'Fava bean stew', 'فول مدمس', 'legumes', 'saudi', 110, 7.5, 17.5, 1.0, 5.4, 180),
    ('zaad-sa-dates', 'تمر', 'Dates', 'تمر', 'fruit', 'saudi', 277, 1.8, 75.0, 0.2, 6.7, 1),
    ('zaad-sa-tamees', 'تميس', 'Tamees bread', 'تميس', 'bread', 'saudi', 285, 8.5, 55.0, 3.5, 2.4, 410),
    ('zaad-sa-laban-low-fat', 'لبن قليل الدسم', 'Low-fat laban', 'لبن قليل الدسم', 'dairy', 'saudi', 45, 3.4, 4.8, 1.5, 0.0, 45),
    ('zaad-sa-grilled-fish', 'سمك مشوي', 'Grilled fish', 'سمك مشوي', 'protein', 'saudi', 145, 24.0, 0.0, 5.0, 0.0, 95),
    ('zaad-sa-lentil-soup', 'شوربة عدس', 'Lentil soup', 'شوربة عدس', 'soup', 'saudi', 95, 5.8, 14.0, 2.0, 4.0, 140)
) as item(external_id, name_ar, name_en, canonical_name_ar, category, cuisine, calories_kcal, protein_g, carbs_g, fat_g, fiber_g, sodium_mg)
on conflict (source_id, external_id) do update set
  name_ar = excluded.name_ar,
  name_en = excluded.name_en,
  canonical_name_ar = excluded.canonical_name_ar,
  category = excluded.category,
  cuisine = excluded.cuisine,
  calories_kcal = excluded.calories_kcal,
  protein_g = excluded.protein_g,
  carbs_g = excluded.carbs_g,
  fat_g = excluded.fat_g,
  fiber_g = excluded.fiber_g,
  sodium_mg = excluded.sodium_mg,
  metadata = excluded.metadata,
  updated_at = now();

with gso as (
  select id from nutrition_sources where slug = 'gso-standards'
), codex as (
  select id from nutrition_sources where slug = 'codex-alimentarius'
)
insert into food_standards
  (source_id, standard_code, title_ar, title_en, scope, topic, applies_to, rule_summary_ar, url)
select gso.id, 'gso-labeling-placeholder', 'متطلبات الملصقات الغذائية الخليجية', 'Gulf food labeling requirements', 'gulf', 'labeling', array['branded_foods'], 'مرجع لحقول الملصق، الادعاءات، المكونات، والحساسية قبل تفعيل فحص المنتجات.', 'https://www.gso.org.sa/en/standards/'
from gso
union all
select codex.id, 'codex-additives-placeholder', 'قواعد الدستور الغذائي للإضافات الغذائية', 'Codex food additives guidance', 'global', 'additives', array['branded_foods','recipes'], 'مرجع عالمي للإضافات والحدود الإرشادية عند بناء تنبيهات السلامة الغذائية.', 'https://www.fao.org/fao-who-codexalimentarius/codex-texts/dbs/en/'
from codex
on conflict (source_id, standard_code) do update set
  title_ar = excluded.title_ar,
  title_en = excluded.title_en,
  scope = excluded.scope,
  topic = excluded.topic,
  applies_to = excluded.applies_to,
  rule_summary_ar = excluded.rule_summary_ar,
  url = excluded.url;

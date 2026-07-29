# Nutrition Reference Data

This note turns the source map from the conversation into Zaad's data plan.

## Goal

Zaad should calculate meal macros and safety notes from structured food data,
not only from hard-coded demo recipes. The first production layer should be
Saudi-first, then Gulf/Arab, then global fallback data.

## Source Priority

1. SFDA Saudi Food Composition Tables
   Primary source for Saudi foods and national dishes.

2. SFDA registered food products and Saudi Branded Food Database
   Product and label layer for barcode scanning, packaged food comparisons,
   allergens, serving sizes, and nutrition per 100g.

3. GSO and AIDSMO standards
   Rules layer for labels, food claims, additives, allergens, quality, and
   Gulf/Arab regulatory notes.

4. FAO/INFOODS Middle East
   Regional gap filling for Bahrain, Kuwait, Oman, and other Middle East food
   composition tables.

5. USDA FoodData Central and Open Food Facts
   Global fallback layer. USDA is useful for generic ingredients; Open Food
   Facts is useful for barcode coverage.

6. Recipe datasets
   RecipeNLG, Recipe1M+, and Food.com are content sources only after license
   review, cleaning, localization, and nutrition validation.

## Tables

The migration at `src/lib/supabase/nutrition-reference-migration.sql` adds:

- `nutrition_sources`
- `food_items`
- `branded_foods`
- `recipe_ingredients`
- `food_standards`

These tables are public read-only through RLS policies. Writes should be done
through Supabase SQL/admin tools or a private backend job, not directly from the
client app.

## Import Strategy

Use a staged import instead of adding every public source at once:

1. Apply the migration.
2. Replace the demo `food_items` values with verified SFDA rows.
3. Map existing `recipes.ingredients_ar` into `recipe_ingredients`.
4. Update local meal-plan generation to prefer recipes with structured
   ingredients and computed nutrition totals.
5. Add branded product import for barcode scanning.
6. Add standards-driven warnings after product and ingredient data is stable.

## Data Quality Rules

- Keep each row tied to `source_id`.
- Use `confidence = 'reference'` only for official imported values.
- Use `confidence = 'estimated'` for calculated recipe totals.
- Use `confidence = 'label'` for packaged-product label values.
- Use `confidence = 'demo'` only for temporary seed data.
- Preserve URLs and license notes before bulk imports.
- Never mix values from different serving units without normalizing to 100g or
  a declared serving size.

## Next Integration Point

The current static GitHub Pages build already generates diet plans locally when
no backend exists. `src/lib/meals/localPlan.ts` now tries to build meals from
Supabase `food_items` first through `src/lib/nutrition/referenceFoods.ts`, then
falls back to the bundled demo recipes when the migration has not been applied
or the reference rows are incomplete.

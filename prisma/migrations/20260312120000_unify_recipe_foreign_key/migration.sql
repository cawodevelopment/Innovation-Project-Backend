-- CreateEnum
CREATE TYPE "RecipeStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- Drop title uniqueness so drafts and published recipes can share names
DROP INDEX IF EXISTS "Recipe_title_key";

-- Add recipe status to support draft/published in one table
ALTER TABLE "Recipe"
ADD COLUMN "status" "RecipeStatus" NOT NULL DEFAULT 'DRAFT';

-- Move existing drafts into the Recipe table, preserving ids for relation updates
INSERT INTO "Recipe" (
    "id",
    "userId",
    "title",
    "status",
    "instructions",
    "ingredients",
    "allergenNotices",
    "prepTimeInMinutes",
    "cookingTimeInMinutes",
    "servings",
    "category",
    "dietaryRestrictions",
    "difficulty",
    "ratingOutOf5"
)
SELECT
    rd."id",
    rd."userId",
    rd."title",
    'DRAFT'::"RecipeStatus",
    rd."instructions",
    rd."ingredients",
    rd."allergenNotices",
    rd."prepTimeInMinutes",
    rd."cookingTimeInMinutes",
    rd."servings",
    rd."category",
    rd."dietaryRestrictions",
    rd."difficulty",
    rd."ratingOutOf5"
FROM "RecipeDraft" rd
ON CONFLICT ("id") DO NOTHING;

-- Repoint nutrition rows that currently reference drafts
UPDATE "NutritionInfo"
SET "recipeId" = "recipeDraftId"
WHERE "recipeId" IS NULL
  AND "recipeDraftId" IS NOT NULL;

-- Remove nutrition rows that still have no parent recipe after migration
DELETE FROM "NutritionInfo"
WHERE "recipeId" IS NULL;

-- Remove old draft relation from NutritionInfo
ALTER TABLE "NutritionInfo"
DROP CONSTRAINT IF EXISTS "NutritionInfo_recipeDraftId_fkey";

DROP INDEX IF EXISTS "NutritionInfo_recipeDraftId_key";

ALTER TABLE "NutritionInfo"
DROP COLUMN IF EXISTS "recipeDraftId";

-- Enforce single mandatory foreign key to Recipe
ALTER TABLE "NutritionInfo"
ALTER COLUMN "recipeId" SET NOT NULL;

-- Drop now-obsolete RecipeDraft table
DROP TABLE IF EXISTS "RecipeDraft";

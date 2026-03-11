-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT[],
    "ingredients" TEXT[],
    "allergenNotices" TEXT[],
    "prepTimeInMinutes" INTEGER NOT NULL,
    "cookingTimeInMinutes" INTEGER NOT NULL,
    "servings" INTEGER NOT NULL,
    "category" INTEGER NOT NULL,
    "dietaryRestrictions" TEXT[],
    "difficulty" TEXT NOT NULL,
    "ratingOutOf5" INTEGER NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeDraft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT[],
    "ingredients" TEXT[],
    "allergenNotices" TEXT[],
    "prepTimeInMinutes" INTEGER NOT NULL,
    "cookingTimeInMinutes" INTEGER NOT NULL,
    "servings" INTEGER NOT NULL,
    "category" INTEGER NOT NULL,
    "dietaryRestrictions" TEXT[],
    "difficulty" TEXT NOT NULL,
    "ratingOutOf5" INTEGER NOT NULL,

    CONSTRAINT "RecipeDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DietaryPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "DietaryPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Allergen" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,

    CONSTRAINT "Allergen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionInfo" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT,
    "recipeDraftId" TEXT,
    "caloriesKcal" INTEGER NOT NULL,
    "proteinG" INTEGER NOT NULL,
    "carbsG" INTEGER NOT NULL,
    "fatG" INTEGER NOT NULL,

    CONSTRAINT "NutritionInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_title_key" ON "Recipe"("title");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeDraft_title_key" ON "RecipeDraft"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Allergen_name_key" ON "Allergen"("name");

-- CreateIndex
CREATE UNIQUE INDEX "NutritionInfo_recipeId_key" ON "NutritionInfo"("recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "NutritionInfo_recipeDraftId_key" ON "NutritionInfo"("recipeDraftId");

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeDraft" ADD CONSTRAINT "RecipeDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DietaryPreference" ADD CONSTRAINT "DietaryPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allergen" ADD CONSTRAINT "Allergen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionInfo" ADD CONSTRAINT "NutritionInfo_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionInfo" ADD CONSTRAINT "NutritionInfo_recipeDraftId_fkey" FOREIGN KEY ("recipeDraftId") REFERENCES "RecipeDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

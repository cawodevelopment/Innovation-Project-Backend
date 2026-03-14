/*
  Warnings:

  - You are about to drop the column `userId` on the `Allergen` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `DietaryPreference` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Allergen" DROP CONSTRAINT "Allergen_userId_fkey";

-- DropForeignKey
ALTER TABLE "DietaryPreference" DROP CONSTRAINT "DietaryPreference_userId_fkey";

-- AlterTable
ALTER TABLE "Allergen" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "DietaryPreference" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "UserDietaryPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dietaryPreferenceId" TEXT NOT NULL,

    CONSTRAINT "UserDietaryPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userAllergen" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "allergenId" TEXT NOT NULL,

    CONSTRAINT "userAllergen_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserDietaryPreference" ADD CONSTRAINT "UserDietaryPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDietaryPreference" ADD CONSTRAINT "UserDietaryPreference_dietaryPreferenceId_fkey" FOREIGN KEY ("dietaryPreferenceId") REFERENCES "DietaryPreference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userAllergen" ADD CONSTRAINT "userAllergen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userAllergen" ADD CONSTRAINT "userAllergen_allergenId_fkey" FOREIGN KEY ("allergenId") REFERENCES "Allergen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

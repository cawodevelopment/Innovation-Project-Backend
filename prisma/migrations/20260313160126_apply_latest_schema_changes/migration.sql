/*
  Warnings:

  - You are about to drop the column `category` on the `Allergen` table. All the data in the column will be lost.
  - You are about to drop the column `severity` on the `Allergen` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Allergen" DROP COLUMN "category",
DROP COLUMN "severity";

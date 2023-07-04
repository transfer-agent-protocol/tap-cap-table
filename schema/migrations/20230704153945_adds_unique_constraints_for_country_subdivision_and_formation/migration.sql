/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `stakeholderId` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `zip` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Issuer` table. All the data in the column will be lost.
  - You are about to alter the column `country_of_formation` on the `Issuer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.
  - A unique constraint covering the columns `[country_subdivision]` on the table `Address` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[country_of_formation]` on the table `Issuer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address_type` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country_subdivision` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postal_code` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street_suite` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Made the column `city` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `formation_date` to the `Issuer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_stakeholderId_fkey";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "createdAt",
DROP COLUMN "stakeholderId",
DROP COLUMN "state",
DROP COLUMN "street",
DROP COLUMN "type",
DROP COLUMN "updatedAt",
DROP COLUMN "zip",
ADD COLUMN     "address_type" TEXT NOT NULL,
ADD COLUMN     "country" "CountryCode" NOT NULL,
ADD COLUMN     "country_subdivision" VARCHAR(3) NOT NULL,
ADD COLUMN     "postal_code" TEXT NOT NULL,
ADD COLUMN     "street_suite" TEXT NOT NULL,
ALTER COLUMN "city" SET NOT NULL;

-- AlterTable
ALTER TABLE "Issuer" DROP COLUMN "address",
DROP COLUMN "formation_date",
ADD COLUMN     "formation_date" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "country_of_formation" SET DATA TYPE CHAR(2);

-- CreateTable
CREATE TABLE "_AddressToStakeholder" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AddressToStakeholder_AB_unique" ON "_AddressToStakeholder"("A", "B");

-- CreateIndex
CREATE INDEX "_AddressToStakeholder_B_index" ON "_AddressToStakeholder"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Address_country_subdivision_key" ON "Address"("country_subdivision");

-- CreateIndex
CREATE UNIQUE INDEX "Issuer_country_of_formation_key" ON "Issuer"("country_of_formation");

-- AddForeignKey
ALTER TABLE "_AddressToStakeholder" ADD CONSTRAINT "_AddressToStakeholder_A_fkey" FOREIGN KEY ("A") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AddressToStakeholder" ADD CONSTRAINT "_AddressToStakeholder_B_fkey" FOREIGN KEY ("B") REFERENCES "Stakeholder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

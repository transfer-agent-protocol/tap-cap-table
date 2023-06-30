/*
  Warnings:

  - You are about to drop the column `address_type` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `country_subdivision` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `postal_code` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `street_suite` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Issuer` table. All the data in the column will be lost.
  - You are about to drop the column `modifiedAt` on the `Issuer` table. All the data in the column will be lost.
  - You are about to alter the column `initial_shares_authorized` on the `Issuer` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Added the required column `type` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('LEGAL', 'CONTACT', 'OTHER');

-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('PERSONAL', 'BUSINESS', 'OTHER');

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "address_type",
DROP COLUMN "country",
DROP COLUMN "country_subdivision",
DROP COLUMN "postal_code",
DROP COLUMN "street_suite",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "type" "AddressType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "zip" TEXT;

-- AlterTable
ALTER TABLE "Issuer" DROP COLUMN "createdAt",
DROP COLUMN "modifiedAt",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "object_type" TEXT NOT NULL DEFAULT 'ISSUER',
ALTER COLUMN "initial_shares_authorized" SET DATA TYPE INTEGER,
ALTER COLUMN "comments" DROP NOT NULL,
ALTER COLUMN "comments" SET DATA TYPE TEXT;

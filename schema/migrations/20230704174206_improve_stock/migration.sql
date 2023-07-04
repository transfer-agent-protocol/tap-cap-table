/*
  Warnings:

  - You are about to alter the column `country_subdivision_of_formation` on the `Issuer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(3)`.
  - You are about to alter the column `initial_shares_authorized` on the `StockClass` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,10)`.
  - Changed the type of `address_type` on the `Address` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `country` on the `Address` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `country_subdivision_of_formation` on table `Issuer` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `country` on the `TaxID` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Address" DROP COLUMN "address_type",
ADD COLUMN     "address_type" "AddressType" NOT NULL,
DROP COLUMN "country",
ADD COLUMN     "country" VARCHAR(2) NOT NULL;

-- AlterTable
ALTER TABLE "Issuer" ALTER COLUMN "country_of_formation" SET DATA TYPE VARCHAR(2),
ALTER COLUMN "country_subdivision_of_formation" SET NOT NULL,
ALTER COLUMN "country_subdivision_of_formation" SET DATA TYPE VARCHAR(3);

-- AlterTable
ALTER TABLE "StockClass" ADD COLUMN     "issuerId" TEXT,
ALTER COLUMN "initial_shares_authorized" SET DATA TYPE DECIMAL(20,10),
ALTER COLUMN "board_approval_date" SET DATA TYPE TEXT,
ALTER COLUMN "stockholder_approval_date" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "TaxID" DROP COLUMN "country",
ADD COLUMN     "country" VARCHAR(2) NOT NULL;

-- DropEnum
DROP TYPE "CountryCode";

-- AddForeignKey
ALTER TABLE "StockClass" ADD CONSTRAINT "StockClass_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "Issuer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

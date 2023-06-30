/*
  Warnings:

  - Added the required column `stockClassId` to the `Stakeholder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stakeholder" ADD COLUMN     "stockClassId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Stakeholder" ADD CONSTRAINT "Stakeholder_stockClassId_fkey" FOREIGN KEY ("stockClassId") REFERENCES "StockClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

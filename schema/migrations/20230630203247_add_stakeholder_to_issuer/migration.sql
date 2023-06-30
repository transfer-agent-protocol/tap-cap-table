/*
  Warnings:

  - Added the required column `issuerId` to the `Stakeholder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stakeholder" ADD COLUMN     "issuerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Stakeholder" ADD CONSTRAINT "Stakeholder_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "Issuer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

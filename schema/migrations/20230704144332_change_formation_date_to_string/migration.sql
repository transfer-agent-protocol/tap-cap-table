-- AlterTable
ALTER TABLE "Issuer" ALTER COLUMN "formation_date" DROP NOT NULL,
ALTER COLUMN "formation_date" SET DATA TYPE TEXT;

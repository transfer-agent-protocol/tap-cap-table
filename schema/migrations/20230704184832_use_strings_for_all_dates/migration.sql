-- AlterTable
ALTER TABLE "StockPlan" ALTER COLUMN "board_approval_date" SET DATA TYPE TEXT,
ALTER COLUMN "stockholder_approval_date" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Valuation" ALTER COLUMN "board_approval_date" SET DATA TYPE TEXT,
ALTER COLUMN "stockholder_approval_date" SET DATA TYPE TEXT,
ALTER COLUMN "effective_date" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "VestingEvent" ALTER COLUMN "date" SET DATA TYPE TEXT;

-- CreateEnum
CREATE TYPE "StockPlanCancellationBehaviorType" AS ENUM ('RETURN_TO_POOL', 'CANCEL');

-- CreateEnum
CREATE TYPE "ValuationType" AS ENUM ('PREMONEY', 'POSTMONEY');

-- CreateTable
CREATE TABLE "StockPlan" (
    "id" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "board_approval_date" TIMESTAMP(3),
    "stockholder_approval_date" TIMESTAMP(3),
    "initial_shares_reserved" DOUBLE PRECISION NOT NULL,
    "default_cancellation_behavior" "StockPlanCancellationBehaviorType",
    "stock_class_id" TEXT NOT NULL,
    "comments" TEXT,

    CONSTRAINT "StockPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Valuation" (
    "id" TEXT NOT NULL,
    "provider" TEXT,
    "board_approval_date" TIMESTAMP(3),
    "stockholder_approval_date" TIMESTAMP(3),
    "price_per_share" DECIMAL(65,30) NOT NULL,
    "effective_date" TIMESTAMP(3) NOT NULL,
    "stock_class_id" TEXT NOT NULL,
    "valuation_type" "ValuationType" NOT NULL,
    "comments" TEXT,

    CONSTRAINT "Valuation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StockPlan" ADD CONSTRAINT "StockPlan_stock_class_id_fkey" FOREIGN KEY ("stock_class_id") REFERENCES "StockClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

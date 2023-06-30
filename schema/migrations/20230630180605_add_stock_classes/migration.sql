-- CreateEnum
CREATE TYPE "StockClassType" AS ENUM ('PREFERRED', 'COMMON');

-- CreateTable
CREATE TABLE "StockClass" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "class_type" "StockClassType" NOT NULL,
    "default_id_prefix" TEXT NOT NULL,
    "initial_shares_authorized" DOUBLE PRECISION NOT NULL,
    "board_approval_date" TIMESTAMP(3),
    "stockholder_approval_date" TIMESTAMP(3),
    "votes_per_share" DOUBLE PRECISION NOT NULL,
    "par_value" DOUBLE PRECISION,
    "price_per_share" DOUBLE PRECISION,
    "seniority" DOUBLE PRECISION NOT NULL,
    "liquidation_preference_multiple" DOUBLE PRECISION,
    "participation_cap_multiple" DOUBLE PRECISION,

    CONSTRAINT "StockClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockClassConversionRight" (
    "id" TEXT NOT NULL,
    "from_class_id" TEXT NOT NULL,
    "to_class_id" TEXT NOT NULL,
    "conversion_ratio" DOUBLE PRECISION NOT NULL,
    "conversion_trigger" DOUBLE PRECISION,
    "conversion_price" DOUBLE PRECISION,

    CONSTRAINT "StockClassConversionRight_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StockClassConversionRight" ADD CONSTRAINT "StockClassConversionRight_from_class_id_fkey" FOREIGN KEY ("from_class_id") REFERENCES "StockClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockClassConversionRight" ADD CONSTRAINT "StockClassConversionRight_to_class_id_fkey" FOREIGN KEY ("to_class_id") REFERENCES "StockClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

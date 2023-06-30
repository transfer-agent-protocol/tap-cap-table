-- CreateEnum
CREATE TYPE "AllocationTypeEnum" AS ENUM ('ROUND_DOWN', 'ROUND_UP');

-- CreateTable
CREATE TABLE "VestingTerms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "allocation_type_id" TEXT NOT NULL,
    "comments" TEXT,

    CONSTRAINT "VestingTerms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllocationType" (
    "id" TEXT NOT NULL,
    "allocation_type" "AllocationTypeEnum" NOT NULL,

    CONSTRAINT "AllocationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VestingCondition" (
    "id" TEXT NOT NULL,
    "vesting_schedule_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "vestingTermsId" TEXT,

    CONSTRAINT "VestingCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VestingSchedule" (
    "id" TEXT NOT NULL,
    "vesting_schedule" TEXT NOT NULL,

    CONSTRAINT "VestingSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VestingEvent" (
    "id" TEXT NOT NULL,
    "event_type_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VestingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VestingEventType" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,

    CONSTRAINT "VestingEventType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VestingTerms" ADD CONSTRAINT "VestingTerms_allocation_type_id_fkey" FOREIGN KEY ("allocation_type_id") REFERENCES "AllocationType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VestingCondition" ADD CONSTRAINT "VestingCondition_vesting_schedule_id_fkey" FOREIGN KEY ("vesting_schedule_id") REFERENCES "VestingSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VestingCondition" ADD CONSTRAINT "VestingCondition_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "VestingEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VestingCondition" ADD CONSTRAINT "VestingCondition_vestingTermsId_fkey" FOREIGN KEY ("vestingTermsId") REFERENCES "VestingTerms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VestingEvent" ADD CONSTRAINT "VestingEvent_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "VestingEventType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

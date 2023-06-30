-- CreateEnum
CREATE TYPE "PhoneType" AS ENUM ('MOBILE', 'HOME', 'BUSINESS');

-- CreateEnum
CREATE TYPE "StakeholderType" AS ENUM ('INDIVIDUAL', 'INSTITUTION');

-- CreateEnum
CREATE TYPE "StakeholderRelationshipType" AS ENUM ('ADVISOR', 'BOARD_MEMBER', 'CONSULTANT', 'EMPLOYEE', 'EX_ADVISOR', 'EX_CONSULTANT', 'EX_EMPLOYEE', 'EXECUTIVE', 'FOUNDER', 'INVESTOR', 'NON_US_EMPLOYEE', 'OFFICER', 'OTHER');

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "stakeholderId" TEXT;

-- AlterTable
ALTER TABLE "TaxID" ADD COLUMN     "stakeholderId" TEXT;

-- CreateTable
CREATE TABLE "Stakeholder" (
    "id" TEXT NOT NULL,
    "stakeholder_type" "StakeholderType" NOT NULL,
    "issuer_assigned_id" TEXT,
    "current_relationship" "StakeholderRelationshipType",
    "comments" TEXT,
    "nameId" TEXT NOT NULL,
    "contactInfoId" TEXT,
    "contactInfoWithoutNameId" TEXT,

    CONSTRAINT "Stakeholder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Name" (
    "id" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,

    CONSTRAINT "Name_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Email" (
    "id" TEXT NOT NULL,
    "email_type" "EmailType" NOT NULL,
    "email_address" TEXT NOT NULL,
    "contactInfoId" TEXT,
    "contactInfoWithoutNameId" TEXT,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phone" (
    "id" TEXT NOT NULL,
    "phone_type" "PhoneType" NOT NULL,
    "phone_number" TEXT NOT NULL,
    "contactInfoId" TEXT,
    "contactInfoWithoutNameId" TEXT,

    CONSTRAINT "Phone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactInfo" (
    "id" TEXT NOT NULL,
    "nameId" TEXT NOT NULL,

    CONSTRAINT "ContactInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactInfoWithoutName" (
    "id" TEXT NOT NULL,

    CONSTRAINT "ContactInfoWithoutName_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "Stakeholder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxID" ADD CONSTRAINT "TaxID_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "Stakeholder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stakeholder" ADD CONSTRAINT "Stakeholder_nameId_fkey" FOREIGN KEY ("nameId") REFERENCES "Name"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stakeholder" ADD CONSTRAINT "Stakeholder_contactInfoId_fkey" FOREIGN KEY ("contactInfoId") REFERENCES "ContactInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stakeholder" ADD CONSTRAINT "Stakeholder_contactInfoWithoutNameId_fkey" FOREIGN KEY ("contactInfoWithoutNameId") REFERENCES "ContactInfoWithoutName"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_contactInfoId_fkey" FOREIGN KEY ("contactInfoId") REFERENCES "ContactInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_contactInfoWithoutNameId_fkey" FOREIGN KEY ("contactInfoWithoutNameId") REFERENCES "ContactInfoWithoutName"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phone" ADD CONSTRAINT "Phone_contactInfoId_fkey" FOREIGN KEY ("contactInfoId") REFERENCES "ContactInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phone" ADD CONSTRAINT "Phone_contactInfoWithoutNameId_fkey" FOREIGN KEY ("contactInfoWithoutNameId") REFERENCES "ContactInfoWithoutName"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactInfo" ADD CONSTRAINT "ContactInfo_nameId_fkey" FOREIGN KEY ("nameId") REFERENCES "Name"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

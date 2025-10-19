/*
  Warnings:

  - A unique constraint covering the columns `[walletAddress]` on the table `patients` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "privateKey" VARCHAR(255),
ADD COLUMN     "walletAddress" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "patients_walletAddress_key" ON "patients"("walletAddress");

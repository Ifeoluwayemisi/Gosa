/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reference` to the `payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payment` ADD COLUMN `reference` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `payment_reference_key` ON `payment`(`reference`);

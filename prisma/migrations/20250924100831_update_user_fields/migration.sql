/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `avatar` VARCHAR(191) NULL,
    ADD COLUMN `googleId` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `profileComplete` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `provider` VARCHAR(191) NOT NULL DEFAULT 'local',
    MODIFY `password` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_googleId_key` ON `User`(`googleId`);

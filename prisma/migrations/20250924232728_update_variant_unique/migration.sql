/*
  Warnings:

  - A unique constraint covering the columns `[productId,sku]` on the table `Variant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subtotal` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variantId` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Variant_sku_key` ON `variant`;

-- AlterTable
ALTER TABLE `cartitem` ADD COLUMN `discount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `shipping` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `subtotal` DOUBLE NOT NULL,
    ADD COLUMN `tax` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `variantId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Variant_productId_sku_key` ON `Variant`(`productId`, `sku`);

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `Variant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

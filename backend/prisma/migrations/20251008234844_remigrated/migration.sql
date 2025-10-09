-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_orderId_fkey`;

-- DropIndex
DROP INDEX `Product_orderId_fkey` ON `product`;

/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `TransactionIn` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transactionId` to the `TransactionIn` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `TransactionIn` ADD COLUMN `transactionId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `TransactionOut` (
    `id` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `warehouseId` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `purpose` VARCHAR(191) NOT NULL,
    `invoice` VARCHAR(191) NOT NULL,
    `exitDate` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TransactionOut_transactionId_key`(`transactionId`),
    INDEX `TransactionOut_productId_idx`(`productId`),
    INDEX `TransactionOut_warehouseId_idx`(`warehouseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `TransactionIn_transactionId_key` ON `TransactionIn`(`transactionId`);

-- AddForeignKey
ALTER TABLE `TransactionOut` ADD CONSTRAINT `TransactionOut_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionOut` ADD CONSTRAINT `TransactionOut_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `wareHouseId` on the `TransactionIn` table. All the data in the column will be lost.
  - You are about to drop the `WareHouse` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `warehouseId` to the `TransactionIn` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `TransactionIn` DROP FOREIGN KEY `TransactionIn_wareHouseId_fkey`;

-- DropIndex
DROP INDEX `TransactionIn_wareHouseId_idx` ON `TransactionIn`;

-- AlterTable
ALTER TABLE `TransactionIn` DROP COLUMN `wareHouseId`,
    ADD COLUMN `warehouseId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `WareHouse`;

-- CreateTable
CREATE TABLE `Warehouse` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `TransactionIn_warehouseId_idx` ON `TransactionIn`(`warehouseId`);

-- AddForeignKey
ALTER TABLE `TransactionIn` ADD CONSTRAINT `TransactionIn_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

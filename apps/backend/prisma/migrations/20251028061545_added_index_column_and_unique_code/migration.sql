/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Agent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `AssetArea` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Agent_code_key` ON `Agent`(`code`);

-- CreateIndex
CREATE UNIQUE INDEX `AssetArea_code_key` ON `AssetArea`(`code`);

-- CreateIndex
CREATE UNIQUE INDEX `Product_code_key` ON `Product`(`code`);

-- CreateIndex
CREATE UNIQUE INDEX `Supplier_code_key` ON `Supplier`(`code`);

-- RenameIndex
ALTER TABLE `Product` RENAME INDEX `Product_categoryId_fkey` TO `Product_categoryId_idx`;

-- RenameIndex
ALTER TABLE `Product` RENAME INDEX `Product_unitId_fkey` TO `Product_unitId_idx`;

-- RenameIndex
ALTER TABLE `PurchaseList` RENAME INDEX `PurchaseList_productId_fkey` TO `PurchaseList_productId_idx`;

-- RenameIndex
ALTER TABLE `PurchaseList` RENAME INDEX `PurchaseList_purchaseOrderId_fkey` TO `PurchaseList_purchaseOrderId_idx`;

-- RenameIndex
ALTER TABLE `PurchaseOrder` RENAME INDEX `PurchaseOrder_supplierId_fkey` TO `PurchaseOrder_supplierId_idx`;

-- RenameIndex
ALTER TABLE `TransactionIn` RENAME INDEX `TransactionIn_productId_fkey` TO `TransactionIn_productId_idx`;

-- RenameIndex
ALTER TABLE `TransactionIn` RENAME INDEX `TransactionIn_supplierId_fkey` TO `TransactionIn_supplierId_idx`;

-- RenameIndex
ALTER TABLE `TransactionIn` RENAME INDEX `TransactionIn_wareHouseId_fkey` TO `TransactionIn_wareHouseId_idx`;

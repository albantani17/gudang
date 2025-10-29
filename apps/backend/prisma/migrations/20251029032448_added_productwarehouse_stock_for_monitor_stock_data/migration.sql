-- CreateTable
CREATE TABLE `ProductWarehouseStock` (
    `productId` VARCHAR(191) NOT NULL,
    `wareHouseId` VARCHAR(191) NOT NULL,
    `qtyOnHand` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`productId`, `wareHouseId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

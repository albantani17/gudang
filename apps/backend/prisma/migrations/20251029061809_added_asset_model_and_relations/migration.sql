-- CreateTable
CREATE TABLE `Asset` (
    `id` VARCHAR(191) NOT NULL,
    `macAddress` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `assetAreaId` VARCHAR(191) NOT NULL,
    `serviceType` ENUM('HOTSPOT', 'PPPOE') NOT NULL,
    `ownerAsset` ENUM('PERUSAHAAN', 'AGEN') NOT NULL,
    `orderDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `technician` VARCHAR(191) NOT NULL,
    `latitude` FLOAT NOT NULL,
    `longitude` FLOAT NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Asset` ADD CONSTRAINT `Asset_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asset` ADD CONSTRAINT `Asset_assetAreaId_fkey` FOREIGN KEY (`assetAreaId`) REFERENCES `AssetArea`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `permisssion` on the `role` table. All the data in the column will be lost.
  - Added the required column `permission` to the `Role` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `role` DROP COLUMN `permisssion`,
    ADD COLUMN `permission` JSON NOT NULL;

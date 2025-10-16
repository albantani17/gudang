/*
  Warnings:

  - Added the required column `permisssion` to the `Role` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `role` ADD COLUMN `permisssion` JSON NOT NULL;

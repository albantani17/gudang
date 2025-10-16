-- EMAIL
ALTER TABLE `User` DROP INDEX `User_email_key`;
CREATE UNIQUE INDEX `User_email_key` ON `User`(`email`);

-- USERNAME
ALTER TABLE `User` DROP INDEX `User_username_key`;
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);

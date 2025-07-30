-- CreateTable
CREATE TABLE `UserEntryInteraction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `entryId` INTEGER NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserEntryInteraction_userId_idx`(`userId`),
    INDEX `UserEntryInteraction_entryId_idx`(`entryId`),
    UNIQUE INDEX `UserEntryInteraction_userId_entryId_key`(`userId`, `entryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserEntryInteraction` ADD CONSTRAINT `UserEntryInteraction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserEntryInteraction` ADD CONSTRAINT `UserEntryInteraction_entryId_fkey` FOREIGN KEY (`entryId`) REFERENCES `Entry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

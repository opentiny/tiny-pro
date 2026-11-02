-- Upgrade databases that were created before Flyway was introduced.
--
-- Existing databases are baselined at version 1, so V1 is skipped for them.
-- This migration covers the known legacy differences that cannot be fixed by
-- the baseline itself:
--   1. normalize the legacy upper-case I18 table name on case-sensitive
--      MySQL installations;
--   2. create the application table when it is missing;
--   3. migrate legacy camelCase timestamp columns to the final snake_case
--      columns used by the Application entity.

SET @i18_lower_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'i18'
);

SET @i18_upper_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'I18'
);

SET @rename_i18 = IF(
    @i18_lower_exists = 0 AND @i18_upper_exists = 1,
    'RENAME TABLE `I18` TO `i18`',
    'SELECT 1'
);

PREPARE rename_i18_statement FROM @rename_i18;
EXECUTE rename_i18_statement;
DEALLOCATE PREPARE rename_i18_statement;

CREATE TABLE IF NOT EXISTS `application` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NULL,
    `tag` TEXT NULL,
    `icon` VARCHAR(255) NULL,
    `classify` VARCHAR(255) NULL,
    `created_at` DATETIME(6) NULL,
    `updated_at` DATETIME(6) NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_application_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @created_at_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'application'
      AND COLUMN_NAME = 'created_at'
);

SET @add_created_at = IF(
    @created_at_exists = 0,
    'ALTER TABLE `application` ADD COLUMN `created_at` DATETIME(6) NULL',
    'SELECT 1'
);

PREPARE add_created_at_statement FROM @add_created_at;
EXECUTE add_created_at_statement;
DEALLOCATE PREPARE add_created_at_statement;

SET @created_at_camel_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'application'
      AND COLUMN_NAME = 'createdAt'
);

SET @copy_created_at = IF(
    @created_at_camel_exists = 1,
    'UPDATE `application` SET `created_at` = `createdAt` WHERE `created_at` IS NULL AND `createdAt` IS NOT NULL',
    'SELECT 1'
);

PREPARE copy_created_at_statement FROM @copy_created_at;
EXECUTE copy_created_at_statement;
DEALLOCATE PREPARE copy_created_at_statement;

SET @drop_created_at_camel = IF(
    @created_at_camel_exists = 1,
    'ALTER TABLE `application` DROP COLUMN `createdAt`',
    'SELECT 1'
);

PREPARE drop_created_at_camel_statement FROM @drop_created_at_camel;
EXECUTE drop_created_at_camel_statement;
DEALLOCATE PREPARE drop_created_at_camel_statement;

SET @updated_at_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'application'
      AND COLUMN_NAME = 'updated_at'
);

SET @add_updated_at = IF(
    @updated_at_exists = 0,
    'ALTER TABLE `application` ADD COLUMN `updated_at` DATETIME(6) NULL',
    'SELECT 1'
);

PREPARE add_updated_at_statement FROM @add_updated_at;
EXECUTE add_updated_at_statement;
DEALLOCATE PREPARE add_updated_at_statement;

SET @updated_at_camel_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'application'
      AND COLUMN_NAME = 'updatedAt'
);

SET @copy_updated_at = IF(
    @updated_at_camel_exists = 1,
    'UPDATE `application` SET `updated_at` = `updatedAt` WHERE `updated_at` IS NULL AND `updatedAt` IS NOT NULL',
    'SELECT 1'
);

PREPARE copy_updated_at_statement FROM @copy_updated_at;
EXECUTE copy_updated_at_statement;
DEALLOCATE PREPARE copy_updated_at_statement;

SET @drop_updated_at_camel = IF(
    @updated_at_camel_exists = 1,
    'ALTER TABLE `application` DROP COLUMN `updatedAt`',
    'SELECT 1'
);

PREPARE drop_updated_at_camel_statement FROM @drop_updated_at_camel;
EXECUTE drop_updated_at_camel_statement;
DEALLOCATE PREPARE drop_updated_at_camel_statement;

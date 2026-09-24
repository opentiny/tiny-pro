-- Keep Application timestamps in the snake_case columns used by the entity.
-- V1 and the first compatibility migration used camelCase columns, while the
-- entity now maps to created_at and updated_at. Preserve existing values before
-- removing the obsolete columns.

SET @created_at_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'application'
      AND COLUMN_NAME = 'created_at'
);

SET @created_at_camel_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'application'
      AND COLUMN_NAME = 'createdAt'
);

SET @copy_created_at = IF(
    @created_at_exists = 1 AND @created_at_camel_exists = 1,
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

SET @updated_at_camel_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'application'
      AND COLUMN_NAME = 'updatedAt'
);

SET @copy_updated_at = IF(
    @updated_at_exists = 1 AND @updated_at_camel_exists = 1,
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

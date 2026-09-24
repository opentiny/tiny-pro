-- Existing baseline databases may predate Application.createdAt/updatedAt.
-- Add the columns only when they are absent.

SET @created_at_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'application'
      AND COLUMN_NAME = 'createdAt'
);

SET @add_created_at = IF(
    @created_at_exists = 0,
    'ALTER TABLE `application` ADD COLUMN `createdAt` DATETIME(6) NULL',
    'SELECT 1'
);

PREPARE add_created_at_statement FROM @add_created_at;
EXECUTE add_created_at_statement;
DEALLOCATE PREPARE add_created_at_statement;

SET @updated_at_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'application'
      AND COLUMN_NAME = 'updatedAt'
);

SET @add_updated_at = IF(
    @updated_at_exists = 0,
    'ALTER TABLE `application` ADD COLUMN `updatedAt` DATETIME(6) NULL',
    'SELECT 1'
);

PREPARE add_updated_at_statement FROM @add_updated_at;
EXECUTE add_updated_at_statement;
DEALLOCATE PREPARE add_updated_at_statement;

-- Hibernate maps Application timestamps to snake_case columns.
-- Add the columns for databases that were baselined before these fields existed.

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

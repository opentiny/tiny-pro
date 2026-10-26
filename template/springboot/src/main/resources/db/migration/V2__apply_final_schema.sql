-- Apply the SpringBoot schema changes after the V1 legacy baseline.
-- Existing databases must be deduplicated before the unique indexes below
-- are added. The migration intentionally fails rather than silently changing
-- or deleting application data.

-- Hibernate previously created I18 with a quoted entity name on Linux. Rename
-- it to the explicit lower-case table name used by the application entity.
SET @i18_upper_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'I18'
);

SET @i18_lower_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'i18'
);

SET @rename_i18 = IF(
    @i18_upper_exists = 1 AND @i18_lower_exists = 0,
    'RENAME TABLE `I18` TO `i18`',
    'SELECT 1'
);

PREPARE rename_i18_statement FROM @rename_i18;
EXECUTE rename_i18_statement;
DEALLOCATE PREPARE rename_i18_statement;

-- Application was introduced by this PR and is absent from the legacy schema.
CREATE TABLE IF NOT EXISTS `application` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NULL,
    `tag` TEXT NULL,
    `icon` VARCHAR(255) NULL,
    `classify` VARCHAR(255) NULL,
    `created_at` DATETIME(6) NULL,
    `updated_at` DATETIME(6) NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Make manually created/partially upgraded Application tables match the final
-- entity mapping as well.
SET @created_at_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'application' AND COLUMN_NAME = 'created_at'
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
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'application' AND COLUMN_NAME = 'updated_at'
);
SET @add_updated_at = IF(
    @updated_at_exists = 0,
    'ALTER TABLE `application` ADD COLUMN `updated_at` DATETIME(6) NULL',
    'SELECT 1'
);
PREPARE add_updated_at_statement FROM @add_updated_at;
EXECUTE add_updated_at_statement;
DEALLOCATE PREPARE add_updated_at_statement;

SET @created_at_camel_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'application' AND COLUMN_NAME = 'createdAt'
);
SET @copy_created_at = IF(
    @created_at_camel_exists = 1,
    'UPDATE `application` SET `created_at` = `createdAt` WHERE `created_at` IS NULL AND `createdAt` IS NOT NULL',
    'SELECT 1'
);
PREPARE copy_created_at_statement FROM @copy_created_at;
EXECUTE copy_created_at_statement;
DEALLOCATE PREPARE copy_created_at_statement;

SET @updated_at_camel_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'application' AND COLUMN_NAME = 'updatedAt'
);
SET @copy_updated_at = IF(
    @updated_at_camel_exists = 1,
    'UPDATE `application` SET `updated_at` = `updatedAt` WHERE `updated_at` IS NULL AND `updatedAt` IS NOT NULL',
    'SELECT 1'
);
PREPARE copy_updated_at_statement FROM @copy_updated_at;
EXECUTE copy_updated_at_statement;
DEALLOCATE PREPARE copy_updated_at_statement;

SET @drop_created_at_camel = IF(
    @created_at_camel_exists = 1,
    'ALTER TABLE `application` DROP COLUMN `createdAt`',
    'SELECT 1'
);
PREPARE drop_created_at_camel_statement FROM @drop_created_at_camel;
EXECUTE drop_created_at_camel_statement;
DEALLOCATE PREPARE drop_created_at_camel_statement;

SET @drop_updated_at_camel = IF(
    @updated_at_camel_exists = 1,
    'ALTER TABLE `application` DROP COLUMN `updatedAt`',
    'SELECT 1'
);
PREPARE drop_updated_at_camel_statement FROM @drop_updated_at_camel;
EXECUTE drop_updated_at_camel_statement;
DEALLOCATE PREPARE drop_updated_at_camel_statement;

-- Move legacy user audit columns to the names used by the entity.
SET @create_time_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user' AND COLUMN_NAME = 'create_time'
);
SET @add_create_time = IF(
    @create_time_exists = 0,
    'ALTER TABLE `user` ADD COLUMN `create_time` DATE NULL',
    'SELECT 1'
);
PREPARE add_create_time_statement FROM @add_create_time;
EXECUTE add_create_time_statement;
DEALLOCATE PREPARE add_create_time_statement;

SET @update_time_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user' AND COLUMN_NAME = 'update_time'
);
SET @add_update_time = IF(
    @update_time_exists = 0,
    'ALTER TABLE `user` ADD COLUMN `update_time` DATE NULL',
    'SELECT 1'
);
PREPARE add_update_time_statement FROM @add_update_time;
EXECUTE add_update_time_statement;
DEALLOCATE PREPARE add_update_time_statement;

SET @create_time_legacy_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user' AND COLUMN_NAME = 'createTime'
);
SET @copy_create_time = IF(
    @create_time_legacy_exists = 1,
    'UPDATE `user` SET `create_time` = `createTime` WHERE `create_time` IS NULL AND `createTime` IS NOT NULL',
    'SELECT 1'
);
PREPARE copy_create_time_statement FROM @copy_create_time;
EXECUTE copy_create_time_statement;
DEALLOCATE PREPARE copy_create_time_statement;

SET @update_time_legacy_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user' AND COLUMN_NAME = 'updateTime'
);
SET @copy_update_time = IF(
    @update_time_legacy_exists = 1,
    'UPDATE `user` SET `update_time` = `updateTime` WHERE `update_time` IS NULL AND `updateTime` IS NOT NULL',
    'SELECT 1'
);
PREPARE copy_update_time_statement FROM @copy_update_time;
EXECUTE copy_update_time_statement;
DEALLOCATE PREPARE copy_update_time_statement;

SET @drop_create_time_legacy = IF(
    @create_time_legacy_exists = 1,
    'ALTER TABLE `user` DROP COLUMN `createTime`',
    'SELECT 1'
);
PREPARE drop_create_time_legacy_statement FROM @drop_create_time_legacy;
EXECUTE drop_create_time_legacy_statement;
DEALLOCATE PREPARE drop_create_time_legacy_statement;

SET @drop_update_time_legacy = IF(
    @update_time_legacy_exists = 1,
    'ALTER TABLE `user` DROP COLUMN `updateTime`',
    'SELECT 1'
);
PREPARE drop_update_time_legacy_statement FROM @drop_update_time_legacy;
EXECUTE drop_update_time_legacy_statement;
DEALLOCATE PREPARE drop_update_time_legacy_statement;

-- Use a complete, NULL-safe menu identity hash instead of MySQL VARCHAR
-- prefixes. Existing duplicate identities must be resolved before this step.
SET @menu_name_index = (
    SELECT MAX(s.INDEX_NAME)
    FROM INFORMATION_SCHEMA.STATISTICS s
    WHERE s.TABLE_SCHEMA = DATABASE()
      AND s.TABLE_NAME = 'menu'
      AND s.NON_UNIQUE = 0
      AND s.COLUMN_NAME = 'name'
      AND s.INDEX_NAME <> 'PRIMARY'
      AND (
          SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS s2
          WHERE s2.TABLE_SCHEMA = s.TABLE_SCHEMA
            AND s2.TABLE_NAME = s.TABLE_NAME
            AND s2.INDEX_NAME = s.INDEX_NAME
      ) = 1
);
SET @drop_menu_name_index = IF(
    @menu_name_index IS NULL,
    'SELECT 1',
    CONCAT('ALTER TABLE `menu` DROP INDEX `', @menu_name_index, '`')
);
PREPARE drop_menu_name_index_statement FROM @drop_menu_name_index;
EXECUTE drop_menu_name_index_statement;
DEALLOCATE PREPARE drop_menu_name_index_statement;

SET @menu_identity_column_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'menu' AND COLUMN_NAME = 'menu_identity_hash'
);
SET @add_menu_identity_column = IF(
    @menu_identity_column_exists = 0,
    'ALTER TABLE `menu` ADD COLUMN `menu_identity_hash` BINARY(32) GENERATED ALWAYS AS (UNHEX(SHA2(CONCAT(IF(`name` IS NULL, ''-1:'', CONCAT(CHAR_LENGTH(`name`), '':'', `name`)), IF(`order` IS NULL, ''-1:'', CONCAT(CHAR_LENGTH(`order`), '':'', `order`)), IF(`menuType` IS NULL, ''-1:'', CONCAT(CHAR_LENGTH(`menuType`), '':'', `menuType`)), IF(`parentId` IS NULL, ''-1:'', CONCAT(CHAR_LENGTH(`parentId`), '':'', `parentId`)), IF(`path` IS NULL, ''-1:'', CONCAT(CHAR_LENGTH(`path`), '':'', `path`)), IF(`icon` IS NULL, ''-1:'', CONCAT(CHAR_LENGTH(`icon`), '':'', `icon`)), IF(`component` IS NULL, ''-1:'', CONCAT(CHAR_LENGTH(`component`), '':'', `component`)), IF(`locale` IS NULL, ''-1:'', CONCAT(CHAR_LENGTH(`locale`), '':'', `locale`))), 256))) STORED',
    'SELECT 1'
);
PREPARE add_menu_identity_column_statement FROM @add_menu_identity_column;
EXECUTE add_menu_identity_column_statement;
DEALLOCATE PREPARE add_menu_identity_column_statement;

SET @menu_identity_index_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'menu' AND INDEX_NAME = 'uk_menu_identity'
);
SET @drop_menu_identity_index = IF(
    @menu_identity_index_exists = 1,
    'ALTER TABLE `menu` DROP INDEX `uk_menu_identity`',
    'SELECT 1'
);
PREPARE drop_menu_identity_index_statement FROM @drop_menu_identity_index;
EXECUTE drop_menu_identity_index_statement;
DEALLOCATE PREPARE drop_menu_identity_index_statement;

ALTER TABLE `menu` ADD UNIQUE KEY `uk_menu_identity` (`menu_identity_hash`);

-- Apply the final unique constraints. Existing duplicate values must be
-- cleaned up before these statements can succeed.
SET @add_permission_unique = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'permission' AND INDEX_NAME = 'uk_permission_name') = 0,
    'ALTER TABLE `permission` ADD UNIQUE KEY `uk_permission_name` (`name`)',
    'SELECT 1'
);
PREPARE add_permission_unique_statement FROM @add_permission_unique;
EXECUTE add_permission_unique_statement;
DEALLOCATE PREPARE add_permission_unique_statement;

SET @add_role_unique = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'role' AND INDEX_NAME = 'uk_role_name') = 0,
    'ALTER TABLE `role` ADD UNIQUE KEY `uk_role_name` (`name`)',
    'SELECT 1'
);
PREPARE add_role_unique_statement FROM @add_role_unique;
EXECUTE add_role_unique_statement;
DEALLOCATE PREPARE add_role_unique_statement;

SET @add_lang_unique = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'lang' AND INDEX_NAME = 'uk_lang_name') = 0,
    'ALTER TABLE `lang` ADD UNIQUE KEY `uk_lang_name` (`name`)',
    'SELECT 1'
);
PREPARE add_lang_unique_statement FROM @add_lang_unique;
EXECUTE add_lang_unique_statement;
DEALLOCATE PREPARE add_lang_unique_statement;

SET @add_user_unique = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user' AND INDEX_NAME = 'uk_user_email') = 0,
    'ALTER TABLE `user` ADD UNIQUE KEY `uk_user_email` (`email`)',
    'SELECT 1'
);
PREPARE add_user_unique_statement FROM @add_user_unique;
EXECUTE add_user_unique_statement;
DEALLOCATE PREPARE add_user_unique_statement;

SET @add_i18_unique = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'i18' AND INDEX_NAME = 'uk_i18_lang_key') = 0,
    'ALTER TABLE `i18` ADD UNIQUE KEY `uk_i18_lang_key` (`lang_id`, `key`)',
    'SELECT 1'
);
PREPARE add_i18_unique_statement FROM @add_i18_unique;
EXECUTE add_i18_unique_statement;
DEALLOCATE PREPARE add_i18_unique_statement;

SET @add_application_unique = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'application' AND INDEX_NAME = 'uk_application_name') = 0,
    'ALTER TABLE `application` ADD UNIQUE KEY `uk_application_name` (`name`)',
    'SELECT 1'
);
PREPARE add_application_unique_statement FROM @add_application_unique;
EXECUTE add_application_unique_statement;
DEALLOCATE PREPARE add_application_unique_statement;

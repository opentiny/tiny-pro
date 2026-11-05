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

-- Normalize the application tag column for Hibernate validation. Legacy
-- databases may have TINYTEXT or another text type instead of TEXT.
SET @tag_data_type = (
    SELECT LOWER(c.DATA_TYPE)
    FROM INFORMATION_SCHEMA.COLUMNS c
    WHERE c.TABLE_SCHEMA = DATABASE()
      AND c.TABLE_NAME = 'application'
      AND c.COLUMN_NAME = 'tag'
    LIMIT 1
);

SET @alter_tag = IF(
    @tag_data_type IS NULL OR @tag_data_type = 'text',
    'SELECT 1',
    'ALTER TABLE `application` MODIFY COLUMN `tag` TEXT NULL'
);

PREPARE alter_tag_statement FROM @alter_tag;
EXECUTE alter_tag_statement;
DEALLOCATE PREPARE alter_tag_statement;

-- Ensure the unique language/key index exists under the canonical name. If an
-- equivalent unique index already exists under another name, rename it.
SET @i18_unique_index_name = (
    SELECT MAX(index_name)
    FROM (
        SELECT s.INDEX_NAME AS index_name
        FROM INFORMATION_SCHEMA.STATISTICS s
        WHERE s.TABLE_SCHEMA = DATABASE()
          AND s.TABLE_NAME = 'i18'
          AND s.NON_UNIQUE = 0
          AND s.INDEX_NAME <> 'PRIMARY'
        GROUP BY s.INDEX_NAME
        HAVING COUNT(*) = 2
           AND SUM(s.COLUMN_NAME = 'lang_id') = 1
           AND SUM(s.COLUMN_NAME = 'key') = 1
    ) equivalent_unique_indexes
);

SET @rename_i18_unique_index = IF(
    @i18_unique_index_name IS NULL OR @i18_unique_index_name = 'uk_i18_lang_key',
    'SELECT 1',
    CONCAT('ALTER TABLE `i18` RENAME INDEX `', @i18_unique_index_name,
           '` TO `uk_i18_lang_key`')
);

PREPARE rename_i18_unique_index_statement FROM @rename_i18_unique_index;
EXECUTE rename_i18_unique_index_statement;
DEALLOCATE PREPARE rename_i18_unique_index_statement;

SET @i18_unique_index_named = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'i18'
      AND INDEX_NAME = 'uk_i18_lang_key'
);

SET @add_i18_unique_index = IF(
    @i18_unique_index_named > 0,
    'SELECT 1',
    'ALTER TABLE `i18` ADD UNIQUE KEY `uk_i18_lang_key` (`lang_id`, `key`)'
);

PREPARE add_i18_unique_index_statement FROM @add_i18_unique_index;
EXECUTE add_i18_unique_index_statement;
DEALLOCATE PREPARE add_i18_unique_index_statement;

-- Ensure the supporting lang_id index exists under the canonical name. If the
-- foreign-key index already exists under another name, rename it.
SET @i18_lang_index_name = (
    SELECT MAX(index_name)
    FROM (
        SELECT s.INDEX_NAME AS index_name
        FROM INFORMATION_SCHEMA.STATISTICS s
        WHERE s.TABLE_SCHEMA = DATABASE()
          AND s.TABLE_NAME = 'i18'
          AND s.INDEX_NAME <> 'PRIMARY'
        GROUP BY s.INDEX_NAME
        HAVING COUNT(*) = 1
           AND MAX(s.COLUMN_NAME) = 'lang_id'
    ) equivalent_lang_indexes
);

SET @rename_i18_lang_index = IF(
    @i18_lang_index_name IS NULL OR @i18_lang_index_name = 'idx_i18_lang_id',
    'SELECT 1',
    CONCAT('ALTER TABLE `i18` RENAME INDEX `', @i18_lang_index_name,
           '` TO `idx_i18_lang_id`')
);

PREPARE rename_i18_lang_index_statement FROM @rename_i18_lang_index;
EXECUTE rename_i18_lang_index_statement;
DEALLOCATE PREPARE rename_i18_lang_index_statement;

SET @i18_lang_index_named = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'i18'
      AND INDEX_NAME = 'idx_i18_lang_id'
);

SET @add_i18_lang_index = IF(
    @i18_lang_index_named > 0,
    'SELECT 1',
    'ALTER TABLE `i18` ADD KEY `idx_i18_lang_id` (`lang_id`)'
);

PREPARE add_i18_lang_index_statement FROM @add_i18_lang_index;
EXECUTE add_i18_lang_index_statement;
DEALLOCATE PREPARE add_i18_lang_index_statement;

-- Align legacy nullable business identifiers with the V1 schema. Existing
-- NULL values must be cleaned before this migration can succeed.
SET @permission_name_nullable = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'permission'
      AND COLUMN_NAME = 'name'
      AND IS_NULLABLE = 'YES'
);
SET @alter_permission_name = IF(
    @permission_name_nullable = 1,
    'ALTER TABLE `permission` MODIFY COLUMN `name` VARCHAR(255) NOT NULL',
    'SELECT 1'
);
PREPARE alter_permission_name_statement FROM @alter_permission_name;
EXECUTE alter_permission_name_statement;
DEALLOCATE PREPARE alter_permission_name_statement;

SET @role_name_nullable = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'role'
      AND COLUMN_NAME = 'name'
      AND IS_NULLABLE = 'YES'
);
SET @alter_role_name = IF(
    @role_name_nullable = 1,
    'ALTER TABLE `role` MODIFY COLUMN `name` VARCHAR(255) NOT NULL',
    'SELECT 1'
);
PREPARE alter_role_name_statement FROM @alter_role_name;
EXECUTE alter_role_name_statement;
DEALLOCATE PREPARE alter_role_name_statement;

SET @lang_name_nullable = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lang'
      AND COLUMN_NAME = 'name'
      AND IS_NULLABLE = 'YES'
);
SET @alter_lang_name = IF(
    @lang_name_nullable = 1,
    'ALTER TABLE `lang` MODIFY COLUMN `name` VARCHAR(255) NOT NULL',
    'SELECT 1'
);
PREPARE alter_lang_name_statement FROM @alter_lang_name;
EXECUTE alter_lang_name_statement;
DEALLOCATE PREPARE alter_lang_name_statement;

SET @menu_name_nullable = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'menu'
      AND COLUMN_NAME = 'name'
      AND IS_NULLABLE = 'YES'
);
SET @alter_menu_name = IF(
    @menu_name_nullable = 1,
    'ALTER TABLE `menu` MODIFY COLUMN `name` VARCHAR(255) NOT NULL',
    'SELECT 1'
);
PREPARE alter_menu_name_statement FROM @alter_menu_name;
EXECUTE alter_menu_name_statement;
DEALLOCATE PREPARE alter_menu_name_statement;

SET @user_email_nullable = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'user'
      AND COLUMN_NAME = 'email'
      AND IS_NULLABLE = 'YES'
);
SET @alter_user_email = IF(
    @user_email_nullable = 1,
    'ALTER TABLE `user` MODIFY COLUMN `email` VARCHAR(255) NOT NULL',
    'SELECT 1'
);
PREPARE alter_user_email_statement FROM @alter_user_email;
EXECUTE alter_user_email_statement;
DEALLOCATE PREPARE alter_user_email_statement;

-- Restore the named unique constraints declared by V1. Duplicate values will
-- make the migration fail instead of silently changing application behavior.
SET @permission_unique_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'permission'
      AND INDEX_NAME = 'uk_permission_name'
);
SET @add_permission_unique = IF(
    @permission_unique_exists > 0,
    'SELECT 1',
    'ALTER TABLE `permission` ADD UNIQUE KEY `uk_permission_name` (`name`)'
);
PREPARE add_permission_unique_statement FROM @add_permission_unique;
EXECUTE add_permission_unique_statement;
DEALLOCATE PREPARE add_permission_unique_statement;

SET @role_unique_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'role'
      AND INDEX_NAME = 'uk_role_name'
);
SET @add_role_unique = IF(
    @role_unique_exists > 0,
    'SELECT 1',
    'ALTER TABLE `role` ADD UNIQUE KEY `uk_role_name` (`name`)'
);
PREPARE add_role_unique_statement FROM @add_role_unique;
EXECUTE add_role_unique_statement;
DEALLOCATE PREPARE add_role_unique_statement;

SET @lang_unique_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lang'
      AND INDEX_NAME = 'uk_lang_name'
);
SET @add_lang_unique = IF(
    @lang_unique_exists > 0,
    'SELECT 1',
    'ALTER TABLE `lang` ADD UNIQUE KEY `uk_lang_name` (`name`)'
);
PREPARE add_lang_unique_statement FROM @add_lang_unique;
EXECUTE add_lang_unique_statement;
DEALLOCATE PREPARE add_lang_unique_statement;

SET @user_email_unique_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'user'
      AND INDEX_NAME = 'uk_user_email'
);
SET @add_user_email_unique = IF(
    @user_email_unique_exists > 0,
    'SELECT 1',
    'ALTER TABLE `user` ADD UNIQUE KEY `uk_user_email` (`email`)'
);
PREPARE add_user_email_unique_statement FROM @add_user_email_unique;
EXECUTE add_user_email_unique_statement;
DEALLOCATE PREPARE add_user_email_unique_statement;

-- Restore the composite primary key declared by V1 for user_role.
SET @user_role_primary_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'user_role'
      AND INDEX_NAME = 'PRIMARY'
);
SET @add_user_role_primary = IF(
    @user_role_primary_exists > 0,
    'SELECT 1',
    'ALTER TABLE `user_role` ADD PRIMARY KEY (`user_id`, `role_id`)'
);
PREPARE add_user_role_primary_statement FROM @add_user_role_primary;
EXECUTE add_user_role_primary_statement;
DEALLOCATE PREPARE add_user_role_primary_statement;

-- Normalize legacy foreign-key actions to the V1 CASCADE behavior. Each
-- constraint is changed only when its canonical name or actions differ.
SET @role_menu_role_ok = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND CONSTRAINT_NAME = 'fk_role_menu_role'
      AND TABLE_NAME = 'role_menu'
      AND REFERENCED_TABLE_NAME = 'role'
      AND DELETE_RULE = 'CASCADE'
      AND UPDATE_RULE = 'CASCADE'
);
SET @role_menu_role_fk = (
    SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'role_menu'
      AND COLUMN_NAME = 'role_id' AND REFERENCED_TABLE_NAME = 'role' LIMIT 1
);
SET @drop_role_menu_role_fk = IF(
    @role_menu_role_ok = 1 OR @role_menu_role_fk IS NULL, 'SELECT 1',
    CONCAT('ALTER TABLE `role_menu` DROP FOREIGN KEY `', @role_menu_role_fk, '`')
);
PREPARE drop_role_menu_role_fk_statement FROM @drop_role_menu_role_fk;
EXECUTE drop_role_menu_role_fk_statement;
DEALLOCATE PREPARE drop_role_menu_role_fk_statement;
SET @add_role_menu_role_fk = IF(
    @role_menu_role_ok = 1, 'SELECT 1',
    'ALTER TABLE `role_menu` ADD CONSTRAINT `fk_role_menu_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE'
);
PREPARE add_role_menu_role_fk_statement FROM @add_role_menu_role_fk;
EXECUTE add_role_menu_role_fk_statement;
DEALLOCATE PREPARE add_role_menu_role_fk_statement;

SET @role_menu_menu_ok = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_role_menu_menu'
      AND TABLE_NAME = 'role_menu' AND REFERENCED_TABLE_NAME = 'menu'
      AND DELETE_RULE = 'CASCADE' AND UPDATE_RULE = 'CASCADE'
);
SET @role_menu_menu_fk = (
    SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'role_menu'
      AND COLUMN_NAME = 'menu_id' AND REFERENCED_TABLE_NAME = 'menu' LIMIT 1
);
SET @drop_role_menu_menu_fk = IF(
    @role_menu_menu_ok = 1 OR @role_menu_menu_fk IS NULL, 'SELECT 1',
    CONCAT('ALTER TABLE `role_menu` DROP FOREIGN KEY `', @role_menu_menu_fk, '`')
);
PREPARE drop_role_menu_menu_fk_statement FROM @drop_role_menu_menu_fk;
EXECUTE drop_role_menu_menu_fk_statement;
DEALLOCATE PREPARE drop_role_menu_menu_fk_statement;
SET @add_role_menu_menu_fk = IF(
    @role_menu_menu_ok = 1, 'SELECT 1',
    'ALTER TABLE `role_menu` ADD CONSTRAINT `fk_role_menu_menu` FOREIGN KEY (`menu_id`) REFERENCES `menu` (`id`) ON DELETE CASCADE ON UPDATE CASCADE'
);
PREPARE add_role_menu_menu_fk_statement FROM @add_role_menu_menu_fk;
EXECUTE add_role_menu_menu_fk_statement;
DEALLOCATE PREPARE add_role_menu_menu_fk_statement;

SET @role_permission_role_ok = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_role_permission_role'
      AND TABLE_NAME = 'role_permission' AND REFERENCED_TABLE_NAME = 'role'
      AND DELETE_RULE = 'CASCADE' AND UPDATE_RULE = 'CASCADE'
);
SET @role_permission_role_fk = (
    SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'role_permission'
      AND COLUMN_NAME = 'role_id' AND REFERENCED_TABLE_NAME = 'role' LIMIT 1
);
SET @drop_role_permission_role_fk = IF(
    @role_permission_role_ok = 1 OR @role_permission_role_fk IS NULL, 'SELECT 1',
    CONCAT('ALTER TABLE `role_permission` DROP FOREIGN KEY `', @role_permission_role_fk, '`')
);
PREPARE drop_role_permission_role_fk_statement FROM @drop_role_permission_role_fk;
EXECUTE drop_role_permission_role_fk_statement;
DEALLOCATE PREPARE drop_role_permission_role_fk_statement;
SET @add_role_permission_role_fk = IF(
    @role_permission_role_ok = 1, 'SELECT 1',
    'ALTER TABLE `role_permission` ADD CONSTRAINT `fk_role_permission_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE'
);
PREPARE add_role_permission_role_fk_statement FROM @add_role_permission_role_fk;
EXECUTE add_role_permission_role_fk_statement;
DEALLOCATE PREPARE add_role_permission_role_fk_statement;

SET @role_permission_permission_ok = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_role_permission_permission'
      AND TABLE_NAME = 'role_permission' AND REFERENCED_TABLE_NAME = 'permission'
      AND DELETE_RULE = 'CASCADE' AND UPDATE_RULE = 'CASCADE'
);
SET @role_permission_permission_fk = (
    SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'role_permission'
      AND COLUMN_NAME = 'permission_id' AND REFERENCED_TABLE_NAME = 'permission' LIMIT 1
);
SET @drop_role_permission_permission_fk = IF(
    @role_permission_permission_ok = 1 OR @role_permission_permission_fk IS NULL, 'SELECT 1',
    CONCAT('ALTER TABLE `role_permission` DROP FOREIGN KEY `', @role_permission_permission_fk, '`')
);
PREPARE drop_role_permission_permission_fk_statement FROM @drop_role_permission_permission_fk;
EXECUTE drop_role_permission_permission_fk_statement;
DEALLOCATE PREPARE drop_role_permission_permission_fk_statement;
SET @add_role_permission_permission_fk = IF(
    @role_permission_permission_ok = 1, 'SELECT 1',
    'ALTER TABLE `role_permission` ADD CONSTRAINT `fk_role_permission_permission` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`id`) ON DELETE CASCADE ON UPDATE CASCADE'
);
PREPARE add_role_permission_permission_fk_statement FROM @add_role_permission_permission_fk;
EXECUTE add_role_permission_permission_fk_statement;
DEALLOCATE PREPARE add_role_permission_permission_fk_statement;

SET @user_role_user_ok = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_user_role_user'
      AND TABLE_NAME = 'user_role' AND REFERENCED_TABLE_NAME = 'user'
      AND DELETE_RULE = 'CASCADE' AND UPDATE_RULE = 'CASCADE'
);
SET @user_role_user_fk = (
    SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'user_role'
      AND COLUMN_NAME = 'user_id' AND REFERENCED_TABLE_NAME = 'user' LIMIT 1
);
SET @drop_user_role_user_fk = IF(
    @user_role_user_ok = 1 OR @user_role_user_fk IS NULL, 'SELECT 1',
    CONCAT('ALTER TABLE `user_role` DROP FOREIGN KEY `', @user_role_user_fk, '`')
);
PREPARE drop_user_role_user_fk_statement FROM @drop_user_role_user_fk;
EXECUTE drop_user_role_user_fk_statement;
DEALLOCATE PREPARE drop_user_role_user_fk_statement;
SET @add_user_role_user_fk = IF(
    @user_role_user_ok = 1, 'SELECT 1',
    'ALTER TABLE `user_role` ADD CONSTRAINT `fk_user_role_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE'
);
PREPARE add_user_role_user_fk_statement FROM @add_user_role_user_fk;
EXECUTE add_user_role_user_fk_statement;
DEALLOCATE PREPARE add_user_role_user_fk_statement;

SET @user_role_role_ok = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_user_role_role'
      AND TABLE_NAME = 'user_role' AND REFERENCED_TABLE_NAME = 'role'
      AND DELETE_RULE = 'CASCADE' AND UPDATE_RULE = 'CASCADE'
);
SET @user_role_role_fk = (
    SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'user_role'
      AND COLUMN_NAME = 'role_id' AND REFERENCED_TABLE_NAME = 'role' LIMIT 1
);
SET @drop_user_role_role_fk = IF(
    @user_role_role_ok = 1 OR @user_role_role_fk IS NULL, 'SELECT 1',
    CONCAT('ALTER TABLE `user_role` DROP FOREIGN KEY `', @user_role_role_fk, '`')
);
PREPARE drop_user_role_role_fk_statement FROM @drop_user_role_role_fk;
EXECUTE drop_user_role_role_fk_statement;
DEALLOCATE PREPARE drop_user_role_role_fk_statement;
SET @add_user_role_role_fk = IF(
    @user_role_role_ok = 1, 'SELECT 1',
    'ALTER TABLE `user_role` ADD CONSTRAINT `fk_user_role_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE'
);
PREPARE add_user_role_role_fk_statement FROM @add_user_role_role_fk;
EXECUTE add_user_role_role_fk_statement;
DEALLOCATE PREPARE add_user_role_role_fk_statement;

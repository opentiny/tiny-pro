-- Align SpringBoot menu uniqueness with the NestJS full-field duplicate check.
--
-- MySQL allows multiple NULL values in a UNIQUE index. The menu identity
-- contains nullable fields, so indexing the original columns would still
-- allow duplicate root menus. The generated columns below normalize NULL
-- values before the unique index is created.

SET @menu_name_index = (
    SELECT MAX(s.INDEX_NAME)
    FROM INFORMATION_SCHEMA.STATISTICS s
    WHERE s.TABLE_SCHEMA = DATABASE()
      AND s.TABLE_NAME = 'menu'
      AND s.NON_UNIQUE = 0
      AND s.COLUMN_NAME = 'name'
      AND s.INDEX_NAME <> 'PRIMARY'
      AND (
          SELECT COUNT(*)
          FROM INFORMATION_SCHEMA.STATISTICS s2
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

SET @add_identity_order = IF(
    EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'menu'
          AND COLUMN_NAME = '_menu_identity_order'
    ),
    'SELECT 1',
    'ALTER TABLE `menu` ADD COLUMN `_menu_identity_order` INT GENERATED ALWAYS AS (COALESCE(`order`, -2147483648)) STORED'
);

PREPARE add_identity_order_statement FROM @add_identity_order;
EXECUTE add_identity_order_statement;
DEALLOCATE PREPARE add_identity_order_statement;

SET @add_identity_parent_id = IF(
    EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'menu'
          AND COLUMN_NAME = '_menu_identity_parent_id'
    ),
    'SELECT 1',
    'ALTER TABLE `menu` ADD COLUMN `_menu_identity_parent_id` INT GENERATED ALWAYS AS (COALESCE(`parentId`, -2147483648)) STORED'
);

PREPARE add_identity_parent_id_statement FROM @add_identity_parent_id;
EXECUTE add_identity_parent_id_statement;
DEALLOCATE PREPARE add_identity_parent_id_statement;

SET @add_identity_menu_type = IF(
    EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'menu'
          AND COLUMN_NAME = '_menu_identity_menu_type'
    ),
    'SELECT 1',
    'ALTER TABLE `menu` ADD COLUMN `_menu_identity_menu_type` VARCHAR(255) GENERATED ALWAYS AS (COALESCE(`menuType`, '''')) STORED'
);

PREPARE add_identity_menu_type_statement FROM @add_identity_menu_type;
EXECUTE add_identity_menu_type_statement;
DEALLOCATE PREPARE add_identity_menu_type_statement;

SET @add_identity_path = IF(
    EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'menu'
          AND COLUMN_NAME = '_menu_identity_path'
    ),
    'SELECT 1',
    'ALTER TABLE `menu` ADD COLUMN `_menu_identity_path` VARCHAR(255) GENERATED ALWAYS AS (COALESCE(`path`, '''')) STORED'
);

PREPARE add_identity_path_statement FROM @add_identity_path;
EXECUTE add_identity_path_statement;
DEALLOCATE PREPARE add_identity_path_statement;

SET @add_identity_icon = IF(
    EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'menu'
          AND COLUMN_NAME = '_menu_identity_icon'
    ),
    'SELECT 1',
    'ALTER TABLE `menu` ADD COLUMN `_menu_identity_icon` VARCHAR(255) GENERATED ALWAYS AS (COALESCE(`icon`, '''')) STORED'
);

PREPARE add_identity_icon_statement FROM @add_identity_icon;
EXECUTE add_identity_icon_statement;
DEALLOCATE PREPARE add_identity_icon_statement;

SET @add_identity_component = IF(
    EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'menu'
          AND COLUMN_NAME = '_menu_identity_component'
    ),
    'SELECT 1',
    'ALTER TABLE `menu` ADD COLUMN `_menu_identity_component` VARCHAR(255) GENERATED ALWAYS AS (COALESCE(`component`, '''')) STORED'
);

PREPARE add_identity_component_statement FROM @add_identity_component;
EXECUTE add_identity_component_statement;
DEALLOCATE PREPARE add_identity_component_statement;

SET @add_identity_locale = IF(
    EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'menu'
          AND COLUMN_NAME = '_menu_identity_locale'
    ),
    'SELECT 1',
    'ALTER TABLE `menu` ADD COLUMN `_menu_identity_locale` VARCHAR(255) GENERATED ALWAYS AS (COALESCE(`locale`, '''')) STORED'
);

PREPARE add_identity_locale_statement FROM @add_identity_locale;
EXECUTE add_identity_locale_statement;
DEALLOCATE PREPARE add_identity_locale_statement;

SET @menu_identity_index_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS s
    WHERE s.TABLE_SCHEMA = DATABASE()
      AND s.TABLE_NAME = 'menu'
      AND s.INDEX_NAME = 'uk_menu_identity'
);

SET @drop_menu_identity_index = IF(
    @menu_identity_index_exists = 0,
    'SELECT 1',
    'ALTER TABLE `menu` DROP INDEX `uk_menu_identity`'
);

PREPARE drop_menu_identity_index_statement FROM @drop_menu_identity_index;
EXECUTE drop_menu_identity_index_statement;
DEALLOCATE PREPARE drop_menu_identity_index_statement;

ALTER TABLE `menu`
    ADD UNIQUE KEY `uk_menu_identity` (
        `name`(120),
        `_menu_identity_order`,
        `_menu_identity_menu_type`(120),
        `_menu_identity_parent_id`,
        `_menu_identity_path`(120),
        `_menu_identity_icon`(120),
        `_menu_identity_component`(120),
        `_menu_identity_locale`(120)
    );

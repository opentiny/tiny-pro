-- Align SpringBoot menu uniqueness with the NestJS full-field duplicate check.
-- The migration is defensive because existing databases may use a generated
-- name for the old single-column unique index, or may not have that index.

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

SET @menu_identity_index_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS s
    WHERE s.TABLE_SCHEMA = DATABASE()
      AND s.TABLE_NAME = 'menu'
      AND s.INDEX_NAME = 'uk_menu_identity'
);

SET @add_menu_identity_index = IF(
    @menu_identity_index_exists = 0,
    'ALTER TABLE `menu` ADD CONSTRAINT `uk_menu_identity` UNIQUE (`name`, `order`, `menuType`, `parentId`, `path`, `icon`, `component`, `locale`)',
    'SELECT 1'
);

PREPARE add_menu_identity_index_statement FROM @add_menu_identity_index;
EXECUTE add_menu_identity_index_statement;
DEALLOCATE PREPARE add_menu_identity_index_statement;

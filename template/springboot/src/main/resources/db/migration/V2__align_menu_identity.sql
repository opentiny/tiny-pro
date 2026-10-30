-- Align SpringBoot menu uniqueness with the NestJS full-field duplicate check.
--
-- This migration is the source of truth for menu identity uniqueness. The JPA
-- entity intentionally does not declare an equivalent @UniqueConstraint because
-- the database enforces uniqueness through the generated hash column below.
--
-- Do not index string prefixes here. A prefix index can reject two different
-- menus whose path/component/etc. values share the first 120 characters,
-- while findByMenuIdentity compares the complete values. Instead, hash the
-- complete nullable identity with a deterministic SHA-256 expression and
-- enforce uniqueness on the fixed-size hash.

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

SET @add_identity_hash = IF(
    EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'menu'
          AND COLUMN_NAME = '_menu_identity_hash'
    ),
    'SELECT 1',
    'ALTER TABLE `menu` ADD COLUMN `_menu_identity_hash` CHAR(64) GENERATED ALWAYS AS (SHA2(JSON_ARRAY(`name`, `order`, `menuType`, `parentId`, `path`, `icon`, `component`, `locale`), 256)) STORED'
);

PREPARE add_identity_hash_statement FROM @add_identity_hash;
EXECUTE add_identity_hash_statement;
DEALLOCATE PREPARE add_identity_hash_statement;

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
    ADD UNIQUE KEY `uk_menu_identity` (`_menu_identity_hash`);

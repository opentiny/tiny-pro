-- Synchronize the SpringBoot menu catalog with the current frontend menu data.
-- Keep MenuPage, remove the obsolete Cloud menu tree, and add Form > Editor.

-- Remove role assignments before deleting the obsolete menu tree. This keeps
-- the migration safe even for databases whose legacy foreign keys did not use
-- ON DELETE CASCADE.
DELETE rm
FROM `role_menu` rm
JOIN `menu` m ON m.`id` = rm.`menu_id`
WHERE m.`component` LIKE 'cloud/%';

DELETE FROM `menu`
WHERE `component` LIKE 'cloud/%';

-- Synchronize the Editor menu under the intended Form parent. Do not update
-- unrelated menus that merely happen to use path='editor'.
SET @form_menu_id = (
    SELECT `id`
    FROM `menu`
    WHERE `path` = 'form'
      AND `parentId` IS NULL
    ORDER BY `id`
    LIMIT 1
);

SET @editor_menu_id = (
    SELECT `id`
    FROM `menu`
    WHERE @form_menu_id IS NOT NULL
      AND `parentId` = @form_menu_id
      AND `name` = 'Editor'
      AND `order` = 3
      AND `menuType` = 'normal'
      AND `icon` = ''
      AND `component` = 'form/editor/index'
      AND `path` = 'editor'
      AND `locale` = 'menu.form.editor'
    ORDER BY `id`
    LIMIT 1
);

SET @legacy_editor_id = (
    SELECT `id`
    FROM `menu`
    WHERE @form_menu_id IS NOT NULL
      AND `parentId` = @form_menu_id
      AND (
          `component` = 'orm/editor/index'
          OR (`name` = 'Editor' AND `path` = 'editor')
      )
    ORDER BY `id`
    LIMIT 1
);

UPDATE `menu`
SET `name` = 'Editor',
    `order` = 3,
    `parentId` = @form_menu_id,
    `menuType` = 'normal',
    `icon` = '',
    `component` = 'form/editor/index',
    `path` = 'editor',
    `locale` = 'menu.form.editor'
WHERE @editor_menu_id IS NULL
  AND @legacy_editor_id IS NOT NULL
  AND `id` = @legacy_editor_id;

INSERT INTO `menu` (
    `name`, `order`, `parentId`, `menuType`, `icon`, `component`, `path`, `locale`
)
SELECT
    'Editor', 3, @form_menu_id, 'normal', '', 'form/editor/index', 'editor', 'menu.form.editor'
FROM DUAL
WHERE @form_menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM `menu`
      WHERE `parentId` = @form_menu_id
        AND `name` = 'Editor'
        AND `path` = 'editor'
        AND `component` = 'form/editor/index'
  );

SET @editor_menu_id = (
    SELECT `id`
    FROM `menu`
    WHERE @form_menu_id IS NOT NULL
      AND `parentId` = @form_menu_id
      AND `name` = 'Editor'
      AND `path` = 'editor'
      AND `component` = 'form/editor/index'
    ORDER BY `id`
    LIMIT 1
);

-- Remove only duplicate Editor records under Form, preserving unrelated menus.
DELETE rm
FROM `role_menu` rm
JOIN `menu` m ON m.`id` = rm.`menu_id`
WHERE @form_menu_id IS NOT NULL
  AND m.`parentId` = @form_menu_id
  AND m.`id` <> @editor_menu_id
  AND m.`name` = 'Editor'
  AND m.`path` = 'editor';

DELETE FROM `menu`
WHERE @form_menu_id IS NOT NULL
  AND `parentId` = @form_menu_id
  AND `id` <> @editor_menu_id
  AND `name` = 'Editor'
  AND `path` = 'editor';

-- Existing roles do not receive newly inserted menus automatically.
INSERT INTO `role_menu` (`role_id`, `menu_id`)
SELECT r.`id`, @editor_menu_id
FROM `role` r
WHERE r.`name` = 'admin'
  AND @editor_menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM `role_menu` rm
      WHERE rm.`role_id` = r.`id`
        AND rm.`menu_id` = @editor_menu_id
  );

-- Seed the new menu label for existing databases.
INSERT INTO `i18` (`lang_id`, `key`, `content`)
SELECT l.`id`, 'menu.form.editor',
       CASE l.`name`
           WHEN 'enUS' THEN 'Rich Text'
           WHEN 'zhCN' THEN '富文本文档'
       END
FROM `lang` l
WHERE l.`name` IN ('enUS', 'zhCN')
  AND NOT EXISTS (
      SELECT 1
      FROM `i18` i
      WHERE i.`lang_id` = l.`id`
        AND i.`key` = 'menu.form.editor'
  );

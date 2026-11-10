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

-- Normalize an Editor menu that may have been seeded by an intermediate build,
-- including the historical typo in its component path.
SET @form_menu_id = (
    SELECT `id`
    FROM `menu`
    WHERE `path` = 'form'
      AND `parentId` IS NULL
    ORDER BY `id`
    LIMIT 1
);

UPDATE `menu`
SET `name` = 'Editor',
    `order` = 3,
    `menuType` = 'normal',
    `icon` = '',
    `component` = 'form/editor/index',
    `path` = 'editor',
    `locale` = 'menu.form.editor',
    `parentId` = @form_menu_id
WHERE @form_menu_id IS NOT NULL
  AND `path` = 'editor';

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
        AND `path` = 'editor'
  );

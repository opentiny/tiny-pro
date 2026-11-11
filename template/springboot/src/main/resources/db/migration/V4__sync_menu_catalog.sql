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
        AND `order` = 3
        AND `menuType` = 'normal'
        AND `icon` = ''
        AND `component` = 'form/editor/index'
        AND `path` = 'editor'
        AND `locale` = 'menu.form.editor'
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

-- Build an old-node -> retained-node map before changing parentId. This is
-- required because parentId participates in uk_menu_identity: two otherwise
-- identical children can coexist before the merge but collide after reparenting.
CREATE TEMPORARY TABLE `tmp_editor_roots` (
    `old_id` INT NOT NULL PRIMARY KEY
);

INSERT INTO `tmp_editor_roots` (`old_id`)
SELECT `id`
FROM `menu`
WHERE @form_menu_id IS NOT NULL
  AND `parentId` = @form_menu_id
  AND `id` <> @editor_menu_id
  AND `name` = 'Editor'
  AND `path` = 'editor';

-- Merge direct children before recursive reparenting. If the retained Editor
-- has no child, identical children from multiple legacy Editors must first be
-- reduced to one representative; otherwise changing both parentId values to
-- the retained Editor creates the same uk_menu_identity.
CREATE TEMPORARY TABLE `tmp_editor_direct_children` (
    `old_id` INT NOT NULL PRIMARY KEY,
    `target_id` INT NOT NULL
);

INSERT INTO `tmp_editor_direct_children` (`old_id`, `target_id`)
SELECT child.`id`,
       COALESCE(
           (
               SELECT MIN(canonical.`id`)
               FROM `menu` canonical
               WHERE canonical.`parentId` = @editor_menu_id
                 AND canonical.`name` = child.`name`
                 AND canonical.`order` <=> child.`order`
                 AND canonical.`menuType` <=> child.`menuType`
                 AND canonical.`icon` <=> child.`icon`
                 AND canonical.`component` <=> child.`component`
                 AND canonical.`path` <=> child.`path`
                 AND canonical.`locale` <=> child.`locale`
           ),
           (
               SELECT MIN(candidate.`id`)
               FROM `menu` candidate
               JOIN `tmp_editor_roots` candidate_root
                 ON candidate_root.`old_id` = candidate.`parentId`
               WHERE candidate.`name` = child.`name`
                 AND candidate.`order` <=> child.`order`
                 AND candidate.`menuType` <=> child.`menuType`
                 AND candidate.`icon` <=> child.`icon`
                 AND candidate.`component` <=> child.`component`
                 AND candidate.`path` <=> child.`path`
                 AND candidate.`locale` <=> child.`locale`
           )
       ) AS `target_id`
FROM `menu` child
JOIN `tmp_editor_roots` root ON root.`old_id` = child.`parentId`;

UPDATE `menu` child
JOIN `tmp_editor_direct_children` child_map
  ON child_map.`old_id` = child.`id`
SET child.`parentId` = @editor_menu_id
WHERE child_map.`old_id` = child_map.`target_id`
  AND NOT (child.`parentId` <=> @editor_menu_id);

DROP TEMPORARY TABLE `tmp_editor_direct_children`;

CREATE TEMPORARY TABLE `tmp_editor_menu_map` (
    `old_id` INT NOT NULL PRIMARY KEY,
    `target_id` INT NOT NULL,
    `target_parent_id` INT NULL
);

INSERT INTO `tmp_editor_menu_map` (`old_id`, `target_id`, `target_parent_id`)
WITH RECURSIVE `menu_map` AS (
    SELECT r.`old_id`, @editor_menu_id AS `target_id`, @form_menu_id AS `target_parent_id`
    FROM `tmp_editor_roots` r
    UNION ALL
    SELECT child.`id`,
           COALESCE(canonical.`id`, child.`id`) AS `target_id`,
           parent_map.`target_id` AS `target_parent_id`
    FROM `menu_map` parent_map
    JOIN `menu` child ON child.`parentId` = parent_map.`old_id`
    LEFT JOIN `menu` canonical
      ON canonical.`parentId` = parent_map.`target_id`
     AND canonical.`name` = child.`name`
     AND canonical.`order` <=> child.`order`
     AND canonical.`menuType` <=> child.`menuType`
     AND canonical.`icon` <=> child.`icon`
     AND canonical.`component` <=> child.`component`
     AND canonical.`path` <=> child.`path`
     AND canonical.`locale` <=> child.`locale`
)
SELECT `old_id`, `target_id`, `target_parent_id`
FROM `menu_map`;

-- Transfer every role assignment from a duplicate node to its retained node.
INSERT INTO `role_menu` (`role_id`, `menu_id`)
SELECT DISTINCT rm.`role_id`, map.`target_id`
FROM `role_menu` rm
JOIN `tmp_editor_menu_map` map ON map.`old_id` = rm.`menu_id`
WHERE map.`old_id` <> map.`target_id`
  AND NOT EXISTS (
      SELECT 1
      FROM `role_menu` existing_rm
      WHERE existing_rm.`role_id` = rm.`role_id`
        AND existing_rm.`menu_id` = map.`target_id`
  );

-- Reparent only nodes that do not have a canonical duplicate. Conflicting
-- nodes are deleted below after their assignments and descendants are merged.
UPDATE `menu` m
JOIN `tmp_editor_menu_map` map ON map.`old_id` = m.`id`
SET m.`parentId` = map.`target_parent_id`
WHERE map.`old_id` = map.`target_id`
  AND map.`target_parent_id` IS NOT NULL
  AND NOT (m.`parentId` <=> map.`target_parent_id`);

-- Remove role links and menu rows for nodes that were merged into a retained
-- canonical node. Non-conflicting descendants have already been reparented.
DELETE rm
FROM `role_menu` rm
JOIN `tmp_editor_menu_map` map ON map.`old_id` = rm.`menu_id`
WHERE map.`old_id` <> map.`target_id`;

DELETE m
FROM `menu` m
JOIN `tmp_editor_menu_map` map ON map.`old_id` = m.`id`
WHERE map.`old_id` <> map.`target_id`;

DROP TEMPORARY TABLE `tmp_editor_menu_map`;
DROP TEMPORARY TABLE `tmp_editor_roots`;

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

-- 员工写接口权限：旧数据库手动执行。
-- 新数据库由 DataInitializer.initPermissions() 自动创建，无需执行本文件。
-- 本脚本可重复执行，不会插入重复权限。

INSERT INTO `permission` (`name`, `desc`)
SELECT 'employee::add', ''
WHERE NOT EXISTS (
    SELECT 1 FROM `permission` WHERE `name` = 'employee::add'
);

INSERT INTO `permission` (`name`, `desc`)
SELECT 'employee::remove', ''
WHERE NOT EXISTS (
    SELECT 1 FROM `permission` WHERE `name` = 'employee::remove'
);

INSERT INTO `permission` (`name`, `desc`)
SELECT 'employee::update', ''
WHERE NOT EXISTS (
    SELECT 1 FROM `permission` WHERE `name` = 'employee::update'
);

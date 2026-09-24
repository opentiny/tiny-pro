-- TinyPro initial schema for SpringBoot.
-- Application seed data is intentionally handled by DataInitializer.

CREATE TABLE `permission` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `desc` VARCHAR(255) NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_permission_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `menu` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `order` INT NULL,
    `parentId` INT NULL,
    `menuType` VARCHAR(255) NULL,
    `icon` VARCHAR(255) NULL,
    `component` VARCHAR(255) NULL,
    `path` VARCHAR(255) NULL,
    `locale` VARCHAR(255) NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_menu_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `role` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_role_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lang` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_lang_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NULL,
    `department` VARCHAR(255) NULL,
    `employee_type` VARCHAR(255) NULL,
    `probation_start` DATE NULL,
    `probation_end` DATE NULL,
    `probation_duration` VARCHAR(255) NULL,
    `protocol_start` DATE NULL,
    `protocol_end` DATE NULL,
    `address` VARCHAR(255) NULL,
    `status` INT NULL,
    `createTime` DATE NULL,
    `create_time` DATE NULL,
    `updateTime` DATE NULL,
    `update_time` DATE NULL,
    `salt` VARCHAR(64) NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `i18` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(255) NULL,
    `content` TEXT NULL,
    `lang_id` INT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_i18_lang_key` (`lang_id`, `key`),
    KEY `idx_i18_lang_id` (`lang_id`),
    CONSTRAINT `fk_i18_lang`
        FOREIGN KEY (`lang_id`) REFERENCES `lang` (`id`)
        ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `role_permission` (
    `role_id` INT NOT NULL,
    `permission_id` INT NOT NULL,
    PRIMARY KEY (`role_id`, `permission_id`),
    KEY `idx_role_permission_permission` (`permission_id`),
    CONSTRAINT `fk_role_permission_role`
        FOREIGN KEY (`role_id`) REFERENCES `role` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_role_permission_permission`
        FOREIGN KEY (`permission_id`) REFERENCES `permission` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `role_menu` (
    `role_id` INT NOT NULL,
    `menu_id` INT NOT NULL,
    PRIMARY KEY (`role_id`, `menu_id`),
    KEY `idx_role_menu_menu` (`menu_id`),
    CONSTRAINT `fk_role_menu_role`
        FOREIGN KEY (`role_id`) REFERENCES `role` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_role_menu_menu`
        FOREIGN KEY (`menu_id`) REFERENCES `menu` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_role` (
    `user_id` INT NOT NULL,
    `role_id` INT NOT NULL,
    PRIMARY KEY (`user_id`, `role_id`),
    KEY `idx_user_role_role` (`role_id`),
    CONSTRAINT `fk_user_role_user`
        FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_user_role_role`
        FOREIGN KEY (`role_id`) REFERENCES `role` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `application` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NULL,
    `tag` TEXT NULL,
    `icon` VARCHAR(255) NULL,
    `classify` VARCHAR(255) NULL,
    `createdAt` DATETIME(6) NULL,
    `updatedAt` DATETIME(6) NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_application_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `employee` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `employee_no` VARCHAR(255) NULL,
    `department` VARCHAR(255) NULL,
    `department_level` VARCHAR(255) NULL,
    `status` VARCHAR(255) NULL,
    `workbench_name` VARCHAR(255) NULL,
    `project` VARCHAR(255) NULL,
    `type` VARCHAR(255) NULL,
    `address` VARCHAR(255) NULL,
    `roles` VARCHAR(255) NULL,
    `last_update_user` VARCHAR(255) NULL,
    `create_time` DATETIME(6) NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

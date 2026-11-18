-- Project detail data used by the project list and profile detail pages.

CREATE TABLE `project` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `project_name` VARCHAR(255) NOT NULL,
    `project_code` VARCHAR(64) NOT NULL,
    `project_status` VARCHAR(16) NOT NULL DEFAULT '0',
    `task_status` VARCHAR(16) NOT NULL DEFAULT '0',
    `department` VARCHAR(255) NOT NULL DEFAULT '',
    `start_time` DATE NULL,
    `end_time` DATE NULL,
    `priority` VARCHAR(16) NOT NULL DEFAULT '1',
    `owner` VARCHAR(255) NOT NULL,
    `progress` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    `man_hours` DECIMAL(10,2) NULL,
    `budget` DECIMAL(12,2) NULL,
    `team_size` INT NULL,
    `goal` TEXT NULL,
    `technology` TEXT NULL,
    `partner` TEXT NULL,
    `risk_level` VARCHAR(16) NULL,
    `quality` TEXT NULL,
    `remark` TEXT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_project_code` (`project_code`),
    KEY `idx_project_department` (`department`),
    KEY `idx_project_status` (`project_status`, `task_status`),
    KEY `idx_project_owner` (`owner`),
    KEY `idx_project_start_time` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `project_version` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `project_id` BIGINT NOT NULL,
    `version` VARCHAR(64) NOT NULL,
    `release_date` DATE NULL,
    `content` TEXT NOT NULL,
    `status` VARCHAR(16) NOT NULL DEFAULT '2',
    `owner` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_project_version_project_version` (`project_id`, `version`),
    KEY `idx_project_version_project_date` (`project_id`, `release_date`),
    CONSTRAINT `fk_project_version_project`
        FOREIGN KEY (`project_id`) REFERENCES `project` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `project_stage` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `project_id` BIGINT NOT NULL,
    `stage_code` VARCHAR(64) NOT NULL,
    `stage_name` VARCHAR(255) NOT NULL,
    `stage_status` VARCHAR(16) NOT NULL DEFAULT 'NOT_STARTED',
    `sort_order` INT NOT NULL DEFAULT 0,
    `started_at` DATETIME(6) NULL,
    `completed_at` DATETIME(6) NULL,
    `remark` TEXT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_project_stage_project_code` (`project_id`, `stage_code`),
    KEY `idx_project_stage_project_order` (`project_id`, `sort_order`),
    CONSTRAINT `fk_project_stage_project`
        FOREIGN KEY (`project_id`) REFERENCES `project` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

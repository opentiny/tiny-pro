-- Rich-text documents created by the editor page.
-- `content` stores the HTML produced by the rich-text editor.

CREATE TABLE `editor` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `department` VARCHAR(255) NOT NULL DEFAULT '未分类',
    `time` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    KEY `idx_editor_department` (`department`),
    KEY `idx_editor_time` (`time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users participating in collaborative editor documents.
-- This table stores membership only; it does not record edit operations.

CREATE TABLE `editor_member` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `editor_id` BIGINT NOT NULL,
    `user_id` INT NOT NULL,
    `joined_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_editor_member_editor_user` (`editor_id`, `user_id`),
    KEY `idx_editor_member_user` (`user_id`),
    CONSTRAINT `fk_editor_member_editor`
        FOREIGN KEY (`editor_id`) REFERENCES `editor` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_editor_member_user`
        FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

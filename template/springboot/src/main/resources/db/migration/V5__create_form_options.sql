-- Persistent option data used by the base/step form demo endpoints.
-- The API exposes some options as {value, label} and some as strings.  The
-- database keeps both values so the response shape can be adapted at the
-- application boundary without losing a stable identifier.

CREATE TABLE `form_option` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `option_type` VARCHAR(32) NOT NULL,
    `option_value` VARCHAR(64) NOT NULL,
    `option_label` VARCHAR(255) NOT NULL,
    `sort_order` INT NOT NULL DEFAULT 0,
    `enabled` BIT(1) NOT NULL DEFAULT b'1',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_form_option_type_value` (`option_type`, `option_value`),
    KEY `idx_form_option_type_enabled_order`
        (`option_type`, `enabled`, `sort_order`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `form_option`
    (`option_type`, `option_value`, `option_label`, `sort_order`)
VALUES
    ('POSITION', 'P001', 'Java后端开发工程师', 1),
    ('POSITION', 'P002', '前端开发工程师', 2),
    ('POSITION', 'P003', '产品经理', 3),
    ('POSITION', 'P004', '用户体验设计师', 4),
    ('HR', 'U1001', '张敏', 1),
    ('HR', 'U1002', '李娜', 2),
    ('HR', 'U1003', '王芳', 3),
    ('MENTOR', '陈杰', '陈杰', 1),
    ('MENTOR', '赵磊', '赵磊', 2),
    ('MENTOR', '刘洋', '刘洋', 3),
    ('MENTOR', '孙倩', '孙倩', 4),
    ('DIRECTOR', '周涛', '周涛', 1),
    ('DIRECTOR', '吴刚', '吴刚', 2),
    ('DIRECTOR', '林晓', '林晓', 3),
    ('DIRECTOR', '高峰', '高峰', 4),
    ('STATUS', 'running', 'running', 1),
    ('STATUS', 'finished', 'finished', 2),
    ('STATUS', 'delayed', 'delayed', 3),
    ('DEPARTMENT', 'D001', '研发部', 1),
    ('DEPARTMENT', 'D002', '产品部', 2),
    ('DEPARTMENT', 'D003', '人力资源部', 3);

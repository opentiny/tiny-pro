-- Project detail example data for local development.
-- This file is intentionally outside Flyway migrations. Run it after the
-- project, project_version, and project_stage tables have been created.

SET NAMES utf8mb4;

START TRANSACTION;

INSERT INTO `project` (
    `project_name`, `project_code`, `project_status`, `task_status`,
    `department`, `start_time`, `end_time`, `priority`, `owner`,
    `progress`, `man_hours`, `budget`, `team_size`, `goal`, `technology`,
    `partner`, `risk_level`, `quality`, `remark`
) VALUES
    (
        '智慧园区管理平台', 'PRJ-2024-01', '0', '1', '企业应用部',
        '2023-01-19', '2026-05-06', '1', '赵敏',
        5.00, 40.00, 20.00, 5,
        '打造统一的园区项目管理平台，实现项目全生命周期的数字化管控。',
        'Vue 3、TypeScript、TinyVue、NestJS、PostgreSQL',
        '质量管理部、运维中心、用户体验部', '低',
        '核心接口自动化测试覆盖率不低于 80%，生产缺陷密度低于 0.5 个/功能点。',
        '项目整体进度符合预期，需重点关注第三方接口联调排期风险。'
    ),
    (
        '统一支付结算中心', 'PRJ-2025-02', '1', '0', '金融事业部',
        '2025-02-10', '2026-12-20', '0', '王强',
        65.00, 320.00, 180.00, 12,
        '建设统一支付与结算能力，降低业务线重复接入和对账成本。',
        'Java、Spring Boot、MySQL、Redis、消息队列',
        '财务部、风控部、客户服务部', '中',
        '支付核心链路测试覆盖率不低于 90%，账务日终对账差异必须为零。',
        '当前处于联调阶段，需要持续关注支付渠道和清算机构的接口变更。'
    ),
    (
        '数据中台建设', 'PRJ-2024-03', '2', '0', '数据智能部',
        '2024-03-01', '2025-11-30', '1', '李娜',
        100.00, 560.00, 260.00, 12,
        '建立统一数据采集、治理、服务和分析能力，为经营决策提供可信数据。',
        'Flink、Kafka、ClickHouse、Python、数据治理平台',
        '经营管理部、数据安全部、各业务产品线', '低',
        '核心数据资产完整率不低于 98%，离线任务成功率不低于 99.5%。',
        '项目已完成验收，进入运营优化和数据资产持续治理阶段。'
    )
ON DUPLICATE KEY UPDATE
    `project_name` = VALUES(`project_name`),
    `project_status` = VALUES(`project_status`),
    `task_status` = VALUES(`task_status`),
    `department` = VALUES(`department`),
    `start_time` = VALUES(`start_time`),
    `end_time` = VALUES(`end_time`),
    `priority` = VALUES(`priority`),
    `owner` = VALUES(`owner`),
    `progress` = VALUES(`progress`),
    `man_hours` = VALUES(`man_hours`),
    `budget` = VALUES(`budget`),
    `team_size` = VALUES(`team_size`),
    `goal` = VALUES(`goal`),
    `technology` = VALUES(`technology`),
    `partner` = VALUES(`partner`),
    `risk_level` = VALUES(`risk_level`),
    `quality` = VALUES(`quality`),
    `remark` = VALUES(`remark`);

INSERT INTO `project_version` (
    `project_id`, `version`, `release_date`, `content`, `status`, `owner`
)
SELECT p.`id`, v.`version`, v.`release_date`, v.`content`, v.`status`, v.`owner`
FROM (
    SELECT 'PRJ-2024-01' AS `project_code`, 'V1.0.0' AS `version`,
           '2025-04-30' AS `release_date`,
           '上线项目文档中心与评论提醒。' AS `content`,
           '0' AS `status`, '赵敏' AS `owner`
    UNION ALL
    SELECT 'PRJ-2024-01', 'V1.1.0', '2026-01-10',
           '完成移动端适配并开放只读分享链接。', '1', '陈杰'
    UNION ALL
    SELECT 'PRJ-2024-01', 'V1.2.0', NULL,
           '增加项目风险预警看板和第三方接口联调追踪。', '2', '赵敏'
    UNION ALL
    SELECT 'PRJ-2025-02', 'V1.0.0', '2025-08-15',
           '完成支付渠道接入、统一收银台和基础对账能力。', '0', '王强'
    UNION ALL
    SELECT 'PRJ-2025-02', 'V1.1.0-beta', '2026-03-20',
           '新增退款、分账和异常订单人工复核流程。', '1', '李娜'
    UNION ALL
    SELECT 'PRJ-2025-02', 'V1.2.0', NULL,
           '规划跨境支付和多币种结算能力。', '2', '王强'
    UNION ALL
    SELECT 'PRJ-2024-03', 'V2.0.0', '2025-11-30',
           '完成数据采集、数据治理、指标服务和数据门户建设。', '0', '李娜'
) v
JOIN `project` p ON p.`project_code` = v.`project_code`
ON DUPLICATE KEY UPDATE
    `release_date` = VALUES(`release_date`),
    `content` = VALUES(`content`),
    `status` = VALUES(`status`),
    `owner` = VALUES(`owner`);

INSERT INTO `project_stage` (
    `project_id`, `stage_code`, `stage_name`, `stage_status`, `sort_order`,
    `started_at`, `completed_at`, `remark`
)
SELECT p.`id`, s.`stage_code`, s.`stage_name`, s.`stage_status`, s.`sort_order`,
       s.`started_at`, s.`completed_at`, s.`remark`
FROM (
    SELECT 'PRJ-2024-01' AS `project_code`, 'initiation' AS `stage_code`,
           '立项' AS `stage_name`, 'DOING' AS `stage_status`, 1 AS `sort_order`,
           '2023-01-19 09:00:00' AS `started_at`, NULL AS `completed_at`,
           '项目已完成立项，正在补充第三方接口清单。' AS `remark`
    UNION ALL SELECT 'PRJ-2024-01', 'review', '评审', 'NOT_STARTED', 2, NULL, NULL, NULL
    UNION ALL SELECT 'PRJ-2024-01', 'development', '开发', 'NOT_STARTED', 3, NULL, NULL, NULL
    UNION ALL SELECT 'PRJ-2024-01', 'testing', '测试', 'NOT_STARTED', 4, NULL, NULL, NULL
    UNION ALL SELECT 'PRJ-2024-01', 'release', '发布', 'NOT_STARTED', 5, NULL, NULL, NULL
    UNION ALL SELECT 'PRJ-2024-01', 'acceptance', '验收', 'NOT_STARTED', 6, NULL, NULL, NULL

    UNION ALL SELECT 'PRJ-2025-02', 'initiation', '立项', 'DONE', 1,
        '2025-02-10 09:00:00', '2025-02-18 18:00:00', '完成项目章程和范围确认。'
    UNION ALL SELECT 'PRJ-2025-02', 'review', '评审', 'DONE', 2,
        '2025-02-20 09:00:00', '2025-03-05 18:00:00', '完成支付、风控和财务方案评审。'
    UNION ALL SELECT 'PRJ-2025-02', 'development', '开发', 'DOING', 3,
        '2025-03-10 09:00:00', NULL, '正在进行渠道联调和异常订单流程开发。'
    UNION ALL SELECT 'PRJ-2025-02', 'testing', '测试', 'NOT_STARTED', 4, NULL, NULL, NULL
    UNION ALL SELECT 'PRJ-2025-02', 'release', '发布', 'NOT_STARTED', 5, NULL, NULL, NULL
    UNION ALL SELECT 'PRJ-2025-02', 'acceptance', '验收', 'NOT_STARTED', 6, NULL, NULL, NULL

    UNION ALL SELECT 'PRJ-2024-03', 'initiation', '立项', 'DONE', 1,
        '2024-03-01 09:00:00', '2024-03-08 18:00:00', '完成建设目标和数据范围确认。'
    UNION ALL SELECT 'PRJ-2024-03', 'review', '评审', 'DONE', 2,
        '2024-03-11 09:00:00', '2024-03-29 18:00:00', '完成技术架构和数据治理方案评审。'
    UNION ALL SELECT 'PRJ-2024-03', 'development', '开发', 'DONE', 3,
        '2024-04-01 09:00:00', '2025-05-30 18:00:00', '完成数据平台核心能力建设。'
    UNION ALL SELECT 'PRJ-2024-03', 'testing', '测试', 'DONE', 4,
        '2025-06-02 09:00:00', '2025-08-15 18:00:00', '完成数据质量和稳定性测试。'
    UNION ALL SELECT 'PRJ-2024-03', 'release', '发布', 'DONE', 5,
        '2025-09-01 09:00:00', '2025-10-15 18:00:00', '完成生产环境分批发布。'
    UNION ALL SELECT 'PRJ-2024-03', 'acceptance', '验收', 'DONE', 6,
        '2025-11-03 09:00:00', '2025-11-30 18:00:00', '完成项目验收并移交运营团队。'
) s
JOIN `project` p ON p.`project_code` = s.`project_code`
ON DUPLICATE KEY UPDATE
    `stage_name` = VALUES(`stage_name`),
    `stage_status` = VALUES(`stage_status`),
    `sort_order` = VALUES(`sort_order`),
    `started_at` = VALUES(`started_at`),
    `completed_at` = VALUES(`completed_at`),
    `remark` = VALUES(`remark`);

COMMIT;

# Flyway database migrations

# Flyway 数据库迁移

SpringBoot uses Flyway to manage database schema changes. Hibernate is configured with `ddl-auto=validate`, so it only validates the mapped schema and never changes the database structure.

SpringBoot 使用 Flyway 管理数据库结构变更。Hibernate 配置为 `ddl-auto=validate`，只校验实体映射与数据库结构是否匹配，不会自动修改数据库结构。

Migration files belong in `src/main/resources/db/migration` and use Flyway names such as `V2__add_column.sql`.

迁移文件位于 `src/main/resources/db/migration`，文件名遵循 Flyway 规范，例如 `V2__add_column.sql`。

Once a migration has been applied, do not edit it. Add a new versioned migration for every later schema change.

迁移一旦执行，不要再修改原文件。后续结构变更必须新增更高版本的迁移文件。

## New database

## 新数据库

Create the configured MySQL database, then start the application.

创建配置好的 MySQL 数据库，然后启动应用。

Flyway runs `V1__init_schema.sql` through the latest migration (`V3__upgrade_legacy_schema.sql`) before `DataInitializer` inserts the default permissions, menus, roles, languages, applications, and admin user.

Flyway 会先执行从 `V1__init_schema.sql` 到最新版本（当前为 `V3__upgrade_legacy_schema.sql`）的迁移，然后由 `DataInitializer` 插入默认权限、菜单、角色、语言、应用和管理员用户。

## Existing database and baseline

## 已有数据库与 baseline

Back up the database before the first deployment.

首次部署前请先备份数据库。

Do not start the application against an existing non-empty database until its schema has been verified and a Flyway history has been created.

在确认已有数据库结构并创建 Flyway 历史记录之前，不要直接使用已有的非空数据库启动应用。

First verify that the existing schema matches the expected TinyPro schema.

首先确认已有数据库结构与预期的 TinyPro schema 一致。

The baseline compatibility migrations cover the known differences between a legacy database and `V1__init_schema.sql`. They include the menu identity alignment, application-table compatibility, legacy `I18` table-name handling, timestamp normalization, and the constraints required by the `V1` schema.

baseline 兼容性迁移已经覆盖历史数据库与 `V1__init_schema.sql` 之间的已知差异，包括菜单身份唯一性、应用表兼容处理、旧版 `I18` 表名处理、时间字段规范化，以及 `V1` schema 所需的约束。

Do not baseline an arbitrary incomplete database. If required tables, columns, indexes, constraints, or data are missing or inconsistent, repair and verify the database first.

不要对任意不完整的数据库直接执行 baseline。如果应用所需的表、字段、索引、约束或数据缺失、不一致或存在重复，必须先修复并验证数据库。

If the database is valid and does not contain `flyway_schema_history`, run a one-time baseline with the Flyway CLI:

如果数据库结构有效且不存在 `flyway_schema_history`，请使用 Flyway CLI 执行一次性 baseline：

```bash
export SPRING_DATASOURCE_URL='jdbc:mysql://localhost:3306/tinypro_baseline_test?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC'
export SPRING_DATASOURCE_USERNAME='root'
export SPRING_DATASOURCE_PASSWORD='你的密码'

# Show migration status / 查看迁移状态
flyway info \
  -url="$SPRING_DATASOURCE_URL" \
  -user="$SPRING_DATASOURCE_USERNAME" \
  -password="$SPRING_DATASOURCE_PASSWORD"

# Mark the existing database as version 1 / 将已有数据库标记为 V1
flyway baseline \
  -url="$SPRING_DATASOURCE_URL" \
  -user="$SPRING_DATASOURCE_USERNAME" \
  -password="$SPRING_DATASOURCE_PASSWORD" \
  -baselineVersion=1 \
  -baselineDescription="Existing TinyPro schema"

# Apply V2 and V3 / 执行 V2 和 V3
flyway migrate \
  -url="$SPRING_DATASOURCE_URL" \
  -user="$SPRING_DATASOURCE_USERNAME" \
  -password="$SPRING_DATASOURCE_PASSWORD"

# Validate the migration history / 验证迁移历史
flyway validate \
  -url="$SPRING_DATASOURCE_URL" \
  -user="$SPRING_DATASOURCE_USERNAME" \
  -password="$SPRING_DATASOURCE_PASSWORD"
```

The baseline records the existing schema as version `1`; it does not execute `V1__init_schema.sql` again.

baseline 会将已有数据库记录为版本 `1`，不会再次执行 `V1__init_schema.sql`。

After the baseline, `flyway migrate` applies `V2` and `V3`. These migrations bring the known legacy differences into line with the current `V1` schema definition.

完成 baseline 后，`flyway migrate` 会执行 `V2` 和 `V3`，将已知的历史结构差异调整为当前 `V1` schema 定义。

## Deployment order

## 部署顺序

Keep `FLYWAY_BASELINE_ON_MIGRATE=false` during the normal CLI baseline flow.

在正常的 CLI baseline 流程中保持 `FLYWAY_BASELINE_ON_MIGRATE=false`。

1. Verify the existing schema and back up the database.

   检查已有数据库结构并完成备份。

2. Run the one-time `flyway baseline` command above.

   执行上面的 `flyway baseline` 一次性命令。

3. Run `flyway migrate` and `flyway validate`.

   执行 `flyway migrate` 和 `flyway validate`。

4. Confirm that `flyway_schema_history` contains baseline version `1` and the later migration records.

   确认 `flyway_schema_history` 中包含版本 `1` 的 baseline 记录以及后续迁移记录。

5. Start the application with the default `FLYWAY_BASELINE_ON_MIGRATE=false`.

   使用默认配置 `FLYWAY_BASELINE_ON_MIGRATE=false` 启动应用。

With Flyway enabled, application startup automatically applies pending migrations. A deployment pipeline may run migrations explicitly before application startup.

启用 Flyway 后，应用启动会自动执行待执行的迁移。部署流水线也可以在应用启动前显式执行迁移。

For a controlled first startup instead of the CLI, `FLYWAY_BASELINE_ON_MIGRATE=true` may be supplied for that deployment only, after schema verification.

如果不使用 CLI，而是需要在受控的首次启动中自动建立 baseline，可以在完成 schema 校验后，仅为该次部署临时设置 `FLYWAY_BASELINE_ON_MIGRATE=true`。

The project defaults this option to `false`; automatic baselining must not be used as the normal production setting.

项目默认值为 `false`，生产环境不应将自动 baseline 作为常规配置。

## Future migrations

## 后续迁移

Future migrations must use a new version and pass Flyway validation.

后续迁移必须使用新的版本号，并通过 Flyway 校验。

Never edit an applied migration or use `spring.jpa.hibernate.ddl-auto=update` in an environment managed by Flyway.

不要修改已经执行过的迁移文件，也不要在由 Flyway 管理的环境中使用 `spring.jpa.hibernate.ddl-auto=update`。

## Useful settings

## 常用配置

```properties
FLYWAY_ENABLED=true
FLYWAY_BASELINE_ON_MIGRATE=false
```

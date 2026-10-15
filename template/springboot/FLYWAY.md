# Flyway database migrations

SpringBoot uses Flyway for schema changes. Hibernate is configured with `ddl-auto=validate`, so it only checks the mapped schema and never changes it.

Migration files belong in `src/main/resources/db/migration` and use Flyway names such as `V2__add_column.sql`. V1 describes the legacy baseline schema; V2 applies the final schema changes introduced by this PR. Once a migration has been applied, do not edit it. Add a new versioned migration for every later schema change.

## New database

Create the configured MySQL database, then start the application. Flyway runs `V1__init_schema.sql` and `V2__apply_final_schema.sql` before `DataInitializer` inserts the default permissions, menus, roles, languages, and admin user.

## Existing database

Back up the database before the first deployment. Do not start the production application until an existing non-empty database has a Flyway history.

First verify that the existing schema matches the legacy baseline described by `V1__init_schema.sql`: the `I18` table, `user.createTime`/`updateTime`, and the legacy tables without the final unique constraints. Do not baseline a database whose schema is incomplete or incompatible; reconcile it with a reviewed migration first.

If the database is valid and does not contain `flyway_schema_history`, run a one-time baseline with the Flyway CLI:

Inject the database credentials from the deployment secret manager or protected shell environment. Flyway reads these `FLYWAY_*` variables without exposing the password as a process argument. Do not commit or print the password.

```bash
export FLYWAY_URL="$DATABASE_URL"
export FLYWAY_USER="$DATABASE_USERNAME"
export FLYWAY_PASSWORD="$DATABASE_PASSWORD"

flyway info \
  -locations=filesystem:src/main/resources/db/migration

flyway baseline \
  -locations=filesystem:src/main/resources/db/migration \
  -baselineVersion=1 \
  -baselineDescription="Existing TinyPro schema"

flyway validate \
  -locations=filesystem:src/main/resources/db/migration

unset FLYWAY_PASSWORD
```

The baseline records the existing schema as version `1`; it does not execute `V1__init_schema.sql`. Application startup then runs `V2__apply_final_schema.sql`. Future schema changes can be added as new migrations starting at `V3`.

Before the first production run, resolve duplicate permission, role, language, user, i18n, application, or menu identities. V2 intentionally fails when a unique constraint cannot be created; do not delete data automatically during migration.

After the one-time baseline, set `FLYWAY_BASELINE_ON_MIGRATE=false` and start the production application. Future migrations must be applied explicitly and must pass Flyway validation before the application starts.

For a controlled first startup instead of the CLI, `FLYWAY_BASELINE_ON_MIGRATE=true` may be supplied for that single deployment only, after schema verification. Set it back to `false` immediately after startup and never use automatic baselining as the normal production setting.

Useful settings:

```properties
FLYWAY_ENABLED=true
FLYWAY_BASELINE_ON_MIGRATE=false
```

Never use `spring.jpa.hibernate.ddl-auto=update` in an environment managed by Flyway.

# Flyway database migrations

SpringBoot uses Flyway for schema changes. Hibernate is configured with `ddl-auto=validate`, so it only checks the mapped schema and never changes it.

Migration files belong in `src/main/resources/db/migration` and use Flyway names such as `V2__add_column.sql`. Once a migration has been applied, do not edit it. Add a new versioned migration for every later schema change.

## New database

Create the configured MySQL database, then start the application. Flyway runs `V1__init_schema.sql` before `DataInitializer` inserts the default permissions, menus, roles, languages, applications, and admin user.

## Existing database

Back up the database before the first deployment. Do not start the production application until an existing non-empty database has a Flyway history.

First verify that the existing schema matches the expected TinyPro schema, including the tables and columns referenced by `V1__init_schema.sql`. Do not baseline a database whose schema is incomplete or incompatible; reconcile it with a reviewed migration first.

If the database is valid and does not contain `flyway_schema_history`, run a one-time baseline with the Flyway CLI:

```bash
flyway info \
  -url="$DATABASE_URL" \
  -user="$DATABASE_USERNAME" \
  -password="$DATABASE_PASSWORD"

flyway baseline \
  -url="$DATABASE_URL" \
  -user="$DATABASE_USERNAME" \
  -password="$DATABASE_PASSWORD" \
  -baselineVersion=1 \
  -baselineDescription="Existing TinyPro schema"

flyway validate \
  -url="$DATABASE_URL" \
  -user="$DATABASE_USERNAME" \
  -password="$DATABASE_PASSWORD"
```

The baseline records the existing schema as version `1`; it does not execute `V1__init_schema.sql`. Subsequent application startup can then apply `V2` and later migrations.

Do not set `FLYWAY_BASELINE_ON_MIGRATE=false` until the baseline command has created `flyway_schema_history` and `flyway validate` has succeeded. The production rollout order is:

1. Verify the existing schema and back up the database.
2. Run the one-time `flyway baseline` command above.
3. Run `flyway validate` and confirm that `flyway_schema_history` contains baseline version `1`.
4. Set `FLYWAY_BASELINE_ON_MIGRATE=false` and start the application.

Future migrations must be applied explicitly and must pass Flyway validation before the application starts.

For a controlled first startup instead of the CLI, `FLYWAY_BASELINE_ON_MIGRATE=true` may be supplied for that single deployment only, after schema verification. Set it back to `false` immediately after startup and never use automatic baselining as the normal production setting.

Useful settings:

```properties
FLYWAY_ENABLED=true
FLYWAY_BASELINE_ON_MIGRATE=false
```

Never use `spring.jpa.hibernate.ddl-auto=update` in an environment managed by Flyway.

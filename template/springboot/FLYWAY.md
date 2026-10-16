# Flyway database migrations

SpringBoot uses Flyway for schema changes. Hibernate is configured with `ddl-auto=validate`, so it only checks the mapped schema and never changes it.

Migration files belong in `src/main/resources/db/migration` and use Flyway names such as `V2__add_column.sql`. Once a migration has been applied, do not edit it. Add a new versioned migration for every later schema change.

## New database

Create the configured MySQL database, then start the application. Flyway runs `V1__init_schema.sql` through the latest migration (`V3__upgrade_legacy_schema.sql`) before `DataInitializer` inserts the default permissions, menus, roles, languages, applications, and admin user.

## Existing database

Back up the database before the first deployment. Do not start the application against an existing non-empty database until its schema has been verified and a Flyway history has been created.

First verify that the existing schema matches the expected TinyPro schema. The compatibility migrations cover only the documented differences; they are not a replacement for checking the schema. Do not baseline a database with arbitrary missing tables or columns; reconcile it with a reviewed migration first.

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

The baseline records the existing schema as version `1`; it does not execute `V1__init_schema.sql`. Subsequent application startup can then apply `V2` and `V3`. `V2` aligns the menu identity index, while `V3` creates the application table when needed, normalizes application timestamp columns, and handles the legacy `I18` table-name casing. These migrations do not repair an arbitrary incomplete schema.

Do not set `FLYWAY_BASELINE_ON_MIGRATE=false` until the baseline command has created `flyway_schema_history` and `flyway validate` has succeeded. The production rollout order is:

1. Verify the existing schema and back up the database.
2. Run the one-time `flyway baseline` command above.
3. Run `flyway validate` and confirm that `flyway_schema_history` contains baseline version `1`.
4. Set `FLYWAY_BASELINE_ON_MIGRATE=false` and start the application.

Future migrations must use a new version and pass Flyway validation. With Flyway enabled, the application startup automatically applies pending migrations; a deployment pipeline may run them explicitly before startup instead.

For a controlled first startup instead of the CLI, `FLYWAY_BASELINE_ON_MIGRATE=true` may be supplied for that single deployment only, after schema verification. The project defaults this option to `false`; never use automatic baselining as the normal production setting.

Useful settings:

```properties
FLYWAY_ENABLED=true
FLYWAY_BASELINE_ON_MIGRATE=false
```

Never use `spring.jpa.hibernate.ddl-auto=update` in an environment managed by Flyway.

# Flyway database migrations

SpringBoot uses Flyway for schema changes. Hibernate is configured with `ddl-auto=validate`, so it only checks the mapped schema and never changes it.

Migration files belong in `src/main/resources/db/migration` and use Flyway names such as `V2__add_column.sql`. Once a migration has been applied, do not edit it. Add a new versioned migration for every later schema change.

## New database

Create the configured MySQL database, then start the application. Flyway runs `V1__init_schema.sql` before `DataInitializer` inserts the default permissions, menus, roles, languages, applications, and admin user.

## Existing database

Back up the database before the first deployment. With the default `FLYWAY_BASELINE_ON_MIGRATE=true`, Flyway baselines a non-empty database at version `1` and does not execute the initial create-table migration. This is intended for the existing TinyPro schema.

For a production deployment, verify the existing schema first and then set `FLYWAY_BASELINE_ON_MIGRATE=false`. Future migrations must be applied explicitly and must pass Flyway validation before the application starts.

Useful settings:

```properties
FLYWAY_ENABLED=true
FLYWAY_BASELINE_ON_MIGRATE=false
```

Never use `spring.jpa.hibernate.ddl-auto=update` in an environment managed by Flyway.

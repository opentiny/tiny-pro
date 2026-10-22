# SpringBoot profile configuration

The application no longer keeps database, Redis, or JWT credentials in the common configuration.

## Local development

Start with the local profile:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

`application-local.properties` contains localhost settings and development-only fallback values. Do not use this profile in production.

## Production

Start with the production profile:

```bash
java -jar app.jar --spring.profiles.active=prod
```

Required environment variables:

```text
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
REDIS_HOST
REDIS_PASSWORD
JWT_SECRET
```

If a required production variable is missing, SpringBoot fails during startup instead of using a known credential.

The application explicitly checks these variables when the `prod` profile is active. `JWT_SECRET` is also validated against unresolved `${...}` placeholders before the JWT utility is created.

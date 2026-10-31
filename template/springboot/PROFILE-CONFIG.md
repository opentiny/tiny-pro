# SpringBoot profile configuration

The application no longer keeps database, Redis, or JWT credentials in the common configuration.

## Local development

Start with the local profile:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

`application-local.properties` contains localhost settings and development-only fallback values. 


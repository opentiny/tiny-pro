wait4x mysql "${DATABASE_USERNAME}:${DATABASE_PASSWORD}@tcp(mysql:3306)/${DATABASE_NAME}" --timeout=60s --interval=2s -- node migrate.js && node dist/main.js

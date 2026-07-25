#!/bin/bash

set -e

wait4x mysql "${DATABASE_USERNAME}:${DATABASE_PASSWORD}@tcp(${DATABASE_HOST}:${DATABASE_PORT})/${DATABASE_NAME}" --timeout=200s --interval=2s -- pnpm run seeder:run

#!/bin/sh
set -e

echo "→ Applying database migrations..."
./node_modules/.bin/prisma migrate deploy

echo "→ Seeding database (idempotent)..."
./node_modules/.bin/tsx prisma/seed.ts || echo "Seed step skipped/failed (continuing)."

echo "→ Starting server..."
exec "$@"

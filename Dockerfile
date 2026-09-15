# syntax=docker/dockerfile:1

# ---- deps: install all dependencies (incl. dev, for the build) ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# scripts/ is needed because `postinstall` runs scripts/copy-tinymce.mjs.
COPY scripts ./scripts
RUN npm ci

# ---- builder: generate Prisma client + build Next.js (standalone) ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# DATABASE_URL is needed for `prisma generate`; a dummy value is fine at build.
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
RUN npx prisma generate && npm run build

# ---- runner: minimal production image ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Standalone server output.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma schema, migrations, and seed script.
COPY --from=builder /app/prisma ./prisma
# Full dependency tree so the entrypoint can run the Prisma CLI (migrate
# deploy) and tsx (seed) at container start. The Prisma CLI pulls transitive
# deps (e.g. `effect` via @prisma/config) that a cherry-picked copy misses,
# so copy node_modules wholesale over the standalone output's minimal set.
COPY --from=builder /app/node_modules ./node_modules
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]

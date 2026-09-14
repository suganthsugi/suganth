# Portfolio

A configurable portfolio built with Next.js, Prisma, and PostgreSQL.

- Configurable **categories** (add/remove from the admin).
- **Posts** with a rich-text editor, mappable to **multiple categories**.
- **Card** and **list** listing views (toggleable).
- Listing hover images are taken from the post content itself — no cover-image
  upload.
- Email/password admin login at `/admin`.

## Quick start (development)

```bash
npm install
cp .env.example .env

npm run db:up        # Postgres in Docker
npm run db:migrate   # apply schema
npm run db:seed      # admin user + default categories

npm start            # http://localhost:3000
```

Admin: `/admin/login` — `suganthjayanthi@gmail.com` / `abcd1234` (change these
via `ADMIN_EMAIL` / `ADMIN_PASSWORD`).

## Production (Docker)

```bash
docker compose -f docker-compose.prod.yml up --build
```

Brings up Postgres and the app; database migrations and seeding run
automatically on startup. Set `AUTH_SECRET`, `ADMIN_PASSWORD`, and
`POSTGRES_PASSWORD` in your environment for a real deployment.

See [CLAUDE.md](./CLAUDE.md) for architecture details.

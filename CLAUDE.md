# CLAUDE.md

Guidance for Claude Code (and humans) working in this repository.

## What this is

A **configurable portfolio** web app: a public site plus an authenticated admin
panel for managing categories and rich-text posts.

- **Categories** (e.g. Posts, Projects) are data — add/remove them in the admin.
- **Posts** are written with a rich-text editor and can belong to **multiple
  categories** (many-to-many).
- **No cover-image field by design.** The listing hover preview is extracted
  from the **first `<img>` in the post's rich-text content** (see
  `lib/content.ts` → `extractFirstImage`).
- Each category renders its posts as either a **card grid** or a **spotlight
  list** (`Category.listStyle`) — this is an admin choice per category, set in
  admin **Categories**, not a visitor-facing toggle. The same style also
  drives that category's section on the home page.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v3 (design tokens as CSS variables in `app/globals.css`)
- Prisma ORM + PostgreSQL 16 (Docker)
- Auth.js (NextAuth v5) — credentials provider, JWT sessions
- TinyMCE rich-text editor (self-hosted from `/public/tinymce`, GPL license key)
- bcryptjs (password hashing), zod (validation)

## Commands

```bash
npm install
cp .env.example .env        # then edit AUTH_SECRET etc.

npm run db:up               # start Postgres in Docker (dev)
npm run db:migrate          # create/apply migrations
npm run db:seed             # seed admin user + default categories + site config

npm start                   # dev server (alias of `next dev`) → http://localhost:3000
```

Production (full stack in Docker; migrations + seed run automatically on boot):

```bash
docker compose -f docker-compose.prod.yml up --build
```

## Architecture / where things live

- `prisma/schema.prisma` — data model: `User`, `Category`, `Post`,
  `PostCategory` (join), `SiteConfig` (single "singleton" row).
- `prisma/seed.ts` — seeds admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD`, default
  categories, and site config. Idempotent.
- `auth.ts` / `auth.config.ts` / `middleware.ts` — Auth.js. The edge-safe
  `auth.config.ts` guards `/admin/*`; `auth.ts` holds the DB-backed Credentials
  provider. `/admin/login` is the sign-in page.
- `lib/` — `prisma.ts` (client singleton), `content.ts` (image/excerpt from
  HTML), `slug.ts`, `posts.ts` (public queries + `toListItem` mapper),
  `types.ts`.
- `app/` (public) — `page.tsx` (home), `[category]/page.tsx` (category
  listing), `posts/[slug]/page.tsx` (single post), `about/page.tsx`,
  `contact/page.tsx`.
- `app/admin/` — `layout.tsx` (shell + sign out), `page.tsx` (dashboard),
  `login/`, `categories/` (name, slug, tagline/description, list style),
  `posts/` (list, `new/`, `[id]/edit/`), `settings/`. All mutations are
  **server actions** in the respective `actions.ts` files.
- `components/` — `PostSection.tsx` (renders a category's posts as a card grid
  or spotlight list per `Category.listStyle`), `PostCard.tsx` (grid card),
  `PostHoverList.tsx` (spotlight rows with the cursor-following image
  preview), `Starfield.tsx` (ambient background + cursor spotlight),
  `ContactForm.tsx`, `ThemeToggle.tsx`, `SocialLinks.tsx`,
  `editor/RichTextEditor.tsx`.

## Admin

Default seeded credentials (change for production via env):

- Email: `suganthjayanthi@gmail.com`
- Password: `abcd1234`

Sign in at `/admin/login`; `/admin` is the dashboard.

## Conventions

- Post content is stored as **HTML** (`Post.contentHtml`) — TinyMCE output.
  Do not add a cover-image column; derive images from content.
- Editor image uploads (drag/drop, the dialog's Upload tab, paste) POST to
  `app/api/uploads/` (admin-only), which writes the file to `UPLOADS_DIR`
  (`lib/uploads.ts`; a mounted volume `/app/uploads` in prod) and returns a
  `/api/uploads/<id>` URL served by `app/api/uploads/[name]/route.ts`. The post
  HTML references that URL — images are **not** inlined. This is separate from
  the avatar, which stays a small downscaled data: URI on `SiteConfig`.
- The contact form (`components/ContactForm.tsx`) posts to the `submitContact`
  server action (`app/contact/actions.ts`): it validates (zod), drops bots via a
  honeypot, rate-limits per IP, saves a `ContactMessage` row, then delivers via
  `notifyContact` (`lib/mailer.ts`) — email through Resend to `SiteConfig.email`
  (`RESEND_API_KEY` + `CONTACT_FROM` env). Messages are always saved (visible in
  admin → **Messages**) even if email is unconfigured/fails. `notifyContact` is
  the fan-out seam for adding WhatsApp later. No more `mailto:`.
- TinyMCE is self-hosted: `scripts/copy-tinymce.mjs` vendors
  `node_modules/tinymce` → `public/tinymce` on `postinstall`/`build`. That dir is
  gitignored and regenerated; the editor loads it via `tinymceScriptSrc`.
- Category slugs and post slugs are generated via `lib/slug.ts` and are unique.
- Public pages use `export const dynamic = "force-dynamic"` so new content shows
  immediately; server actions also `revalidatePath("/", "layout")`.

## Design integration

The frontend is reskinned to the Claude Design project `Portfolio.dc.html`
(`claude.ai/design/p/86ff4831-3542-443c-b756-1fc21ee8be86`): a dark, near-black
canvas with a violet accent, an ambient plum hero glow, a cursor-tracked
starfield/spotlight background, and Petrona (serif) / Manrope (body) / Space
Grotesk (labels) type. On load the theme follows the OS `prefers-color-scheme`
(resolved before paint by an inline script in `app/layout.tsx`, defaulting to
dark); `ThemeToggle` stores an explicit override in `localStorage` that wins
over the system preference, and tracks live OS changes while no override is
stored. Tokens live in `app/globals.css` (`--bg`, `--bg2`,
`--ink`, `--ink2`, `--line`, `--accent`, `--ambient`, `--glow`, `--star`,
`--halo`) and are wired into `tailwind.config.ts`.

The design's About/Contact copy and "Currently/Tools" panel are illustrative —
real content comes from `SiteConfig` (`bio`, `aboutHtml`, `currentRole`,
`tools`, `availability`, …), editable in admin Settings, and panels hide
themselves when empty rather than showing fabricated placeholder content.

To re-sync with a newer version of the design, run `/design-login`
interactively, then read it via the `DesignSync` tool (`get_file` on
`Portfolio.dc.html` and `support.js`).

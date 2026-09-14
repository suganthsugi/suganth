// Dev-only: inserts a few published demo posts with in-content images.
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const img = (id) => `https://picsum.photos/id/${id}/1200/750`;

const demos = [
  {
    title: "Support Console",
    cat: "projects",
    excerpt:
      "A read-only operations console over eleven services, built so support could answer a question in under five minutes.",
    body: `<p>A read-only operations console over eleven services.</p><p><img src="${img(180)}" alt="console"></p><p>Built so support could answer a question in under five minutes.</p>`,
  },
  {
    title: "Double-entry Ledger",
    cat: "projects",
    excerpt:
      "An append-only ledger service handling 40M entries a month with reconciliation that runs in minutes, not hours.",
    body: `<p>An append-only ledger service handling 40M entries a month.</p><p><img src="${img(20)}" alt="ledger"></p><p>Reconciliation that runs in minutes, not hours.</p>`,
  },
  {
    title: "Idempotency keys are the cheapest reliability you will ever buy",
    cat: "posts",
    excerpt:
      "Why a boring idempotency key beats most retry frameworks, and how to roll one out without a rewrite.",
    body: `<p>Why a boring idempotency key beats most retry frameworks.</p><p><img src="${img(1043)}" alt="keys"></p><p>How to roll one out without a rewrite.</p>`,
  },
  {
    title: "The slow query was never the query",
    cat: "posts",
    excerpt:
      "A debugging story that starts at a p99 spike and ends, as they always do, at a missing index and a bad assumption.",
    body: `<p>A debugging story that starts at a p99 spike.</p><p><img src="${img(1074)}" alt="query"></p><p>It ends, as they always do, at a missing index.</p>`,
  },
];

for (const d of demos) {
  const cat = await prisma.category.findUnique({ where: { slug: d.cat } });
  if (!cat) continue;
  const slug = d.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  await prisma.post.upsert({
    where: { slug },
    update: {},
    create: {
      title: d.title,
      slug,
      excerpt: d.excerpt,
      contentHtml: d.body,
      published: true,
      categories: { create: [{ categoryId: cat.id }] },
    },
  });
  console.log("seeded:", d.title);
}
await prisma.$disconnect();

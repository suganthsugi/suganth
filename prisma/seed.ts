import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "suganthjayanthi@gmail.com";
  const password = process.env.ADMIN_PASSWORD ?? "abcd1234";
  const passwordHash = await bcrypt.hash(password, 10);

  // Admin account (idempotent: keeps password in sync with env on reseed).
  await prisma.user.upsert({
    where: { email },
    update: { password: passwordHash },
    create: { email, password: passwordHash, name: "Admin" },
  });
  console.log(`✓ Admin user ready: ${email}`);

  // Default categories.
  const categories = [
    { name: "Posts", slug: "posts", order: 0 },
    { name: "Projects", slug: "projects", order: 1 },
  ];
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  console.log(`✓ Seeded ${categories.length} categories`);

  // Single-row site config.
  await prisma.siteConfig.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      title: "My Portfolio",
      description: "I build things for the web.",
      email,
      availability: "Available for work",
    },
  });
  console.log("✓ Site config ready");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

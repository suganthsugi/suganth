import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { prisma } from "@/lib/prisma";

async function getConfig() {
  try {
    return await prisma.siteConfig.findUnique({ where: { id: "singleton" } });
  } catch {
    return null; // DB not reachable (e.g. at build time) — use defaults.
  }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({ orderBy: { order: "asc" } });
  } catch {
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return {
    title: config?.title ?? "Portfolio",
    description: config?.description ?? "A configurable portfolio.",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, categories] = await Promise.all([
    getConfig(),
    getCategories(),
  ]);

  return (
    <html lang="en">
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <header className="border-b border-border">
          <div className="mx-auto max-w-5xl px-4 h-16 flex items-center justify-between gap-6">
            <Link href="/" className="font-semibold text-lg">
              {config?.title ?? "Portfolio"}
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/${c.slug}`}
                  className="text-muted hover:text-fg transition-colors"
                >
                  {c.name}
                </Link>
              ))}
              <Link
                href="/admin"
                className="text-muted hover:text-fg transition-colors"
              >
                Admin
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-10">
          {children}
        </main>

        <footer className="border-t border-border">
          <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted">
            © {new Date().getFullYear()} {config?.title ?? "Portfolio"}
          </div>
        </footer>
      </body>
    </html>
  );
}

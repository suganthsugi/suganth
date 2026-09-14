import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import SocialLinks from "@/components/SocialLinks";
import ThemeToggle from "@/components/ThemeToggle";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans-var",
  display: "swap",
});
const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif-var",
  display: "swap",
});

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

async function getSocialLinks() {
  try {
    return await prisma.socialLink.findMany({ orderBy: { order: "asc" } });
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

// Applies the saved theme before paint to avoid a flash of the wrong palette.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}}catch(e){}})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, categories, socialLinks] = await Promise.all([
    getConfig(),
    getCategories(),
    getSocialLinks(),
  ]);

  const name = config?.title ?? "Portfolio";

  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/80 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-6 px-5">
            <Link
              href="/"
              className="flex items-center gap-2 font-serif text-xl font-medium text-fg-strong"
            >
              <span className="h-2 w-2 rounded-full bg-accent" />
              {name}
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/${c.slug}`}
                  className="hidden text-muted transition-colors hover:text-fg sm:inline"
                >
                  {c.name}
                </Link>
              ))}
              <Link
                href="/admin"
                className="hidden text-muted transition-colors hover:text-fg sm:inline"
              >
                Admin
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-12">
          {children}
        </main>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-4xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted">
              © {new Date().getFullYear()}{" "}
              {config?.ownerName || name}
              {config?.location ? ` · ${config.location}` : ""}
            </div>
            <SocialLinks links={socialLinks} email={config?.email} />
          </div>
        </footer>
      </body>
    </html>
  );
}

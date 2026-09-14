import type { Metadata } from "next";
import Link from "next/link";
import { Petrona, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import SocialLinks from "@/components/SocialLinks";
import ThemeToggle from "@/components/ThemeToggle";
import Starfield from "@/components/Starfield";

const sans = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans-var",
  display: "swap",
});
const serif = Petrona({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif-var",
  display: "swap",
});
const label = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-label-var",
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
// Default is dark — the design has no system-preference branch.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.dataset.theme='light';}}catch(e){}})();`;

const navLinkClass =
  "inline-flex min-h-11 items-center rounded-full px-[13px] py-2 font-label text-[13px] tracking-wide text-ink2 transition-colors duration-200 hover:bg-bg2 hover:text-ink";

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

  const name = config?.ownerName || config?.title || "Portfolio";
  const year = new Date().getFullYear();

  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${label.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="relative min-h-screen overflow-x-hidden font-sans antialiased">
        <Starfield />

        <div className="relative z-[1] mx-auto flex min-h-screen w-full max-w-[1080px] flex-col px-[clamp(18px,5vw,32px)]">
          <header className="reveal flex flex-wrap items-center justify-between gap-3.5 pt-[30px]">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-serif text-[22px] tracking-tight text-ink"
            >
              <span
                className="h-[7px] w-[7px] shrink-0 rounded-full bg-accent"
                style={{ boxShadow: "0 0 12px rgb(var(--accent))" }}
              />
              {name}
            </Link>
            <nav className="flex flex-wrap items-center gap-1">
              {categories.map((c) => (
                <Link key={c.id} href={`/${c.slug}`} className={navLinkClass}>
                  {c.name}
                </Link>
              ))}
              <Link href="/about" className={navLinkClass}>
                About
              </Link>
              <Link href="/contact" className={navLinkClass}>
                Contact
              </Link>
              <ThemeToggle />
            </nav>
          </header>

          <main className="w-full flex-1">{children}</main>

          <footer className="flex flex-wrap items-center justify-between gap-6 border-t border-line py-[34px] pb-[46px]">
            <p className="m-0 flex items-center gap-3.5 font-label text-[11px] tracking-wide text-ink2">
              <span>
                © {year} {config?.ownerName || name}
              </span>
              <Link
                href="/__lost"
                className="inline-flex min-h-11 items-center px-1.5 text-ink2 opacity-60 transition-opacity duration-200 hover:text-accent hover:opacity-100"
              >
                404
              </Link>
            </p>
            <SocialLinks links={socialLinks} email={config?.email} />
          </footer>
        </div>
      </body>
    </html>
  );
}

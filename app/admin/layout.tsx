import Link from "next/link";
import { auth } from "@/auth";
import { logout } from "./actions";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Unauthenticated (login page): render bare, middleware guards the rest.
  if (!session?.user) {
    return <>{children}</>;
  }

  return (
    <div className="grid gap-8 md:grid-cols-[200px_1fr]">
      <aside className="md:sticky md:top-6 md:self-start">
        <nav className="flex flex-col gap-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-muted hover:bg-fg/5 hover:text-fg"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logout} className="mt-4 px-3">
          <button
            type="submit"
            className="text-sm text-muted hover:text-red-500"
          >
            Sign out
          </button>
        </form>
        <p className="mt-4 px-3 text-xs text-muted">{session.user.email}</p>
      </aside>

      <section>{children}</section>
    </div>
  );
}

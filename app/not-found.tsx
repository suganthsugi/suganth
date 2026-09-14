import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-muted">This page could not be found.</p>
      <Link href="/" className="mt-4 inline-block text-accent">
        ← Back home
      </Link>
    </div>
  );
}

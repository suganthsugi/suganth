import { prisma } from "@/lib/prisma";
import { deleteMessage } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Messages</h1>
      <p className="mt-1 text-sm text-muted">
        Submissions from the contact form. Each is also emailed to you; the badge
        shows whether delivery was accepted.
      </p>

      <ul className="mt-6 flex flex-col gap-3">
        {messages.map((m) => (
          <li
            key={m.id}
            className="rounded-lg border border-border p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{m.name}</span>
                  <a
                    href={`mailto:${m.email}`}
                    className="truncate text-sm text-accent hover:underline"
                  >
                    {m.email}
                  </a>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      m.delivered
                        ? "bg-green-500/15 text-green-600"
                        : "bg-yellow-500/15 text-yellow-600"
                    }`}
                  >
                    {m.delivered ? "Delivered" : "Not delivered"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {m.createdAt.toLocaleString()}
                </p>
              </div>
              <form action={deleteMessage}>
                <input type="hidden" name="id" value={m.id} />
                <button type="submit" className="text-sm text-muted hover:text-red-500">
                  Delete
                </button>
              </form>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
              {m.message}
            </p>
          </li>
        ))}
        {messages.length === 0 && (
          <li className="rounded-lg border border-border px-4 py-8 text-center text-sm text-muted">
            No messages yet.
          </li>
        )}
      </ul>
    </div>
  );
}

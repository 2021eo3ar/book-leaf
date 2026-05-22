import { desc, eq } from "drizzle-orm";
import { TicketsClient } from "@/components/author/TicketsClient";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const session = await auth();
  const rows = await db.query.tickets.findMany({
    where: eq(tickets.authorId, session?.user.authorId ?? ""),
    orderBy: [desc(tickets.createdAt)],
    with: { book: true, responses: true },
  });
  const visible = rows.map((ticket) => ({
    ...ticket,
    responses: ticket.responses.filter((response) => !response.isInternalNote),
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-3xl font-bold text-slate-950 dark:text-slate-100">My Tickets</h1>
        <p className="text-slate-500 dark:text-slate-400">Track support conversations and status updates.</p>
      </div>
      <TicketsClient initialTickets={visible} />
    </div>
  );
}

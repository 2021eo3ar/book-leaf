import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { desc, eq } from "drizzle-orm";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { books, tickets } from "@/lib/db/schema";
import { rupees, shortDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const authorId = session?.user.authorId ?? "";
  const authorBooks = await db.select().from(books).where(eq(books.authorId, authorId));
  const recentTickets = await db.query.tickets.findMany({
    where: eq(tickets.authorId, authorId),
    orderBy: [desc(tickets.createdAt)],
    limit: 3,
    with: { book: true },
  });

  const totals = {
    books: authorBooks.length,
    copies: authorBooks.reduce((sum, book) => sum + book.totalCopiesSold, 0),
    earned: authorBooks.reduce((sum, book) => sum + book.totalRoyaltyEarned, 0),
    pending: authorBooks.reduce((sum, book) => sum + book.royaltyPending, 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-slate-950 dark:text-slate-100">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Your books, royalties, and recent support activity.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total books", totals.books],
          ["Copies sold", totals.copies],
          ["Royalties earned", rupees(totals.earned)],
          ["Royalties pending", rupees(totals.pending)],
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-slate-100">{value}</p>
          </Card>
        ))}
      </div>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-slate-950 dark:text-slate-100">Recent Tickets</h2>
          <Link href="/tickets" className="text-sm font-semibold text-amber-700 transition hover:text-amber-600 dark:text-amber-400">
            View All
          </Link>
        </div>
        <div className="space-y-3">
          {recentTickets.length ? (
            recentTickets.map((ticket) => (
              <Link key={ticket.id} href={`/tickets?ticket=${ticket.id}`} className="group block rounded-lg">
                <Card className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:border-amber-300 hover:shadow-md hover:shadow-amber-500/10 dark:hover:border-amber-500/60">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-950 dark:text-slate-100">{ticket.subject}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {ticket.book?.title ?? "General"} · {shortDate(ticket.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={statusTone(ticket.status)}>{ticket.status}</Badge>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition group-hover:border-amber-300 group-hover:text-amber-700 dark:border-slate-700 dark:text-slate-400 dark:group-hover:border-amber-500/60 dark:group-hover:text-amber-400">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <Card className="p-6 text-slate-500 dark:text-slate-400">No tickets yet. Submit a query when you need help.</Card>
          )}
        </div>
      </section>
    </div>
  );
}

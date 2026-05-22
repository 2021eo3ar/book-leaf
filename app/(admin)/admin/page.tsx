import { desc } from "drizzle-orm";
import { AlertTriangle, CheckCircle2, Clock3, Inbox } from "lucide-react";
import { TicketQueue } from "@/components/admin/TicketQueue";
import { Card } from "@/components/ui/Card";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const rows = await db.query.tickets.findMany({
    orderBy: [desc(tickets.createdAt)],
    with: { author: true, book: true },
  });

  const metrics = [
    { label: "Open", value: rows.filter((ticket) => ticket.status === "open").length, icon: Inbox, tone: "text-blue-600 dark:text-blue-400" },
    { label: "In progress", value: rows.filter((ticket) => ticket.status === "in_progress").length, icon: Clock3, tone: "text-amber-600 dark:text-amber-400" },
    { label: "High priority", value: rows.filter((ticket) => ticket.priority === "critical" || ticket.priority === "high").length, icon: AlertTriangle, tone: "text-red-600 dark:text-red-400" },
    { label: "Resolved", value: rows.filter((ticket) => ticket.status === "resolved" || ticket.status === "closed").length, icon: CheckCircle2, tone: "text-emerald-600 dark:text-emerald-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-950 dark:text-slate-100">Support Inbox</h1>
          <p className="text-slate-500 dark:text-slate-400">Prioritize author issues, update triage fields, and jump into responses.</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Live queue · SSE connected
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-slate-100">{metric.value}</p>
              </div>
              <metric.icon className={`h-5 w-5 ${metric.tone}`} />
            </div>
          </Card>
        ))}
      </div>
      <TicketQueue initialTickets={rows} />
    </div>
  );
}

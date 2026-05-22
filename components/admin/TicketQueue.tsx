"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, BookOpen, Loader2, Search, SlidersHorizontal, UserRound } from "lucide-react";
import { Badge, priorityTone, statusTone } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { labelize, shortDate } from "@/lib/format";

type Ticket = {
  id: string;
  subject: string;
  status: string;
  category: string | null;
  priority: string | null;
  createdAt: Date;
  author: { name: string };
  book: { title: string } | null;
};

const categories = ["", "royalty_payments", "isbn_metadata", "printing_quality", "distribution_availability", "book_status_production", "general_inquiry"];
const priorities = ["", "critical", "high", "medium", "low"];
const statuses = ["open", "in_progress", "resolved", "closed"];

function priorityStripe(priority: string | null) {
  if (priority === "critical") return "bg-red-500";
  if (priority === "high") return "bg-orange-500";
  if (priority === "medium") return "bg-blue-500";
  return "bg-slate-300 dark:bg-slate-700";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TicketQueue({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);

  const refreshTickets = useCallback(async () => {
    const data = (await fetch("/api/tickets", { cache: "no-store" }).then((res) => res.json())) as { tickets: Ticket[] };
    setTickets(data.tickets);
  }, []);

  useEffect(() => {
    const source = new EventSource("/api/sse");
    source.onmessage = () => void refreshTickets();
    return () => source.close();
  }, [refreshTickets]);

  async function updateTicket(id: string, field: "status" | "category" | "priority", value: string) {
    setUpdatingTicketId(id);
    const path = field === "status" ? `/api/tickets/${id}/status` : `/api/tickets/${id}`;
    await fetch(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value || null }),
    });
    await refreshTickets();
    setUpdatingTicketId(null);
  }

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return tickets.filter((ticket) => {
      const matchesSearch = `${ticket.author.name} ${ticket.subject} ${ticket.book?.title ?? ""}`.toLowerCase().includes(term);
      const matchesStatus = !statusFilter || ticket.status === statusFilter;
      const matchesCategory = !categoryFilter || ticket.category === categoryFilter;
      const matchesPriority = !priorityFilter || ticket.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });
  }, [tickets, search, statusFilter, categoryFilter, priorityFilter]);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-bold text-slate-950 dark:text-slate-100">All tickets</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{filtered.length} visible · {tickets.length} total</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 dark:bg-slate-950 dark:text-slate-400">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </div>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" placeholder="Search author, subject, or book" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All statuses</option>
            {statuses.map((item) => <option key={item} value={item}>{labelize(item)}</option>)}
          </Select>
          <Select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            {categories.map((item) => <option key={item || "all"} value={item}>{item ? labelize(item) : "All categories"}</option>)}
          </Select>
          <Select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
            {priorities.map((item) => <option key={item || "all"} value={item}>{item ? labelize(item) : "All priorities"}</option>)}
          </Select>
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {filtered.map((ticket) => (
          <article
            key={ticket.id}
            className="group relative grid gap-4 p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/60 xl:grid-cols-[1fr_360px]"
          >
            <span className={`absolute inset-y-4 left-0 w-1 rounded-r ${priorityStripe(ticket.priority)}`} />
            <div className="min-w-0 pl-3">
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {initials(ticket.author.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/tickets/${ticket.id}`} className="truncate font-semibold text-slate-950 transition hover:text-amber-700 dark:text-slate-100 dark:hover:text-amber-400">
                      {ticket.subject}
                    </Link>
                    {updatingTicketId === ticket.id ? <Loader2 className="h-4 w-4 animate-spin text-amber-600" /> : null}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1"><UserRound className="h-3.5 w-3.5" />{ticket.author.name}</span>
                    <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{ticket.book?.title ?? "General"}</span>
                    <span>{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
                    <span>{shortDate(ticket.createdAt)}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone={statusTone(ticket.status)}>{ticket.status}</Badge>
                    <Badge tone={priorityTone(ticket.priority)}>{ticket.priority}</Badge>
                    {ticket.category ? <Badge>{ticket.category}</Badge> : <Badge>Unassigned</Badge>}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950 md:grid-cols-3 xl:grid-cols-1">
              <Select value={ticket.category ?? ""} disabled={updatingTicketId === ticket.id} onChange={(event) => updateTicket(ticket.id, "category", event.target.value)}>
                {categories.map((item) => <option key={item || "none"} value={item}>{item ? labelize(item) : "Category"}</option>)}
              </Select>
              <Select value={ticket.priority ?? ""} disabled={updatingTicketId === ticket.id} onChange={(event) => updateTicket(ticket.id, "priority", event.target.value)}>
                {priorities.map((item) => <option key={item || "none"} value={item}>{item ? labelize(item) : "Priority"}</option>)}
              </Select>
              <div className="flex gap-2">
                <Select value={ticket.status} disabled={updatingTicketId === ticket.id} onChange={(event) => updateTicket(ticket.id, "status", event.target.value)}>
                  {statuses.map((item) => <option key={item} value={item}>{labelize(item)}</option>)}
                </Select>
                <Link
                  href={`/admin/tickets/${ticket.id}`}
                  className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1 rounded-md bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
                >
                  Open
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            {updatingTicketId === ticket.id ? (
              <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <div className="h-full w-1/3 animate-pulse bg-amber-400" />
              </div>
            ) : null}
          </article>
        ))}
        {!filtered.length ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">No tickets match the current filters.</div>
        ) : null}
      </div>
    </div>
  );
}

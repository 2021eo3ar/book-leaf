"use client";

import { useState } from "react";
import { Bot, Loader2, MessageSquareText, UserRound } from "lucide-react";
import { Badge, priorityTone, statusTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { labelize, rupees, shortDate } from "@/lib/format";

type Detail = {
  id: string;
  subject: string;
  description: string;
  status: string;
  category: string | null;
  priority: string | null;
  assignedTo: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: { name: string; email: string; city: string };
  book: {
    title: string;
    status: string;
    totalRoyaltyEarned: number;
    royaltyPaid: number;
    royaltyPending: number;
  } | null;
  responses: {
    id: string;
    author: string;
    content: string;
    isInternalNote: boolean;
    createdAt: Date;
  }[];
};

const categories = ["", "royalty_payments", "isbn_metadata", "printing_quality", "distribution_availability", "book_status_production", "general_inquiry"];
const priorities = ["", "critical", "high", "medium", "low"];
const statuses = ["open", "in_progress", "resolved", "closed"];

export function TicketDetail({ initialTicket, userId }: { initialTicket: Detail; userId: string }) {
  const [ticket, setTicket] = useState(initialTicket);
  const [draft, setDraft] = useState("");
  const [manual, setManual] = useState("");
  const [internal, setInternal] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [updatingField, setUpdatingField] = useState<string | null>(null);
  const [sendingResponse, setSendingResponse] = useState(false);
  const [message, setMessage] = useState("");

  async function refresh() {
    const data = (await fetch(`/api/tickets/${ticket.id}`, { cache: "no-store" }).then((res) => res.json())) as { ticket: Detail };
    setTicket(data.ticket);
  }

  async function update(field: "status" | "category" | "priority" | "assignedTo", value: string | null) {
    setUpdatingField(field);
    const path = field === "status" ? `/api/tickets/${ticket.id}/status` : `/api/tickets/${ticket.id}`;
    await fetch(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    await refresh();
    setUpdatingField(null);
  }

  async function generateDraft() {
    setLoadingDraft(true);
    setMessage("");
    const response = await fetch("/api/ai/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId: ticket.id }),
    });
    const data = (await response.json()) as { draft: string | null };
    setDraft(data.draft ?? "");
    setMessage(data.draft ? "" : "AI draft unavailable. Please write a response manually.");
    setLoadingDraft(false);
  }

  async function send(content: string, isInternalNote: boolean) {
    if (!content.trim()) return;
    setSendingResponse(true);
    await fetch(`/api/tickets/${ticket.id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, isInternalNote }),
    });
    setManual("");
    setDraft("");
    await refresh();
    setSendingResponse(false);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[400px_1fr]">
      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge tone={statusTone(ticket.status)}>{ticket.status}</Badge>
            <Badge tone={priorityTone(ticket.priority)}>{ticket.priority}</Badge>
            <Badge>{ticket.category}</Badge>
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-950 dark:text-slate-100">{ticket.subject}</h1>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{ticket.description}</p>
        </div>

        <div className="space-y-4 p-5">
          <section className="rounded-md bg-slate-50 p-4 text-sm dark:bg-slate-950">
            <h2 className="mb-2 inline-flex items-center gap-2 font-semibold">
              <UserRound className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Author
            </h2>
            <p className="font-semibold text-slate-950 dark:text-slate-100">{ticket.author.name}</p>
            <p className="text-slate-500 dark:text-slate-400">{ticket.author.email} · {ticket.author.city}</p>
          </section>

          <section className="rounded-md bg-slate-50 p-4 text-sm dark:bg-slate-950">
            <h2 className="mb-2 font-semibold">Book context</h2>
            {ticket.book ? (
              <>
                <p className="font-semibold text-slate-950 dark:text-slate-100">{ticket.book.title}</p>
                <p className="text-slate-500 dark:text-slate-400">{ticket.book.status}</p>
                <p className="mt-2 text-slate-700 dark:text-slate-300">
                  Earned {rupees(ticket.book.totalRoyaltyEarned)} · Paid {rupees(ticket.book.royaltyPaid)} · Pending {rupees(ticket.book.royaltyPending)}
                </p>
              </>
            ) : (
              <p>General account-level query</p>
            )}
          </section>

          <section className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
            <h2 className="mb-3 font-semibold text-slate-950 dark:text-slate-100">Triage</h2>
            <div className="grid gap-3">
              <label className="text-sm font-medium">
                Category
                <Select value={ticket.category ?? ""} disabled={Boolean(updatingField)} onChange={(event) => update("category", event.target.value || null)}>
                  {categories.map((item) => <option key={item || "none"} value={item}>{item ? labelize(item) : "Unassigned"}</option>)}
                </Select>
              </label>
              <label className="text-sm font-medium">
                Priority
                <Select value={ticket.priority ?? ""} disabled={Boolean(updatingField)} onChange={(event) => update("priority", event.target.value || null)}>
                  {priorities.map((item) => <option key={item || "none"} value={item}>{item ? labelize(item) : "Unassigned"}</option>)}
                </Select>
              </label>
              <label className="text-sm font-medium">
                Status
                <Select value={ticket.status} disabled={Boolean(updatingField)} onChange={(event) => update("status", event.target.value)}>
                  {statuses.map((item) => <option key={item} value={item}>{labelize(item)}</option>)}
                </Select>
              </label>
              <Button variant="secondary" disabled={Boolean(updatingField)} onClick={() => update("assignedTo", userId)}>
                {updatingField === "assignedTo" ? "Assigning..." : "Assign to self"}
              </Button>
            </div>
            {updatingField ? (
              <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving {labelize(updatingField)}
              </p>
            ) : null}
          </section>

          <p className="text-xs text-slate-500 dark:text-slate-400">Created {shortDate(ticket.createdAt)} · Updated {shortDate(ticket.updatedAt)}</p>
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="p-5">
          <h2 className="inline-flex items-center gap-2 font-serif text-xl font-bold text-slate-950 dark:text-slate-100">
            <MessageSquareText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Conversation
          </h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-md bg-amber-50 p-3 text-sm dark:bg-amber-500/10 dark:text-amber-100">{ticket.description}</div>
            {ticket.responses.map((response) => (
              <div key={response.id} className={`rounded-md p-3 text-sm ${response.isInternalNote ? "bg-yellow-100 dark:bg-yellow-500/15" : response.author === "admin" ? "bg-slate-100 dark:bg-slate-800" : "bg-white ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800"}`}>
                <p className="mb-1 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{response.isInternalNote ? "Internal note" : response.author} · {shortDate(response.createdAt)}</p>
                <p className="whitespace-pre-wrap">{response.content}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 font-serif text-xl font-bold text-slate-950 dark:text-slate-100">
              <Bot className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              AI Draft
            </h2>
            <Button variant="secondary" onClick={generateDraft} disabled={loadingDraft}>
              {loadingDraft ? (
                <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Generating...</span>
              ) : "Generate AI Draft"}
            </Button>
          </div>
          {message ? <p className="mt-3 text-sm font-semibold text-red-600 dark:text-red-400">{message}</p> : null}
          {draft ? (
            <div className="mt-4 space-y-3">
              <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} />
              <div className="flex gap-2">
                <Button onClick={() => send(draft, false)} disabled={sendingResponse}>{sendingResponse ? "Sending..." : "Send as Response"}</Button>
                <Button variant="secondary" onClick={() => setDraft("")}>Discard</Button>
              </div>
            </div>
          ) : null}
        </Card>

        <Card className="p-5">
          <h2 className="font-serif text-xl font-bold text-slate-950 dark:text-slate-100">Manual Response</h2>
          <div className="mt-4 space-y-3">
            <Textarea value={manual} onChange={(event) => setManual(event.target.value)} />
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input type="checkbox" checked={internal} onChange={(event) => setInternal(event.target.checked)} /> Internal Note
            </label>
            <Button onClick={() => send(manual, internal)} disabled={sendingResponse}>{sendingResponse ? "Sending..." : "Send Response"}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

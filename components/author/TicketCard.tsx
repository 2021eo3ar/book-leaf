"use client";

import { FormEvent, useEffect, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { Badge, priorityTone, statusTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { shortDate } from "@/lib/format";

type TicketCardProps = {
  ticket: {
    id: string;
    subject: string;
    description: string;
    status: string;
    category: string | null;
    priority: string | null;
    createdAt: Date;
    book: { title: string } | null;
    responses: { id: string; author: string; content: string; createdAt: Date }[];
  };
  defaultOpen?: boolean;
  forceOpen?: boolean;
  highlight?: boolean;
  onReplySent?: () => Promise<void> | void;
};

export function TicketCard({ ticket, defaultOpen = false, forceOpen = false, highlight = false, onReplySent }: TicketCardProps) {
  const [open, setOpen] = useState(defaultOpen || forceOpen);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const isClosed = ticket.status === "closed";

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
    }
  }, [forceOpen]);

  async function submitReply(event: FormEvent) {
    event.preventDefault();
    const content = reply.trim();
    if (!content) return;

    setSending(true);
    setError("");
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, isInternalNote: false }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Unable to send reply");
        return;
      }

      setReply("");
      await onReplySent?.();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card
      className={`group p-0 transition hover:border-amber-300 hover:shadow-md hover:shadow-amber-500/10 dark:hover:border-amber-500/60 ${
        highlight ? "border-amber-400 shadow-md shadow-amber-500/15 dark:border-amber-500/70" : ""
      }`}
      id={`ticket-${ticket.id}`}
    >
      <details open={open} onToggle={(event) => setOpen(event.currentTarget.open)} className="group/details">
        <summary className="grid cursor-pointer list-none gap-3 rounded-lg p-5 transition hover:bg-slate-50 dark:hover:bg-slate-800/60 sm:grid-cols-[1fr_auto]">
          <div className="min-w-0">
            <h2 className="font-serif text-lg font-bold text-slate-950 dark:text-slate-100">{ticket.subject}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {ticket.book?.title ?? "General"} · {shortDate(ticket.createdAt)}
            </p>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 transition group-open/details:text-slate-500 dark:text-amber-400 dark:group-open/details:text-slate-400">
              <span className="group-open/details:hidden">Open details</span>
              <span className="hidden group-open/details:inline">Hide details</span>
              <ChevronDown className="h-4 w-4 transition group-open/details:rotate-180" />
            </div>
          </div>
          <div className="flex flex-wrap items-start gap-2 sm:justify-end">
            <Badge tone={statusTone(ticket.status)}>{ticket.status}</Badge>
            {ticket.category ? <Badge>{ticket.category}</Badge> : null}
            {ticket.priority ? <Badge tone={priorityTone(ticket.priority)}>{ticket.priority}</Badge> : null}
          </div>
        </summary>
        <div className="space-y-4 border-t border-slate-200 p-5 pt-4 dark:border-slate-800">
          <div className="rounded-md bg-amber-50 p-3 text-sm text-slate-800 dark:bg-amber-500/10 dark:text-amber-100">
            {ticket.description}
          </div>
          {ticket.responses.map((response) => (
            <div
              key={response.id}
              className={`rounded-md p-3 text-sm ${
                response.author === "admin"
                  ? "bg-slate-100 dark:bg-slate-800"
                  : "bg-white ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800"
              }`}
            >
              <p className="mb-1 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                {response.author === "admin" ? "BookLeaf Support" : "You"} · {shortDate(response.createdAt)}
              </p>
              <p className="whitespace-pre-wrap">{response.content}</p>
            </div>
          ))}

          {isClosed ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              This ticket is closed. Submit a new query if you need more help.
            </div>
          ) : (
            <form onSubmit={submitReply} className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Reply to BookLeaf support
                <Textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder={ticket.status === "resolved" ? "Replying will reopen this ticket for support follow-up." : "Write your reply..."}
                  className="mt-2 min-h-24"
                />
              </label>
              {error ? <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p> : null}
              <Button disabled={sending || !reply.trim()}>
                {sending ? (
                  <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Sending...</span>
                ) : "Send Reply"}
              </Button>
            </form>
          )}
        </div>
      </details>
    </Card>
  );
}

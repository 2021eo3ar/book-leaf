"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TicketCard } from "@/components/author/TicketCard";

type Ticket = React.ComponentProps<typeof TicketCard>["ticket"];
type TicketEvent = {
  type: "connected" | "heartbeat" | "new_ticket" | "new_response" | "status_changed" | "ticket_updated";
  ticketId?: string;
};

export function TicketsClient({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [updatedTicketId, setUpdatedTicketId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const selectedTicketId = searchParams.get("ticket");
  const created = searchParams.get("created") === "1";

  const refreshTickets = useCallback(async (ticketId?: string) => {
    try {
      const response = await fetch("/api/tickets", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { tickets: Ticket[] };
      setTickets(data.tickets);
      if (ticketId) {
        setUpdatedTicketId(ticketId);
      }
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    const source = new EventSource("/api/sse");
    source.onmessage = (event) => {
      let payload: TicketEvent;
      try {
        payload = JSON.parse(event.data) as TicketEvent;
      } catch {
        return;
      }
      if (payload.type === "heartbeat" || payload.type === "connected") {
        return;
      }
      void refreshTickets(payload.ticketId);
    };

    // Fallback for dev HMR/serverless route isolation where in-memory SSE clients can be missed.
    const fallback = setInterval(() => void refreshTickets(), 10000);
    return () => {
      source.close();
      clearInterval(fallback);
    };
  }, [refreshTickets]);

  useEffect(() => {
    const ticketId = updatedTicketId ?? selectedTicketId;
    if (!ticketId) return;
    document.getElementById(`ticket-${ticketId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [selectedTicketId, updatedTicketId]);

  useEffect(() => {
    if (!updatedTicketId) return;
    const timeout = setTimeout(() => setUpdatedTicketId(null), 6000);
    return () => clearTimeout(timeout);
  }, [updatedTicketId]);

  if (!tickets.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
        <h2 className="font-serif text-2xl font-bold text-slate-950 dark:text-slate-100">No tickets yet</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Submit a query and BookLeaf support will respond here.</p>
        <Link href="/tickets/new" className="mt-5 inline-flex">
          <Button>Submit a Query</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {created ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          Query submitted successfully. BookLeaf support can now review it.
        </div>
      ) : null}
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          defaultOpen={ticket.id === selectedTicketId}
          forceOpen={ticket.id === updatedTicketId}
          highlight={ticket.id === updatedTicketId}
          onReplySent={refreshTickets}
        />
      ))}
    </div>
  );
}

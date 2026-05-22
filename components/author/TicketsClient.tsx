"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TicketCard } from "@/components/author/TicketCard";

type Ticket = React.ComponentProps<typeof TicketCard>["ticket"];

export function TicketsClient({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState(initialTickets);
  const searchParams = useSearchParams();
  const selectedTicketId = searchParams.get("ticket");
  const created = searchParams.get("created") === "1";

  async function refreshTickets() {
    const data = (await fetch("/api/tickets", { cache: "no-store" }).then((res) => res.json())) as { tickets: Ticket[] };
    setTickets(data.tickets);
  }

  useEffect(() => {
    const source = new EventSource("/api/sse");
    source.onmessage = () => void refreshTickets();
    return () => source.close();
  }, []);

  useEffect(() => {
    if (!selectedTicketId) return;
    document.getElementById(`ticket-${selectedTicketId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [selectedTicketId]);

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
        <TicketCard key={ticket.id} ticket={ticket} defaultOpen={ticket.id === selectedTicketId} onReplySent={refreshTickets} />
      ))}
    </div>
  );
}

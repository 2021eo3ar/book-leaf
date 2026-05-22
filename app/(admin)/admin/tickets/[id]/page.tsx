import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { TicketDetail } from "@/components/admin/TicketDetail";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminTicketDetailPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;
  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, id),
    with: { author: true, book: true, responses: true },
  });
  if (!ticket) notFound();

  return <TicketDetail initialTicket={ticket} userId={session?.user.userId ?? ""} />;
}

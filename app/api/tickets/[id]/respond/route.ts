import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { badRequest, forbidden, isUuid, requireSession, serverError } from "@/lib/api";
import { db } from "@/lib/db";
import { ticketResponses, tickets } from "@/lib/db/schema";
import { emitToAdmins, emitToAuthor } from "@/lib/sse";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { session, response } = await requireSession();
  if (response) return response;
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  const body = (await request.json().catch(() => null)) as {
    content?: string;
    isInternalNote?: boolean;
  } | null;
  const content = body?.content?.trim() ?? "";
  if (!content) return badRequest("Response content is required");

  try {
    const ticket = await db.query.tickets.findFirst({ where: eq(tickets.id, id) });
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    if (session.user.role === "author" && ticket.authorId !== session.user.authorId) {
      return forbidden();
    }

    const isInternalNote = session.user.role === "admin" ? Boolean(body?.isInternalNote) : false;
    if (session.user.role === "author" && body?.isInternalNote) {
      return forbidden("Authors cannot create internal notes");
    }
    if (session.user.role === "author" && ticket.status === "closed") {
      return forbidden("This ticket is closed. Please submit a new query if you need more help.");
    }
    if (session.user.role === "admin" && ticket.status === "closed" && !isInternalNote) {
      return forbidden("This ticket is closed. Reopen it before sending a public response.");
    }

    const [responseRow] = await db
      .insert(ticketResponses)
      .values({
        ticketId: id,
        author: session.user.role,
        content,
        isInternalNote,
      })
      .returning();

    await db
      .update(tickets)
      .set({
        status: session.user.role === "author" && ticket.status === "resolved" ? "in_progress" : ticket.status,
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, id));

    emitToAuthor(ticket.authorId, { type: "new_response", ticketId: id });
    emitToAdmins({ type: "ticket_updated", ticketId: id });
    return NextResponse.json({ response: responseRow }, { status: 201 });
  } catch (error) {
    return serverError(error, "Unable to add response");
  }
}

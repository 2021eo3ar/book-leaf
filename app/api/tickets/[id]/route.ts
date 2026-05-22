import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { badRequest, forbidden, isUuid, requireSession, serverError } from "@/lib/api";
import { db } from "@/lib/db";
import { ticketCategoryEnum, ticketPriorityEnum, tickets } from "@/lib/db/schema";
import { emitToAdmins, emitToAuthor } from "@/lib/sse";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { session, response } = await requireSession();
  if (response) return response;
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  try {
    const ticket = await db.query.tickets.findFirst({
      where: eq(tickets.id, id),
      with: { author: true, book: true, responses: true },
    });
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    if (session.user.role === "author" && ticket.authorId !== session.user.authorId) {
      return forbidden();
    }

    return NextResponse.json({
      ticket:
        session.user.role === "author"
          ? {
              ...ticket,
              responses: ticket.responses.filter((item) => !item.isInternalNote),
            }
          : ticket,
    });
  } catch (error) {
    return serverError(error, "Unable to fetch ticket");
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { session, response } = await requireSession();
  if (response) return response;
  if (session.user.role !== "admin") return forbidden("Only admins can update ticket fields");
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  const body = (await request.json().catch(() => null)) as {
    category?: string | null;
    priority?: string | null;
    assignedTo?: string | null;
  } | null;

  if (!body) return badRequest("Invalid request body");
  if (body.category && !ticketCategoryEnum.enumValues.includes(body.category as never)) {
    return badRequest("Invalid category");
  }
  if (body.priority && !ticketPriorityEnum.enumValues.includes(body.priority as never)) {
    return badRequest("Invalid priority");
  }

  try {
    const [ticket] = await db
      .update(tickets)
      .set({
        category: (body.category || null) as never,
        priority: (body.priority || null) as never,
        assignedTo: body.assignedTo ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, id))
      .returning();
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    emitToAuthor(ticket.authorId, { type: "ticket_updated", ticketId: id });
    emitToAdmins({ type: "ticket_updated", ticketId: id });
    return NextResponse.json({ ticket });
  } catch (error) {
    return serverError(error, "Unable to update ticket");
  }
}

import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { badRequest, forbidden, isUuid, requireSession, serverError } from "@/lib/api";
import { db } from "@/lib/db";
import { tickets, ticketStatusEnum } from "@/lib/db/schema";
import { emitToAdmins, emitToAuthor } from "@/lib/sse";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { session, response } = await requireSession();
  if (response) return response;
  if (session.user.role !== "admin") return forbidden("Only admins can update status");

  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  const body = (await request.json().catch(() => null)) as { status?: string } | null;
  if (!body?.status || !ticketStatusEnum.enumValues.includes(body.status as never)) {
    return badRequest("Invalid status");
  }

  try {
    const [ticket] = await db
      .update(tickets)
      .set({ status: body.status as never, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    emitToAuthor(ticket.authorId, { type: "status_changed", ticketId: id });
    emitToAdmins({ type: "ticket_updated", ticketId: id });
    return NextResponse.json({ ticket });
  } catch (error) {
    return serverError(error, "Unable to update status");
  }
}

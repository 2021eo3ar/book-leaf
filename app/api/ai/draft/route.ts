import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { badRequest, forbidden, requireSession, serverError } from "@/lib/api";
import { db } from "@/lib/db";
import { books, tickets } from "@/lib/db/schema";
import { draftResponse } from "@/lib/groq";

export async function POST(request: NextRequest) {
  const { session, response } = await requireSession();
  if (response) return response;
  if (session.user.role !== "admin") return forbidden("Only admins can generate drafts");

  const body = (await request.json().catch(() => null)) as { ticketId?: string } | null;
  if (!body?.ticketId) return badRequest("ticketId is required");

  try {
    const ticket = await db.query.tickets.findFirst({
      where: eq(tickets.id, body.ticketId),
      with: { author: true, responses: true },
    });
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    const book = ticket.bookId
      ? ((await db.query.books.findFirst({ where: eq(books.id, ticket.bookId) })) ?? null)
      : null;
    const draft = await draftResponse(ticket, ticket.author, book, ticket.responses);
    return NextResponse.json({ draft });
  } catch (error) {
    return serverError(error, "Unable to generate AI draft");
  }
}

import { and, desc, eq, SQL } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { badRequest, forbidden, requireSession, serverError } from "@/lib/api";
import { db } from "@/lib/db";
import {
  ticketCategoryEnum,
  ticketPriorityEnum,
  tickets,
  ticketStatusEnum,
} from "@/lib/db/schema";
import { classifyTicket } from "@/lib/groq";
import { emitToAdmins } from "@/lib/sse";

export async function GET(request: NextRequest) {
  const { session, response } = await requireSession();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const filters: SQL[] = [];

  if (session.user.role === "author") {
    filters.push(eq(tickets.authorId, session.user.authorId ?? ""));
  }

  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const priority = searchParams.get("priority");

  if (status && ticketStatusEnum.enumValues.includes(status as never)) {
    filters.push(eq(tickets.status, status as never));
  }
  if (category && ticketCategoryEnum.enumValues.includes(category as never)) {
    filters.push(eq(tickets.category, category as never));
  }
  if (priority && ticketPriorityEnum.enumValues.includes(priority as never)) {
    filters.push(eq(tickets.priority, priority as never));
  }

  try {
    const rows = await db.query.tickets.findMany({
      where: filters.length ? and(...filters) : undefined,
      with: { author: true, book: true, responses: true },
      orderBy: [desc(tickets.createdAt)],
    });

    const visibleRows =
      session.user.role === "author"
        ? rows.map((ticket) => ({
            ...ticket,
            responses: ticket.responses.filter((item) => !item.isInternalNote),
          }))
        : rows;

    return NextResponse.json({ tickets: visibleRows });
  } catch (error) {
    return serverError(error, "Unable to fetch tickets");
  }
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireSession();
  if (response) return response;
  if (session.user.role !== "author" || !session.user.authorId) {
    return forbidden("Only authors can create tickets");
  }

  const body = (await request.json().catch(() => null)) as {
    bookId?: string | null;
    subject?: string;
    description?: string;
  } | null;

  const subject = body?.subject?.trim() ?? "";
  const description = body?.description?.trim() ?? "";

  if (!subject || subject.length > 100) {
    return badRequest("Subject is required and must be 100 characters or fewer");
  }
  if (description.length < 20) {
    return badRequest("Description must be at least 20 characters");
  }

  try {
    const [ticket] = await db
      .insert(tickets)
      .values({
        authorId: session.user.authorId,
        bookId: body?.bookId || null,
        subject,
        description,
      })
      .returning();

    void classifyTicket(subject, description).then(async (classification) => {
      if (!classification) return;
      await db
        .update(tickets)
        .set({
          category: classification.category,
          priority: classification.priority,
          aiCategorySuggestion: classification.category,
          aiPrioritySuggestion: classification.priority,
          updatedAt: new Date(),
        })
        .where(eq(tickets.id, ticket.id));
      emitToAdmins({ type: "ticket_updated", ticketId: ticket.id });
    });

    emitToAdmins({ type: "new_ticket", ticketId: ticket.id });
    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    return serverError(error, "Unable to create ticket");
  }
}

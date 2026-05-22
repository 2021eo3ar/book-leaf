import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireSession, serverError } from "@/lib/api";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";

export async function GET() {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const rows =
      session.user.role === "author"
        ? await db.select().from(books).where(eq(books.authorId, session.user.authorId ?? ""))
        : await db.select().from(books);
    return NextResponse.json({ books: rows });
  } catch (error) {
    return serverError(error, "Unable to fetch books");
  }
}

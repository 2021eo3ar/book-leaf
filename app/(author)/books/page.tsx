import { eq } from "drizzle-orm";
import { BookCard } from "@/components/author/BookCard";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function BooksPage() {
  const session = await auth();
  const rows = await db.select().from(books).where(eq(books.authorId, session?.user.authorId ?? ""));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-3xl font-bold text-slate-950 dark:text-slate-100">My Books</h1>
        <p className="text-slate-500 dark:text-slate-400">Publication status, listings, sales, and royalty details.</p>
      </div>
      <div className="space-y-4">{rows.map((book) => <BookCard key={book.id} book={book} />)}</div>
    </div>
  );
}

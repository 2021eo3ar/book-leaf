import { eq } from "drizzle-orm";
import { NewTicketForm } from "@/components/author/NewTicketForm";
import { Card } from "@/components/ui/Card";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function NewTicketPage() {
  const session = await auth();
  const rows = await db.select().from(books).where(eq(books.authorId, session?.user.authorId ?? ""));
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-3xl font-bold text-slate-950 dark:text-slate-100">Submit a Query</h1>
        <p className="text-slate-500 dark:text-slate-400">Tell BookLeaf support what you need help with.</p>
      </div>
      <Card className="p-6">
        <NewTicketForm books={rows.map((book) => ({ id: book.id, title: book.title }))} />
      </Card>
    </div>
  );
}

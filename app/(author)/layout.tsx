import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { AuthorNav } from "@/components/author/AuthorNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { authors } from "@/lib/db/schema";
import { initials } from "@/lib/format";

export default async function AuthorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user.authorId) redirect("/login");
  const [author] = await db.select().from(authors).where(eq(authors.id, session.user.authorId));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100 md:grid md:grid-cols-[272px_1fr]">
      <aside className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 md:h-screen md:border-b-0 md:border-r">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-amber-500 font-bold text-slate-950 shadow-sm shadow-amber-500/30">
            {initials(author?.name ?? "AU")}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-950 dark:text-slate-100">{author?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Author Portal</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
        <AuthorNav />
      </aside>
      <main className="min-w-0 p-4 md:p-8">{children}</main>
    </div>
  );
}

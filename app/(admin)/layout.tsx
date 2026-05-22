import { BookOpen } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-100 md:grid md:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 z-10 border-b border-slate-800 bg-[#0f1629] p-4 text-white md:h-screen md:border-b-0 md:border-r">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30">
            <BookOpen className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-bold">BookLeaf</p>
            <p className="text-xs text-slate-300">Admin</p>
          </div>
          </div>
          <div className="[&_button]:border-slate-700 [&_button]:bg-slate-900 [&_button]:text-slate-200 [&_button:hover]:bg-slate-800">
            <ThemeToggle />
          </div>
        </div>
        <AdminNav />
      </aside>
      <main className="min-w-0 p-4 md:p-8">{children}</main>
    </div>
  );
}

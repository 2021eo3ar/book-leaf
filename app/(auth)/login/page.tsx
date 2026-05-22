import { BookOpen } from "lucide-react";
import { LoginForm } from "@/components/LoginForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card } from "@/components/ui/Card";

const credentials = [
  ["Admin", "admin@bookleaf.com", "admin123"],
  ["Author", "priya.sharma@email.com", "author123"],
  ["Author", "rohit.kapoor@email.com", "author123"],
  ["Author", "sneha.kulkarni@email.com", "author123"],
  ["Author", "diya.chatterjee@email.com", "author123"],
];

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 dark:bg-slate-950 dark:text-slate-100 md:py-10">
      <div className="mx-auto flex max-w-5xl justify-end">
        <ThemeToggle />
      </div>
      <div className="mx-auto grid max-w-5xl gap-8 pt-6 md:grid-cols-[1fr_420px]">
        <section className="flex flex-col justify-center">
          <div className="mb-5 flex items-center gap-3 text-slate-950 dark:text-slate-100">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30">
              <BookOpen className="h-6 w-6" />
            </span>
            <span className="text-xl font-bold">BookLeaf Publishing</span>
          </div>
          <h1 className="max-w-2xl font-serif text-4xl font-bold text-slate-950 dark:text-slate-100 md:text-5xl">
            Author Support & Communication Portal
          </h1>
          <p className="mt-4 max-w-xl text-slate-600 dark:text-slate-400">
            Manage author queries, book status, royalties, AI-assisted triage, and support responses in one place.
          </p>
        </section>
        <Card className="p-6">
          <h2 className="font-serif text-2xl font-bold text-slate-950 dark:text-slate-100">Sign in</h2>
          <p className="mb-5 mt-1 text-sm text-slate-500 dark:text-slate-400">Use an author or admin account.</p>
          <LoginForm />
          <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Test Credentials</h3>
            <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              {credentials.map(([role, email, password]) => (
                <div key={email} className="grid grid-cols-[60px_1fr_72px] gap-2">
                  <span>{role}</span>
                  <span className="truncate">{email}</span>
                  <span>{password}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}

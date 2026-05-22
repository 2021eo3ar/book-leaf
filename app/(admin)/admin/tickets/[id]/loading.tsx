export default function AdminTicketLoading() {
  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="h-8 w-72 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
        <div className="mt-3 h-20 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
        <div className="mt-5 space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="h-7 w-44 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
            <div className="mt-4 h-32 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

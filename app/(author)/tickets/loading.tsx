export default function TicketsLoading() {
  return (
    <div className="space-y-5">
      <div>
        <div className="h-9 w-40 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
        <div className="mt-2 h-5 w-72 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-3">
                <div className="h-6 w-72 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-44 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-7 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

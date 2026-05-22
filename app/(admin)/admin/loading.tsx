export default function AdminQueueLoading() {
  return (
    <div className="space-y-5">
      <div>
        <div className="h-9 w-48 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
        <div className="mt-2 h-5 w-80 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-10 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="grid gap-3 border-t border-slate-100 p-4 dark:border-slate-800 lg:grid-cols-[1.1fr_1.4fr_1fr_1fr_1fr_1fr_110px]">
            {Array.from({ length: 7 }).map((__, cell) => (
              <div key={cell} className="h-7 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

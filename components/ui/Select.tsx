import { SelectHTMLAttributes } from "react";

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`min-h-10 w-full cursor-pointer rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 transition hover:border-slate-400 focus:border-amber-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-600 ${className}`}
      {...props}
    />
  );
}

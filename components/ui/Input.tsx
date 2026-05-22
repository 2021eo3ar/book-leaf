import { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 transition placeholder:text-slate-400 hover:border-slate-400 focus:border-amber-500 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:disabled:bg-slate-900 ${className}`}
      {...props}
    />
  );
}

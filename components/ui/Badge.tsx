import { labelize } from "@/lib/format";

type BadgeProps = {
  children: string | null | undefined;
  tone?: "green" | "yellow" | "red" | "orange" | "blue" | "slate" | "amber";
};

export function Badge({ children, tone = "slate" }: BadgeProps) {
  const tones = {
    green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
    yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300",
    red: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
    orange: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  };
  return (
    <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${tones[tone]}`}>
      {labelize(children)}
    </span>
  );
}

export function statusTone(status: string) {
  if (status === "resolved" || status === "closed" || status === "Published & Live") return "green";
  if (status === "in_progress" || status.includes("Production")) return "yellow";
  return "blue";
}

export function priorityTone(priority: string | null | undefined) {
  if (priority === "critical") return "red";
  if (priority === "high") return "orange";
  if (priority === "medium") return "blue";
  return "slate";
}

export function rupees(value: number | null | undefined) {
  if (value === null || value === undefined) return "TBD";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function shortDate(value: string | Date | null | undefined) {
  if (!value) return "Not yet published";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function labelize(value: string | null | undefined) {
  if (!value) return "Unassigned";
  return value.replaceAll("_", " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const statusColors = {
  New: "bg-slate-200 text-slate-700",
  Assigned: "bg-amber-100 text-amber-700",
  "In Progress": "bg-sky-100 text-sky-700",
  Pending: "bg-orange-100 text-orange-700",
  Resolved: "bg-emerald-100 text-emerald-700",
  Escalated: "bg-rose-100 text-rose-700"
};

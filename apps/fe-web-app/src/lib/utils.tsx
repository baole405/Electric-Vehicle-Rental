import type { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmt(value?: string) {
  if (!value) {
    return "-";
  }
  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return value;
  }
}

export function money(amount?: number) {
  if (typeof amount !== "number") {
    return "-";
  }
  return `${amount.toLocaleString("vi-VN")} VND`;
}

export function statusText(status?: string) {
  const map: Record<string, string> = {
    pending: "Pending confirmation",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    expired: "Expired",
    ongoing: "Ongoing",
    completed: "Completed",
    overdue: "Overdue",
    paid: "Paid",
  };
  if (!status) {
    return "";
  }
  return map[status] ?? status;
}

export function BadgeStatus({ variant, children }: { variant: string; children: ReactNode }) {
  const classes: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-rose-50 text-rose-700 border-rose-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
    blue: "bg-sky-50 text-sky-700 border-sky-200",
  };
  return (
    <span className={`rounded-md border px-2 py-1 text-xs ${classes[variant] ?? classes.gray}`}>
      {children}
    </span>
  );
}

export function mapStatusColor(status: string): string {
  switch (status) {
    case "confirmed":
    case "completed":
    case "paid":
      return "green";
    case "pending":
    case "overdue":
      return "amber";
    case "cancelled":
    case "failed":
      return "red";
    default:
      return "gray";
  }
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmt(s?: string) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString("vi-VN");
  } catch {
    return s;
  }
}

export function money(n?: number) {
  return typeof n === "number" ? n.toLocaleString("vi-VN") + "₫" : "—";
}

export function statusText(s?: string) {
  const map: Record<string, string> = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    cancelled: "Đã huỷ",
    expired: "Hết hạn",
    ongoing: "Đang thuê",
    completed: "Hoàn tất",
    overdue: "Quá hạn",
    paid: "Đã thanh toán",
  };
  return map[s ?? ""] ?? s ?? "";
}

/* ──────────────── Badge màu ──────────────── */
export function BadgeStatus({ variant, children }: { variant: string; children: React.ReactNode }) {
  const cls: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-rose-50 text-rose-700 border-rose-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
    blue: "bg-sky-50 text-sky-700 border-sky-200",
  };
  return <span className={`px-2 py-1 text-xs rounded-md border ${cls[variant]}`}>{children}</span>;
}

export function mapStatusColor(s: string): string {
  switch (s) {
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

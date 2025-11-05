import { clsx, type ClassValue } from 'clsx';
import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmt(value?: string) {
  if (!value) {
    return '-';
  }
  try {
    return new Date(value).toLocaleString('vi-VN');
  } catch {
    return value;
  }
}

export function money(amount?: number) {
  if (typeof amount !== 'number') {
    return '-';
  }
  return `${amount.toLocaleString('vi-VN')} VND`;
}

export function statusText(status?: string) {
  if (!status) {
    return '';
  }
  const normalized = status.toUpperCase();
  const map: Record<string, string> = {
    CREATED: 'Created',
    PENDING_APPROVAL: 'Pending approval',
    APPROVED: 'Approved',
    WAITING_PAYMENT: 'Waiting payment',
    WAITING_CHECKOUT: 'Waiting checkout',
    PENDING_PAYMENT: 'Waiting payment',
    HELD: 'On hold',
    CONFIRMED: 'Confirmed',
    PAID: 'Paid',
    CHECKED_OUT: 'Checked out',
    CHECKED_IN: 'Staff confirmed',
    SUCCESS: 'Completed',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    EXPIRED: 'Expired',
    REJECTED: 'Rejected',
    FAILED: 'Failed',
    READY_FOR_PICKUP: 'Ready for pickup',
    IN_PROGRESS: 'In progress',
    RETURNED: 'Returned',
    LATE: 'Late',
    OVERDUE: 'Overdue',
    DAMAGED: 'Damaged',
    PENDING: 'Pending',
    ONGOING: 'Ongoing',
  };
  return map[normalized] ?? status;
}

export function BadgeStatus({
  variant,
  children,
}: {
  variant: string;
  children: ReactNode;
}) {
  const classes: Record<string, string> = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
    blue: 'bg-sky-50 text-sky-700 border-sky-200',
  };
  return (
    <span
      className={`rounded-md border px-2 py-1 text-xs ${
        classes[variant] ?? classes.gray
      }`}
    >
      {children}
    </span>
  );
}

export function mapStatusColor(status: string): string {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case 'CONFIRMED':
    case 'APPROVED':
    case 'SUCCESS':
    case 'COMPLETED':
    case 'PAID':
    case 'READY_FOR_PICKUP':
    case 'RETURNED':
      return 'green';
    case 'PENDING':
    case 'PENDING_APPROVAL':
    case 'PENDING_PAYMENT':
    case 'WAITING_PAYMENT':
    case 'WAITING_CHECKOUT':
    case 'HELD':
    case 'OVERDUE':
    case 'IN_PROGRESS':
    case 'LATE':
      return 'amber';
    case 'CHECKED_IN':
      return 'blue';
    case 'CANCELLED':
    case 'REJECTED':
    case 'FAILED':
    case 'DAMAGED':
      return 'red';
    default:
      return 'gray';
  }
}

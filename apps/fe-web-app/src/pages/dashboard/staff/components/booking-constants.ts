// Status color mapping for badges
export const STATUS_COLORS: Record<string, string> = {
  // NEW BACKEND STATUSES (UPPERCASE)
  PENDING_APPROVAL: 'bg-amber-100 text-amber-800 border-amber-200',
  WAITING_PAYMENT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PAID: 'bg-green-100 text-green-800 border-green-200',
  SUCCESS: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  REJECTED: 'bg-rose-100 text-rose-800 border-rose-200',
  EXPIRED: 'bg-orange-100 text-orange-800 border-orange-200',
  FAILED: 'bg-red-200 text-red-900 border-red-300',

  // Legacy (lowercase)
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  pending_payment: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  held: 'bg-blue-100 text-blue-800 border-blue-200',
  confirmed: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
  checked_out: 'bg-teal-100 text-teal-800 border-teal-200',
  completed: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  expired: 'bg-orange-100 text-orange-800 border-orange-200',
};

// Vietnamese labels for booking statuses
export const STATUS_LABELS: Record<string, string> = {
  // NEW BACKEND STATUSES (UPPERCASE)
  PENDING_APPROVAL: 'Chờ duyệt',
  WAITING_PAYMENT: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  SUCCESS: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  REJECTED: 'Đã từ chối',
  EXPIRED: 'Hết hạn',
  FAILED: 'Thất bại',

  // Legacy (lowercase)
  pending: 'Chờ xử lý',
  pending_payment: 'Chờ thanh toán',
  held: 'Đang giữ chỗ',
  confirmed: 'Đã xác nhận',
  paid: 'Đã thanh toán',
  checked_out: 'Đã giao xe',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  expired: 'Hết hạn',
};

// Helper: Get next valid statuses based on workflow
export const getNextStatuses = (currentStatus: string): string[] => {
  const workflow: Record<string, string[]> = {
    // ===== NEW BACKEND STATUSES (UPPERCASE) =====
    PENDING_APPROVAL: ['WAITING_PAYMENT', 'REJECTED', 'CANCELLED'],
    WAITING_PAYMENT: ['PAID', 'CANCELLED'],
    PAID: ['SUCCESS'],
    SUCCESS: [],
    CANCELLED: [],
    REJECTED: [],
    EXPIRED: [],
    FAILED: [],

    // ===== LEGACY STATUSES (lowercase - for backward compatibility) =====
    pending: ['pending_payment', 'confirmed', 'cancelled'],
    pending_payment: ['confirmed', 'cancelled'],
    held: ['confirmed', 'cancelled'],
    confirmed: ['paid', 'cancelled'],
    paid: ['checked_out', 'cancelled'],
    checked_out: ['completed'],
    completed: [],
    cancelled: [],
    expired: [],
  };
  return workflow[currentStatus] || [];
};

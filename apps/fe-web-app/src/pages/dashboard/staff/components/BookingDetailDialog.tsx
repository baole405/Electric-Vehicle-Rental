import { Button } from '@/components/shadcn/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/ui/dialog';
import type { TBooking } from '@/schema/booking.schema';
import { Calendar, Car, DollarSign, User } from 'lucide-react';

type BookingDetailDialogProps = {
  booking: TBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: (booking: TBooking) => void;
  onReject?: (booking: TBooking) => void;
  isUpdating?: boolean;
};

export function BookingDetailDialog({
  booking,
  open,
  onOpenChange,
  onApprove,
  onReject,
  isUpdating,
}: BookingDetailDialogProps) {
  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết Booking</DialogTitle>
          <DialogDescription>
            Mã: {booking.bookingCode || booking._id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer Information */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Khách hàng
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-600">Họ tên</div>
                <div className="font-medium">{booking.renterName}</div>
              </div>
              <div>
                <div className="text-gray-600">SĐT</div>
                <div className="font-medium">{booking.phoneNumber}</div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-600">Email</div>
                <div className="font-medium">{booking.email}</div>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Car className="h-4 w-4" />
              Thông tin xe
            </h3>
            <div>
              <div className="text-sm text-gray-600">Dòng xe</div>
              <div className="font-medium">{booking.brand?.name}</div>
            </div>
            {booking.assignedVehicle ? (
              <div className="mt-2 p-3 bg-white rounded border border-blue-200">
                <div className="text-sm text-gray-600">Xe được gán</div>
                <div className="font-medium text-blue-600">
                  {booking.assignedVehicle.plateNo ||
                    booking.assignedVehicle.vin}
                </div>
              </div>
            ) : (
              <div className="mt-2 p-3 bg-yellow-50 rounded border">
                <div className="text-sm text-yellow-800">Chưa gán xe</div>
              </div>
            )}
          </div>

          {/* Rental Period */}
          <div className="rounded-lg bg-green-50 p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Thời gian thuê
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-600">Ngày nhận xe</div>
                <div className="font-medium">
                  {booking.pickupDate
                    ? new Date(booking.pickupDate).toLocaleDateString('vi-VN')
                    : 'N/A'}{' '}
                  - {booking.pickupTime || '10:00'}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Ngày trả xe</div>
                <div className="font-medium">
                  {booking.returnDate
                    ? new Date(booking.returnDate).toLocaleDateString('vi-VN')
                    : 'N/A'}{' '}
                  - {booking.returnTime || '10:00'}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-600">Số ngày thuê</div>
                <div className="font-medium text-lg">
                  {booking.rentalDays || 0} ngày
                </div>
              </div>
            </div>
          </div>

          {/* Station & Location */}
          <div className="rounded-lg bg-purple-50 p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Địa điểm
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-gray-600">Trạm nhận xe</div>
                <div className="font-medium">
                  {booking.pickupStation?.name ||
                    booking.station?.name ||
                    'Chưa xác định'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Mã trạm:{' '}
                  {booking.pickupStation?.code ||
                    booking.station?.code ||
                    'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-lg bg-orange-50 p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Chi phí
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Giá thuê ({booking.rentalDays || 0} ngày)</span>
                <span className="font-medium">
                  {(
                    booking.basePrice ||
                    booking.totalRentalFee ||
                    0
                  ).toLocaleString('vi-VN')}
                  đ
                </span>
              </div>
              {booking.additionalFees && booking.additionalFees > 0 && (
                <div className="flex justify-between">
                  <span className="text-amber-600">Phí phụ thu</span>
                  <span className="font-medium text-amber-600">
                    {booking.additionalFees.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Tổng tiền</span>
                <span className="font-semibold">
                  {(
                    (booking.basePrice || booking.totalRentalFee || 0) +
                    (booking.additionalFees || 0)
                  ).toLocaleString('vi-VN')}
                  đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-blue-600">Tiền cọc</span>
                <span className="font-semibold text-blue-600">
                  {(booking.depositAmount || 0).toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-green-300 bg-green-100 -mx-2 px-2 py-2 rounded">
                <span className="font-bold text-green-700">Thanh toán</span>
                <span className="font-bold text-lg text-green-700">
                  {(booking.totalPayable || 0).toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </div>

          {/* Payment & Status */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Thanh toán & Trạng thái
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-600">Phương thức</div>
                <div className="font-medium capitalize">
                  {booking.paymentMethod === 'bank_transfer'
                    ? 'Chuyển khoản'
                    : booking.paymentMethod === 'cash'
                    ? 'Tiền mặt'
                    : booking.paymentMethod === 'online'
                    ? 'Online'
                    : booking.paymentMethod || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Trạng thái</div>
                <div
                  className={`font-medium px-2 py-1 rounded text-xs inline-block ${
                    booking.status === 'pending_payment'
                      ? 'bg-yellow-100 text-yellow-800'
                      : booking.status === 'held'
                      ? 'bg-blue-100 text-blue-800'
                      : booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : booking.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {booking.status === 'pending_payment'
                    ? 'Chờ thanh toán'
                    : booking.status === 'held'
                    ? 'Đang giữ chỗ'
                    : booking.status === 'confirmed'
                    ? 'Đã xác nhận'
                    : booking.status === 'paid'
                    ? 'Đã thanh toán'
                    : booking.status === 'checked_out'
                    ? 'Đã nhận xe'
                    : booking.status === 'completed'
                    ? 'Hoàn thành'
                    : booking.status === 'cancelled'
                    ? 'Đã hủy'
                    : booking.status === 'expired'
                    ? 'Hết hạn'
                    : booking.status || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="rounded-lg bg-blue-50 p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Ghi chú
              </h3>
              <div className="text-sm bg-white p-3 rounded border">
                {booking.notes}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Approve/Reject buttons for PENDING_APPROVAL status */}
        {booking.status === 'PENDING_APPROVAL' && onApprove && onReject && (
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onReject(booking)}
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              Từ chối
            </Button>
            <Button
              onClick={() => onApprove(booking)}
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              {isUpdating ? 'Đang xử lý...' : 'Duyệt'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

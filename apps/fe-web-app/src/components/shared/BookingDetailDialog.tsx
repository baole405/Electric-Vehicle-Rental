import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shadcn/ui/dialog";
import { Badge } from "@/components/shadcn/ui/badge";
import { Calendar, Car, User, MapPin, DollarSign, FileText } from "lucide-react";
import type { TBooking } from "@/schema/booking.schema";

interface BookingDetailDialogProps {
    booking: TBooking | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function BookingDetailDialog({
    booking,
    open,
    onOpenChange,
}: BookingDetailDialogProps) {
    if (!booking) return null;

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending_payment: { label: "Chờ thanh toán", variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800" },
            held: { label: "Đang giữ chỗ", variant: "secondary" as const, className: "bg-blue-100 text-blue-800" },
            confirmed: { label: "Đã xác nhận", variant: "secondary" as const, className: "bg-green-100 text-green-800" },
            paid: { label: "Đã thanh toán", variant: "secondary" as const, className: "bg-emerald-100 text-emerald-800" },
            checked_out: { label: "Đã nhận xe", variant: "secondary" as const, className: "bg-indigo-100 text-indigo-800" },
            completed: { label: "Hoàn thành", variant: "secondary" as const, className: "bg-gray-100 text-gray-800" },
            cancelled: { label: "Đã hủy", variant: "destructive" as const, className: "bg-red-100 text-red-800" },
            expired: { label: "Hết hạn", variant: "destructive" as const, className: "bg-red-100 text-red-800" },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || {
            label: status,
            variant: "secondary" as const,
            className: "bg-gray-100 text-gray-800"
        };

        return (
            <Badge variant={config.variant} className={config.className}>
                {config.label}
            </Badge>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl">Chi tiết Booking</DialogTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                Mã booking: <span className="font-mono font-semibold">{booking.bookingCode || booking._id}</span>
                            </p>
                        </div>
                        {getStatusBadge(booking.status)}
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Customer Information */}
                    <div className="rounded-lg bg-gray-50 p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Thông tin người thuê
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                                <div className="text-gray-600">Họ tên</div>
                                <div className="font-medium">{booking.renterName}</div>
                            </div>
                            <div>
                                <div className="text-gray-600">Số điện thoại</div>
                                <div className="font-medium">{booking.phoneNumber}</div>
                            </div>
                            <div className="md:col-span-2">
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
                        <div className="space-y-2">
                            <div>
                                <div className="text-sm text-gray-600">Dòng xe</div>
                                <div className="font-medium text-lg">
                                    {booking.brand?.name} ({booking.brand?.code})
                                </div>
                            </div>
                            {booking.assignedVehicle ? (
                                <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                                    <div className="text-sm text-gray-600">Xe đã được gán</div>
                                    <div className="font-medium text-blue-600">
                                        {booking.assignedVehicle.plateNo || booking.assignedVehicle.vin || booking.assignedVehicle._id}
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-3 p-3 bg-yellow-50 rounded border">
                                    <div className="text-sm text-yellow-800">Chưa gán xe cụ thể</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rental Period */}
                    <div className="rounded-lg bg-green-50 p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Thời gian thuê
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-gray-600">Ngày nhận xe</div>
                                <div className="font-medium">
                                    {booking.pickupDate ? new Date(booking.pickupDate).toLocaleDateString('vi-VN') : 'N/A'}
                                    {booking.pickupTime && ` - ${booking.pickupTime}`}
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-600">Ngày trả xe</div>
                                <div className="font-medium">
                                    {booking.returnDate ? new Date(booking.returnDate).toLocaleDateString('vi-VN') : 'N/A'}
                                    {booking.returnTime && ` - ${booking.returnTime}`}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <div className="text-gray-600">Số ngày thuê</div>
                                <div className="font-medium text-lg text-green-600">
                                    {booking.rentalDays || 0} ngày
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Station & Location */}
                    <div className="rounded-lg bg-purple-50 p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Địa điểm
                        </h3>
                        <div className="text-sm">
                            <div className="text-gray-600">Trạm nhận xe</div>
                            <div className="font-medium">
                                {booking.pickupStation?.name || booking.station?.name || 'Chưa xác định'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Mã trạm: {booking.pickupStation?.code || booking.station?.code || 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="rounded-lg bg-orange-50 p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Chi phí
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span>Giá thuê ({booking.rentalDays || 0} ngày)</span>
                                <span className="font-medium">
                                    {(booking.basePrice || booking.totalRentalFee || 0).toLocaleString("vi-VN")}đ
                                </span>
                            </div>
                            {booking.additionalFees && booking.additionalFees > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-amber-600">Phí phụ thu</span>
                                    <span className="font-medium text-amber-600">
                                        +{booking.additionalFees.toLocaleString("vi-VN")}đ
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between border-t pt-2">
                                <span className="font-medium">Tổng tiền thuê</span>
                                <span className="font-semibold">
                                    {((booking.basePrice || booking.totalRentalFee || 0) + (booking.additionalFees || 0)).toLocaleString("vi-VN")}đ
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-blue-600">Tiền cọc</span>
                                <span className="font-semibold text-blue-600">
                                    {(booking.depositAmount || 0).toLocaleString("vi-VN")}đ
                                </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-green-300 bg-green-100 -mx-2 px-2 py-2 rounded">
                                <span className="font-bold text-green-700">Thanh toán</span>
                                <span className="font-bold text-lg text-green-700">
                                    {(booking.totalPayable || 0).toLocaleString("vi-VN")}đ
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="rounded-lg bg-gray-50 p-4">
                        <h3 className="font-semibold mb-2">Phương thức thanh toán</h3>
                        <div className="text-sm">
                            <span className="inline-block px-3 py-1 bg-white rounded border font-medium">
                                {booking.paymentMethod === 'bank_transfer' ? 'Chuyển khoản ngân hàng' :
                                    booking.paymentMethod === 'cash' ? 'Tiền mặt' :
                                        booking.paymentMethod === 'online' ? 'Thanh toán online' :
                                            booking.paymentMethod || 'Chưa xác định'}
                            </span>
                        </div>
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                        <div className="rounded-lg bg-blue-50 p-4">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Ghi chú
                            </h3>
                            <div className="text-sm bg-white p-3 rounded border">
                                {booking.notes}
                            </div>
                        </div>
                    )}

                    {/* Timestamps */}
                    {(booking.createdAt || booking.updatedAt) && (
                        <div className="rounded-lg bg-gray-50 p-4">
                            <h3 className="font-semibold mb-2">Thông tin thời gian</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                {booking.createdAt && (
                                    <div>
                                        <div className="text-gray-600">Thời gian tạo</div>
                                        <div className="font-medium">
                                            {new Date(booking.createdAt).toLocaleString('vi-VN')}
                                        </div>
                                    </div>
                                )}
                                {booking.updatedAt && (
                                    <div>
                                        <div className="text-gray-600">Cập nhật lần cuối</div>
                                        <div className="font-medium">
                                            {new Date(booking.updatedAt).toLocaleString('vi-VN')}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

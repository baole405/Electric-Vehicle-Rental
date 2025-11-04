import { useState, useMemo } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { useBooking } from "@/hooks/use-booking";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Badge } from "@/components/shadcn/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import {
  Search,
  Calendar,
  Car,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Download,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { TBooking } from "@/schema/booking.schema";
import BookingDetailDialog from "@/components/shared/BookingDetailDialog";
import type { AxiosError } from "axios";

export default function BookingsTab() {
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();
  const { useBookingList, cancelBooking } = useBooking();
  const renterId = currentUser?._id ?? "";
  const isValidRenterId = renterId ? /^[a-fA-F0-9]{24}$/.test(renterId) : false;
  const bookingListQuery = useBookingList(
    isValidRenterId ? { renterId } : undefined,
    { enabled: Boolean(renterId) && isValidRenterId }
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<TBooking | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const bookings = useMemo(
    () => (bookingListQuery.data?.data?.data || []) as TBooking[],
    [bookingListQuery.data?.data?.data]
  );

  const bookingErrorMessage = useMemo(() => {
    if (renterId && !isValidRenterId) {
      return "Không thể tải lịch sử booking vì mã người dùng không hợp lệ.";
    }
    if (!bookingListQuery.isError) {
      return null;
    }
    const error = bookingListQuery.error as AxiosError<{ message?: string; error?: string }>;
    if (error.response?.status === 400) {
      return error.response.data?.message ?? "renterId không hợp lệ (phải là ObjectId 24 ký tự).";
    }
    return error.message || "Đã xảy ra lỗi khi tải danh sách booking.";
  }, [bookingListQuery.error, bookingListQuery.isError, renterId, isValidRenterId]);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking: TBooking) => {
      const matchesSearch =
        booking.bookingCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.brand?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.renterName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: React.ElementType }> = {
      pending_payment: { label: "Chờ thanh toán", className: "bg-yellow-500", icon: Clock },
      confirmed: { label: "Đã xác nhận", className: "bg-green-500", icon: CheckCircle2 },
      completed: { label: "Hoàn thành", className: "bg-blue-500", icon: CheckCircle2 },
      cancelled: { label: "Đã hủy", className: "bg-red-500", icon: XCircle },
      expired: { label: "Hết hạn", className: "bg-gray-500", icon: AlertCircle },
    };

    const variant = config[status] || { label: status, className: "bg-gray-500", icon: AlertCircle };
    const Icon = variant.icon;

    return (
      <Badge className={`${variant.className} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {variant.label}
      </Badge>
    );
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    cancelBooking.mutate(selectedBooking._id, {
      onSuccess: () => {
        setShowCancelDialog(false);
        setSelectedBooking(null);
        bookingListQuery.refetch();
      },
      onError: (error) => {
        console.error("Cancel booking error:", error);
        alert("Không thể hủy booking. Vui lòng thử lại!");
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Danh sách booking</CardTitle>
          <CardDescription>Quản lý tất cả booking của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          {bookingErrorMessage && (
            <div className="mb-4 flex flex-col gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <span>{bookingErrorMessage}</span>
              {bookingListQuery.isError && (
                <div>
                  <Button variant="outline" size="sm" onClick={() => bookingListQuery.refetch()}>
                    Thử tải lại
                  </Button>
                </div>
              )}
            </div>
          )}
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm theo mã booking, xe, tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending_payment">Chờ thanh toán</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bookings Table */}
          {bookingListQuery.isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4">Đang tải...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                {searchQuery || statusFilter !== "all" ? "Không tìm thấy booking nào" : "Chưa có booking"}
              </p>
              <Button onClick={() => navigate("/")}>Đặt xe ngay</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã booking</TableHead>
                    <TableHead>Xe</TableHead>
                    <TableHead>Trạm</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Số ngày</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking: TBooking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="font-medium">{booking.bookingCode}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-gray-400" />
                          {booking.brand?.name || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {booking.station?.name || booking.pickupStation?.name || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {booking.pickupDate}
                          </div>
                          <div className="text-gray-500">→ {booking.returnDate}</div>
                        </div>
                      </TableCell>
                      <TableCell>{booking.rentalDays} ngày</TableCell>
                      <TableCell className="font-semibold">
                        {booking.totalPayable?.toLocaleString("vi-VN")}đ
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowDetailDialog(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Chi tiết
                          </Button>
                          {booking.status === "pending_payment" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowCancelDialog(true);
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Hủy
                            </Button>
                          )}
                          {(booking.status === "completed" || booking.status === "confirmed") && (
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-1" />
                              Hóa đơn
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận hủy booking</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hủy booking <strong>{selectedBooking?.bookingCode}</strong>?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Không
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={cancelBooking.isPending}
            >
              {cancelBooking.isPending ? "Đang hủy..." : "Xác nhận hủy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Chi tiết Booking</DialogTitle>
            <DialogDescription>
              Mã booking: <strong>{selectedBooking?.bookingCode}</strong>
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              {/* Status & Vehicle Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                  {getStatusBadge(selectedBooking.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Xe</p>
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-gray-400" />
                    <p className="font-semibold">{selectedBooking.brand?.name || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Rental Period */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Thời gian thuê
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Ngày nhận xe</p>
                    <p className="font-medium">
                      {new Date(selectedBooking.pickupDate).toLocaleDateString("vi-VN")}
                      {" - "}
                      {selectedBooking.pickupTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ngày trả xe</p>
                    <p className="font-medium">
                      {new Date(selectedBooking.returnDate).toLocaleDateString("vi-VN")}
                      {" - "}
                      {selectedBooking.returnTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Số ngày thuê</p>
                    <p className="font-medium">{selectedBooking.rentalDays || 0} ngày</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Địa điểm
                </h3>
                <p className="text-sm">
                  {selectedBooking.station?.name || selectedBooking.pickupStation?.name || "N/A"}
                </p>
                {selectedBooking.pickupStation?.address && (
                  <p className="text-sm text-gray-500 mt-1">{selectedBooking.pickupStation.address}</p>
                )}
              </div>

              {/* Renter Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Thông tin người thuê</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Họ tên</p>
                    <p className="font-medium">{selectedBooking.renterName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Số điện thoại</p>
                    <p className="font-medium">{selectedBooking.phoneNumber}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{selectedBooking.email}</p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Chi phí</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá thuê ({selectedBooking.rentalDays || 0} ngày)</span>
                    <span className="font-medium">
                      {(selectedBooking.basePrice || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  {selectedBooking.depositAmount && selectedBooking.depositAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tiền cọc</span>
                      <span className="font-medium">
                        {selectedBooking.depositAmount.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                  {selectedBooking.additionalFees && selectedBooking.additionalFees > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Phí phụ thu</span>
                      <span className="font-medium">
                        {selectedBooking.additionalFees.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                    <span>Tổng cộng</span>
                    <span className="text-green-600">
                      {(selectedBooking.totalPayable || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              {selectedBooking.paymentMethod && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Thanh toán</h3>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phương thức</span>
                      <span className="font-medium">
                        {selectedBooking.paymentMethod === "bank_transfer"
                          ? "Chuyển khoản"
                          : selectedBooking.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Ghi chú</h3>
                  <p className="text-sm text-gray-700">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Detail Dialog */}
      <BookingDetailDialog
        booking={selectedBooking}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />
    </div>
  );
}

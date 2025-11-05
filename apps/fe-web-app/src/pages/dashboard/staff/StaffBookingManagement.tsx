import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/card';
import { Input } from '@/components/shadcn/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import { useBooking } from '@/hooks/use-booking';
import { useHandoverHook } from '@/hooks/use-handover';
import { usePaymentHook } from '@/hooks/use-payment';
import { useRentalHook } from '@/hooks/use-rental';
import { useVehicleHook } from '@/hooks/use-vehicle';
import { cn } from '@/lib/utils';
import type { TBooking } from '@/schema/booking.schema';
import type { TRental } from '@/schema/rental.schema';
import { Eye, Filter, RefreshCw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  AssignVehicleDialog,
  BookingDetailDialog,
  CreateRentalDialog,
  HandoverDialog,
  PaymentDialog,
  STATUS_COLORS,
  STATUS_LABELS,
  UpdateBookingStatusDialog,
} from './components';

export function StaffBookingManagement() {
  const { useBookingList, updateBookingStatus } = useBooking();
  const { useVehicleList } = useVehicleHook();
  const { createRental } = useRentalHook();
  const { createPayment } = usePaymentHook();
  const handoverHook = useHandoverHook();
  const { createHandover } = handoverHook;

  // Fetch data
  const bookingQuery = useBookingList();
  const vehicleQuery = useVehicleList();

  // Extract data from queries
  const bookings = useMemo(
    () =>
      Array.isArray(bookingQuery.data?.data?.data)
        ? bookingQuery.data.data.data
        : [],
    [bookingQuery.data]
  );
  const vehicles = useMemo(
    () =>
      Array.isArray(vehicleQuery.data?.data?.data)
        ? vehicleQuery.data.data.data
        : [],
    [vehicleQuery.data]
  );

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<TBooking | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [assignVehicleDialogOpen, setAssignVehicleDialogOpen] = useState(false);
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState<TBooking | null>(null);
  const [rentalBooking, setRentalBooking] = useState<TBooking | null>(null);
  const [handoverContext, setHandoverContext] = useState<{
    rental: TRental;
    type: 'pickup' | 'return';
  } | null>(null);
  const paymentDialogOpen = Boolean(paymentBooking);
  const rentalDialogOpen = Boolean(rentalBooking);
  const handoverDialogOpen = handoverContext !== null;

  const refetchAll = async () => {
    await Promise.all([bookingQuery.refetch(), vehicleQuery.refetch()]);
  };

  // Filter bookings based on search and status
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        searchTerm === '' ||
        booking.renterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phoneNumber?.includes(searchTerm) ||
        booking.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.bookingCode?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  // Get available vehicles for the selected booking's brand
  const availableVehiclesForBrand = useMemo(() => {
    if (!selectedBooking?.brand?._id) return [];
    return vehicles.filter((v) => {
      const vehicleBrandId =
        typeof v.brand === 'string' ? v.brand : v.brand?._id;
      return (
        vehicleBrandId === selectedBooking.brand._id && v.status === 'available'
      );
    });
  }, [selectedBooking, vehicles]);

  // Event handlers
  const handleViewDetail = (booking: TBooking) => {
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
  };

  const handleApproveBooking = async (booking: TBooking) => {
    try {
      await updateBookingStatus.mutateAsync({
        bookingId: booking._id,
        data: { status: 'APPROVED' },
      });
      toast.success(
        'Đã duyệt booking. Backend sẽ tự động chuyển sang WAITING_PAYMENT.'
      );
      setDetailDialogOpen(false);
      await refetchAll();
    } catch (error) {
      toast.error(
        'Không thể duyệt booking: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  };

  const handleRejectBooking = async (booking: TBooking) => {
    try {
      await updateBookingStatus.mutateAsync({
        bookingId: booking._id,
        data: { status: 'REJECTED' },
      });
      toast.success('Đã từ chối booking.');
      setDetailDialogOpen(false);
      await refetchAll();
    } catch (error) {
      toast.error(
        'Không thể từ chối booking: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  };

  const handleRefresh = () => {
    void refetchAll();
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Quản lý Bookings</CardTitle>
          <CardDescription>
            Xem và quản lý đơn đặt xe của khách hàng
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="border-none shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm theo tên, SĐT, email, mã booking..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="PENDING_APPROVAL">Chờ duyệt</SelectItem>
                    <SelectItem value="WAITING_PAYMENT">
                      Chờ thanh toán
                    </SelectItem>
                    <SelectItem value="PAID">Đã thanh toán</SelectItem>
                    <SelectItem value="SUCCESS">Hoàn thành</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={bookingQuery.isLoading}
              >
                <RefreshCw
                  className={cn(
                    'h-4 w-4 mr-2',
                    bookingQuery.isLoading && 'animate-spin'
                  )}
                />
                Làm mới
              </Button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-lg bg-blue-50 p-3 border border-blue-100">
              <div className="text-xs text-blue-600 font-medium">Tổng số</div>
              <div className="text-2xl font-bold text-blue-900">
                {bookings.length}
              </div>
            </div>
            <div className="rounded-lg bg-yellow-50 p-3 border border-yellow-100">
              <div className="text-xs text-yellow-600 font-medium">
                Chờ duyệt
              </div>
              <div className="text-2xl font-bold text-yellow-900">
                {
                  bookings.filter(
                    (b) =>
                      b.status === 'PENDING_APPROVAL' || b.status === 'pending'
                  ).length
                }
              </div>
            </div>
            <div className="rounded-lg bg-green-50 p-3 border border-green-100">
              <div className="text-xs text-green-600 font-medium">
                Đã thanh toán
              </div>
              <div className="text-2xl font-bold text-green-900">
                {
                  bookings.filter(
                    (b) =>
                      b.status === 'PAID' ||
                      b.status === 'SUCCESS' ||
                      b.status === 'paid' ||
                      b.status === 'confirmed'
                  ).length
                }
              </div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
              <div className="text-xs text-gray-600 font-medium">
                Hoàn thành
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {
                  bookings.filter(
                    (b) => b.status === 'SUCCESS' || b.status === 'completed'
                  ).length
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md">
        <CardContent className="p-0">
          {bookingQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              <span className="ml-3 text-sm text-gray-600">Đang tải...</span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p className="text-lg font-medium">Không tìm thấy booking</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Mã</TableHead>
                    <TableHead className="font-semibold">Khách hàng</TableHead>
                    <TableHead className="font-semibold">Dòng xe</TableHead>
                    <TableHead className="font-semibold">Ngày thuê</TableHead>
                    <TableHead className="font-semibold">Tổng tiền</TableHead>
                    <TableHead className="font-semibold">Trạng thái</TableHead>
                    <TableHead className="font-semibold text-center">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {booking.bookingCode || booking._id.slice(-6)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {booking.renterName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.phoneNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{booking.brand?.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {booking.pickupDate
                            ? new Date(booking.pickupDate).toLocaleDateString(
                                'vi-VN'
                              )
                            : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.rentalDays || 0} ngày
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {(booking.totalPayable || 0).toLocaleString('vi-VN')}đ
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            STATUS_COLORS[booking.status]
                          )}
                        >
                          {STATUS_LABELS[booking.status] || booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(booking)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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

      {/* All Dialogs */}
      <BookingDetailDialog
        booking={selectedBooking}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onApprove={handleApproveBooking}
        onReject={handleRejectBooking}
        isUpdating={updateBookingStatus.isPending}
      />

      <PaymentDialog
        booking={paymentBooking}
        open={paymentDialogOpen}
        onOpenChange={(open) => {
          if (!open) setPaymentBooking(null);
        }}
        createPayment={createPayment}
        onSuccess={() => {
          toast.success('Đã ghi nhận thanh toán.');
          setPaymentBooking(null);
          void refetchAll();
        }}
      />

      <CreateRentalDialog
        booking={rentalBooking}
        open={rentalDialogOpen}
        vehicles={vehicles}
        onOpenChange={(open) => {
          if (!open) setRentalBooking(null);
        }}
        createRental={createRental}
        onSuccess={() => {
          toast.success('Đã tạo rental mới.');
          setRentalBooking(null);
          void refetchAll();
        }}
      />

      <HandoverDialog
        context={handoverContext}
        open={handoverDialogOpen}
        onOpenChange={(open) => {
          if (!open) setHandoverContext(null);
        }}
        createHandover={createHandover}
        onSuccess={(message) => {
          if (message) {
            toast.success(message);
          }
          setHandoverContext(null);
          void refetchAll();
        }}
      />

      <AssignVehicleDialog
        booking={selectedBooking}
        availableVehicles={availableVehiclesForBrand}
        open={assignVehicleDialogOpen}
        onOpenChange={setAssignVehicleDialogOpen}
        onSuccess={() => {
          setAssignVehicleDialogOpen(false);
          bookingQuery.refetch();
        }}
      />

      <UpdateBookingStatusDialog
        booking={selectedBooking}
        open={updateStatusDialogOpen}
        onOpenChange={setUpdateStatusDialogOpen}
        onSuccess={() => {
          setUpdateStatusDialogOpen(false);
          bookingQuery.refetch();
        }}
      />
    </div>
  );
}

import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import BookingDetailDialog from '@/components/shared/BookingDetailDialog';
import { useBooking } from '@/hooks/use-booking';
import { cn } from '@/lib/utils';
import type { TBooking } from '@/schema/booking.schema';
import { Eye, Loader2, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// Status colors
const STATUS_COLORS: Record<string, string> = {
  PENDING_APPROVAL: 'bg-amber-100 text-amber-800 border-amber-300',
  APPROVED: 'bg-blue-100 text-blue-800 border-blue-300',
  WAITING_PAYMENT: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  PAID: 'bg-green-100 text-green-800 border-green-300',
  SUCCESS: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  REJECTED: 'bg-red-100 text-red-800 border-red-300',
  CANCELLED: 'bg-gray-100 text-gray-800 border-gray-300',
  EXPIRED: 'bg-orange-100 text-orange-800 border-orange-300',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_APPROVAL: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  WAITING_PAYMENT: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  SUCCESS: 'Hoàn thành',
  REJECTED: 'Từ chối',
  CANCELLED: 'Đã hủy',
  EXPIRED: 'Hết hạn',
};

export default function StaffDashboard() {
  const [selectedBooking, setSelectedBooking] = useState<TBooking | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { useBookingList, updateBookingStatus } = useBooking();
  const bookingQuery = useBookingList();

  const bookings = bookingQuery.data?.data?.data ?? [];

  const refetchAll = async () => {
    await bookingQuery.refetch();
  };

  const handleViewDetail = (booking: TBooking) => {
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
  };

  const handleApproveBooking = async (booking: TBooking) => {
    console.log('🎯 [APPROVE] Starting approval process...');
    console.log('📋 Booking ID:', booking._id);
    console.log('📌 Current Status:', booking.status);
    console.log('🔧 updateBookingStatus:', updateBookingStatus);

    try {
      console.log('🚀 Calling updateBookingStatus.mutateAsync...');
      const result = await updateBookingStatus.mutateAsync({
        bookingId: booking._id,
        data: { status: 'APPROVED' },
      });
      console.log('✅ Success! Result:', result);

      toast.success('Đã duyệt booking!');
      setDetailDialogOpen(false);
      await refetchAll();
    } catch (error) {
      console.error('❌ [ERROR] Failed to approve booking:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
      });
      toast.error(
        'Lỗi: ' + (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  };

  const handleRejectBooking = async (booking: TBooking) => {
    console.log('🔴 [REJECT] Starting rejection process...');
    console.log('📋 Booking ID:', booking._id);

    try {
      await updateBookingStatus.mutateAsync({
        bookingId: booking._id,
        data: { status: 'REJECTED' },
      });
      console.log('✅ Rejected successfully!');
      toast.success('Đã từ chối booking.');
      setDetailDialogOpen(false);
      await refetchAll();
    } catch (error) {
      toast.error(
        'Lỗi: ' + (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  };

  // Stats
  const stats = {
    pendingApproval: bookings.filter(
      (b) => b.status === 'PENDING_APPROVAL' || b.status === 'pending'
    ).length,
    waitingPayment: bookings.filter(
      (b) => b.status === 'WAITING_PAYMENT' || b.status === 'pending_payment'
    ).length,
    paid: bookings.filter((b) => b.status === 'PAID' || b.status === 'paid')
      .length,
    success: bookings.filter(
      (b) => b.status === 'SUCCESS' || b.status === 'completed'
    ).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Staff Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Quản lý booking và xử lý duyệt</p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetchAll()}
            disabled={bookingQuery.isLoading}
          >
            <RefreshCw
              className={cn(
                'h-4 w-4 mr-2',
                bookingQuery.isLoading && 'animate-spin'
              )}
            />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Chờ duyệt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {stats.pendingApproval}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Chờ thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600">
                {stats.waitingPayment}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Đã thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.paid}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Hoàn thành
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {stats.success}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tất cả Bookings</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Tổng cộng: {bookings.length} bookings
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {bookingQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-3 text-gray-600">Đang tải...</span>
              </div>
            ) : bookings.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <p className="text-lg font-medium">Không có booking nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[140px]">Mã Booking</TableHead>
                      <TableHead className="w-[150px]">Khách hàng</TableHead>
                      <TableHead className="w-[120px]">Dòng xe</TableHead>
                      <TableHead className="w-[180px]">Trạm</TableHead>
                      <TableHead className="w-[180px]">Thời gian</TableHead>
                      <TableHead className="w-[120px]">Tổng tiền</TableHead>
                      <TableHead className="w-[140px]">Trạng thái</TableHead>
                      <TableHead className="w-[100px] text-right">
                        Thao tác
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => {
                      return (
                        <TableRow
                          key={booking._id}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="font-mono text-sm">
                            {booking.bookingCode || booking._id.slice(-6)}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {booking.renterName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {booking.phoneNumber}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {booking.brand?.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {booking.brand?.code}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {booking.pickupStation?.name || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{booking.pickupDate}</div>
                            <div className="text-xs text-gray-500">
                              {booking.rentalDays} ngày
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-blue-600">
                              {booking.totalPayable?.toLocaleString('vi-VN')} ₫
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                'font-medium',
                                STATUS_COLORS[booking.status]
                              )}
                            >
                              {STATUS_LABELS[booking.status] || booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(booking)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <BookingDetailDialog
        booking={selectedBooking}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onApprove={handleApproveBooking}
        onReject={handleRejectBooking}
        isUpdating={updateBookingStatus.isPending}
      />
    </div>
  );
}

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Building2,
  Check,
  ClipboardList,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useBooking } from '@/hooks/use-booking';
import { useBrandHook } from '@/hooks/use-brand';
import { useStationHook } from '@/hooks/use-station';
import type { TBooking, TCreateBooking } from '@/schema/booking.schema';
import type { TBrand } from '@/schema/brand.schema';
import type { TStation } from '@/schema/station.schema';
import { Button } from '@/components/shadcn/ui/button';
import { Card } from '@/components/shadcn/ui/card';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/select';
import { cn } from '@/lib/utils';

// Utility functions
const ensureArray = <T,>(data: T[] | undefined | null): T[] => {
  return Array.isArray(data) ? data : [];
};

const statusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending_payment: 'Chờ thanh toán',
    pending: 'Chờ xử lý',
    held: 'Đang giữ chỗ',
    confirmed: 'Đã xác nhận',
    paid: 'Đã thanh toán',
    checked_out: 'Đã giao xe',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    expired: 'Hết hạn',
  };
  return statusMap[status] || status;
};

const mapStatusColor = (
  status: string
): 'default' | 'success' | 'warning' | 'destructive' | 'secondary' => {
  const colorMap: Record<
    string,
    'default' | 'success' | 'warning' | 'destructive' | 'secondary'
  > = {
    pending_payment: 'warning',
    pending: 'warning',
    held: 'secondary',
    confirmed: 'default',
    paid: 'success',
    checked_out: 'success',
    completed: 'success',
    cancelled: 'destructive',
    expired: 'destructive',
  };
  return colorMap[status] || 'default';
};

// Badge component
const BadgeStatus = ({
  variant,
  children,
}: {
  variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary';
  children: React.ReactNode;
}) => {
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800 border-blue-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    destructive: 'bg-red-100 text-red-800 border-red-200',
    secondary: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        variantClasses[variant]
      )}
    >
      {children}
    </span>
  );
};

// Loading component
const TableLoader = () => (
  <div className="flex items-center justify-center p-12">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Empty state component
const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center">
    <ClipboardList className="h-12 w-12 text-gray-300" />
    <p className="mt-4 text-sm text-gray-500">{message}</p>
  </div>
);

// Refresh button component
const RefreshButton = ({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading: boolean;
}) => (
  <Button variant="outline" size="sm" onClick={onClick} disabled={loading}>
    <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
  </Button>
);

// Form types
interface CreateBookingForm {
  renterName: string;
  phoneNumber: string;
  email: string;
  brandId: string;
  stationId: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  paymentMethod: string;
  pickupLocation?: string;
  promoCode?: string;
  notes?: string;
}

interface UpdateBookingStatusForm {
  id: string;
  status: string;
}

// Main component
export const StaffBookingManagement = () => {
  const { useBookingList, createBooking, updateBooking, deleteBooking } =
    useBooking();
  const { useBrandList } = useBrandHook();
  const { useStationList } = useStationHook();

  const bookingQuery = useBookingList();
  const brandQuery = useBrandList();
  const stationQuery = useStationList();

  const bookings = useMemo(
    () => ensureArray<TBooking>(bookingQuery.data?.data?.data),
    [bookingQuery.data?.data?.data]
  );

  const brands = useMemo(
    () => ensureArray<TBrand>(brandQuery.data?.data?.data),
    [brandQuery.data?.data?.data]
  );

  const stations = useMemo(
    () => ensureArray<TStation>(stationQuery.data?.data?.data),
    [stationQuery.data?.data?.data]
  );

  const [bookingFeedback, setBookingFeedback] = useState<string | null>(null);

  const bookingForm = useForm<CreateBookingForm>({
    defaultValues: {
      renterName: '',
      phoneNumber: '',
      email: '',
      brandId: '',
      stationId: '',
      pickupDate: new Date().toISOString().slice(0, 10),
      pickupTime: '09:00',
      returnDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      returnTime: '09:00',
      paymentMethod: 'online',
    },
  });

  const bookingStatusForm = useForm<UpdateBookingStatusForm>({
    defaultValues: { id: '', status: 'confirmed' },
  });

  const handleBookingSubmit = bookingForm.handleSubmit(async (values) => {
    try {
      setBookingFeedback(null);
      await createBooking.mutateAsync({
        renterName: values.renterName,
        phoneNumber: values.phoneNumber,
        email: values.email,
        brand: values.brandId,
        pickupStation: values.stationId,
        vehicle: values.brandId, // Use brandId as vehicle identifier
        pickupTimeExpected: `${values.pickupDate}T${values.pickupTime}:00.000Z`,
        rentalDays: 1, // Calculate based on dates
        paymentMethod: values.paymentMethod as TCreateBooking['paymentMethod'],
        agreedToPaymentTerms: true,
        agreedToDataSharing: true,
        surchargeAmount: 0,
        notes: values.notes,
      });
      setBookingFeedback('✅ Booking created successfully.');
      bookingForm.reset({
        renterName: '',
        phoneNumber: '',
        email: '',
        brandId: '',
        stationId: '',
        pickupDate: new Date().toISOString().slice(0, 10),
        pickupTime: '09:00',
        returnDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        returnTime: '09:00',
        paymentMethod: 'online',
      });
    } catch (error) {
      console.error('Failed to create booking', error);
      setBookingFeedback('❌ Failed to create booking.');
    }
  });

  const handleBookingStatusSubmit = bookingStatusForm.handleSubmit(
    async (values) => {
      try {
        setBookingFeedback(null);
        await updateBooking.mutateAsync({
          id: values.id,
          payload: { status: values.status as TBooking['status'] },
        });
        setBookingFeedback('✅ Booking status updated successfully.');
        bookingStatusForm.reset({ id: '', status: 'confirmed' });
      } catch (error) {
        console.error('Failed to update booking', error);
        setBookingFeedback('❌ Failed to update booking.');
      }
    }
  );

  const handleDeleteBooking = async (id: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Bạn có chắc chắn muốn xóa booking này?')) return;

    try {
      await deleteBooking.mutateAsync(id);
      setBookingFeedback('✅ Booking deleted successfully.');
    } catch (error) {
      console.error('Failed to delete booking', error);
      setBookingFeedback('❌ Failed to delete booking.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Booking Form */}
      <Card className="overflow-hidden">
        <div className="border-b bg-muted/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Plus className="h-5 w-5 text-primary" />
                Tạo Booking mới
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tạo booking cho khách hàng
              </p>
            </div>
            <RefreshButton
              onClick={() => bookingQuery.refetch()}
              loading={bookingQuery.isLoading}
            />
          </div>
        </div>
        <div className="p-6">
          <form
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            onSubmit={handleBookingSubmit}
          >
            <div className="space-y-2">
              <Label htmlFor="bookingRenterName">
                Tên khách hàng <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bookingRenterName"
                {...bookingForm.register('renterName')}
                placeholder="Nhập tên khách hàng"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bookingPhone">
                Số điện thoại <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bookingPhone"
                {...bookingForm.register('phoneNumber')}
                placeholder="0xxxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bookingEmail">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bookingEmail"
                type="email"
                {...bookingForm.register('email')}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bookingBrand">
                Thương hiệu <span className="text-destructive">*</span>
              </Label>
              <Select
                value={bookingForm.watch('brandId')}
                onValueChange={(value) => bookingForm.setValue('brandId', value)}
              >
                <SelectTrigger id="bookingBrand">
                  <SelectValue placeholder="Chọn thương hiệu" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand._id} value={brand._id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bookingStation">
                Trạm lấy xe <span className="text-destructive">*</span>
              </Label>
              <Select
                value={bookingForm.watch('stationId')}
                onValueChange={(value) =>
                  bookingForm.setValue('stationId', value)
                }
              >
                <SelectTrigger id="bookingStation">
                  <SelectValue placeholder="Chọn trạm" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station) => (
                    <SelectItem key={station._id} value={station._id}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bookingPayment">
                Phương thức thanh toán{' '}
                <span className="text-destructive">*</span>
              </Label>
              <Select
                value={bookingForm.watch('paymentMethod')}
                onValueChange={(value) =>
                  bookingForm.setValue('paymentMethod', value)
                }
              >
                <SelectTrigger id="bookingPayment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="cash">Tiền mặt</SelectItem>
                  <SelectItem value="bank_transfer">Chuyển khoản</SelectItem>
                  <SelectItem value="credit_card">Thẻ tín dụng</SelectItem>
                  <SelectItem value="e_wallet">Ví điện tử</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bookingPickupDate">
                Ngày lấy xe <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bookingPickupDate"
                type="date"
                {...bookingForm.register('pickupDate')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bookingPickupTime">
                Giờ lấy xe <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bookingPickupTime"
                type="time"
                {...bookingForm.register('pickupTime')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bookingReturnDate">
                Ngày trả xe <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bookingReturnDate"
                type="date"
                {...bookingForm.register('returnDate')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bookingReturnTime">
                Giờ trả xe <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bookingReturnTime"
                type="time"
                {...bookingForm.register('returnTime')}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bookingNotes">Ghi chú (Tùy chọn)</Label>
              <Input
                id="bookingNotes"
                {...bookingForm.register('notes')}
                placeholder="Ghi chú thêm"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={createBooking.isPending}
                className="w-full"
              >
                {createBooking.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo Booking
                  </>
                )}
              </Button>
            </div>
          </form>
          {bookingFeedback && (
            <div className="mt-4 rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
              {bookingFeedback}
            </div>
          )}
        </div>
      </Card>

      {/* Update Booking Status */}
      <Card className="overflow-hidden">
        <div className="border-b bg-muted/30 px-6 py-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Check className="h-5 w-5 text-primary" />
            Cập nhật trạng thái Booking
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Thay đổi trạng thái của booking
          </p>
        </div>
        <div className="p-6">
          <form
            className="grid gap-6 md:grid-cols-3"
            onSubmit={handleBookingStatusSubmit}
          >
            <div className="space-y-2">
              <Label htmlFor="bookingId">
                Booking ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bookingId"
                {...bookingStatusForm.register('id')}
                placeholder="Nhập booking ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bookingUpdateStatus">
                Trạng thái mới <span className="text-destructive">*</span>
              </Label>
              <Select
                value={bookingStatusForm.watch('status')}
                onValueChange={(value) =>
                  bookingStatusForm.setValue('status', value)
                }
              >
                <SelectTrigger id="bookingUpdateStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="held">Đang giữ chỗ</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="checked_out">Đã giao xe</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={updateBooking.isPending}
                className="w-full"
              >
                {updateBooking.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Cập nhật
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* All Bookings Table */}
      <Card className="overflow-hidden">
        <div className="border-b bg-muted/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <ClipboardList className="h-5 w-5 text-primary" />
                Tất cả Bookings
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Xem và quản lý tất cả bookings
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Tổng số:{' '}
              <span className="font-semibold">{bookings.length}</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {bookingQuery.isLoading ? (
            <TableLoader />
          ) : bookings.length === 0 ? (
            <EmptyState message="Không có booking nào." />
          ) : (
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Booking Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Thương hiệu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Trạm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((booking) => {
                  return (
                    <tr
                      key={booking._id}
                      className="transition-colors hover:bg-muted/50"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {booking.bookingCode || booking._id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {booking.renterName || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.phoneNumber}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {booking.brand?.name || 'TBD'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {booking.station?.name ||
                            booking.pickupStation?.name ||
                            'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="space-y-1">
                          <p className="text-xs">
                            Lấy: {booking.pickupDate} {booking.pickupTime}
                          </p>
                          <p className="text-xs">
                            Trả: {booking.returnDate} {booking.returnTime}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <BadgeStatus variant={mapStatusColor(booking.status)}>
                          {statusText(booking.status)}
                        </BadgeStatus>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteBooking(booking._id)}
                          disabled={deleteBooking.isPending}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

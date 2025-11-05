// ===== EXAMPLE: BookingsTab WITH PayOS Dialog Implementation =====
// This is a backup of the PayOS embedded dialog implementation
// User can restore this when ready to use PayOS popup in profile page

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
import BookingDetailDialog from '@/components/shared/BookingDetailDialog';
import { useAuthContext } from '@/contexts/auth-context';
import { useBooking } from '@/hooks/use-booking';
import { usePaymentHook } from '@/hooks/use-payment';
import { useRentalHook } from '@/hooks/use-rental';
import {
  BadgeStatus,
  fmt,
  mapStatusColor,
  money,
  statusText,
} from '@/lib/utils';
import type { TBooking } from '@/schema/booking.schema';
import type { TPayment } from '@/schema/payment.schema';
import type { TRental } from '@/schema/rental.schema';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Car,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { usePayOS } from 'payos-checkout';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const STATUS_FILTERS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING_APPROVAL', label: 'Chờ duyệt' },
  { value: 'WAITING_PAYMENT', label: 'Chờ thanh toán' },
  { value: 'PAID', label: 'Đã thanh toán' },
  { value: 'SUCCESS', label: 'Hoàn tất' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const WAITING_PAYMENT_SET = new Set([
  'WAITING_PAYMENT',
  'PENDING_PAYMENT',
  'WAITING_CHECKOUT',
]);

const CANCELLABLE_SET = new Set([
  'PENDING_APPROVAL',
  'WAITING_PAYMENT',
  'PENDING_PAYMENT',
]);

export default function BookingsTabWithPayOS() {
  const { currentUser, isVerified } = useAuthContext();
  const renterId = currentUser?._id ?? '';
  const isValidRenterId = /^[a-fA-F0-9]{24}$/.test(renterId);

  const { useBookingList, cancelBooking } = useBooking();
  const { usePaymentList, triggerTestCheckout, createPayOSCheckout } =
    usePaymentHook();
  const { useRentalList } = useRentalHook();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );

  // PayOS Dialog config
  const [payosConfig, setPayosConfig] = useState<{
    RETURN_URL: string;
    ELEMENT_ID: string;
    CHECKOUT_URL: string;
    embedded: boolean;
    onSuccess: (event: {
      id: string;
      code: string;
      orderCode: string;
      status: string;
    }) => void;
    onCancel: (event: {
      id: string;
      cancel: boolean;
      orderCode: string;
      status: string;
    }) => void;
    onExit: (event: { id: string }) => void;
  } | null>(null);

  const { open, exit } = usePayOS(
    payosConfig ?? {
      RETURN_URL: '',
      ELEMENT_ID: '',
      CHECKOUT_URL: '',
      embedded: true,
      onSuccess: (event) => {
        console.log('Default onSuccess', event);
      },
      onCancel: (event) => {
        console.log('Default onCancel', event);
      },
      onExit: (event) => {
        console.log('Default onExit', event);
      },
    }
  );

  const shouldFetch = isVerified && isValidRenterId;

  const bookingsQuery = useBookingList(shouldFetch ? { renterId } : undefined, {
    enabled: shouldFetch,
  });

  const paymentsQuery = usePaymentList(shouldFetch ? { renterId } : undefined, {
    enabled: shouldFetch,
  });

  const rentalsQuery = useRentalList(shouldFetch ? { renterId } : undefined, {
    enabled: shouldFetch,
  });

  const bookings = useMemo(
    () => (bookingsQuery.data?.data?.data ?? []) as TBooking[],
    [bookingsQuery.data?.data?.data]
  );

  const paymentsByBooking = useMemo(() => {
    const map = new Map<string, TPayment>();
    const list = paymentsQuery.data?.data?.data ?? [];
    for (const item of list as TPayment[]) {
      const bookingId =
        (item.bookingId as string) ?? (item.rental?.booking?._id as string);
      if (bookingId) {
        map.set(bookingId, item);
      }
    }
    return map;
  }, [paymentsQuery.data?.data?.data]);

  const rentalsByBooking = useMemo(() => {
    const map = new Map<string, TRental>();
    const list = rentalsQuery.data?.data?.data ?? [];
    for (const rental of list as TRental[]) {
      const bookingId = (rental.booking as TBooking | undefined)?._id;
      if (bookingId) {
        map.set(bookingId, rental);
      }
    }
    return map;
  }, [rentalsQuery.data?.data?.data]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.bookingCode
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        booking.brand?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const normalizedStatus = booking.status?.toUpperCase();
      const matchesStatus =
        statusFilter === 'ALL' ||
        normalizedStatus === statusFilter ||
        (statusFilter === 'WAITING_PAYMENT' &&
          WAITING_PAYMENT_SET.has(normalizedStatus ?? ''));

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  const isLoading =
    bookingsQuery.isLoading ||
    paymentsQuery.isLoading ||
    rentalsQuery.isLoading;

  const selectedBooking = selectedBookingId
    ? bookings.find((booking) => booking._id === selectedBookingId) ?? null
    : null;

  const relatedPayment = selectedBookingId
    ? paymentsByBooking.get(selectedBookingId) ?? undefined
    : undefined;
  const relatedRental = selectedBookingId
    ? rentalsByBooking.get(selectedBookingId) ?? undefined
    : undefined;

  if (!isVerified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>
            Hồ sơ của bạn chưa được xác minh. Vui lòng hoàn tất xác minh giấy tờ
            để bắt đầu đặt xe.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!isValidRenterId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>
            Tài khoản chưa sẵn sàng để lấy dữ liệu booking.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử đặt xe</CardTitle>
          <CardDescription>
            Theo dõi trạng thái booking, thanh toán và giao nhận xe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <Input
                placeholder="Tìm theo mã booking hoặc dòng xe…"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mb-2 h-6 w-6 animate-spin" />
              Đang tải dữ liệu booking…
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <p className="text-sm text-muted-foreground">
                Chưa có booking nào phù hợp bộ lọc.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredBookings.map((booking) => {
                const bookingId = booking._id;
                const normalizedStatus = booking.status?.toUpperCase();
                const payment = paymentsByBooking.get(bookingId);
                const rental = rentalsByBooking.get(bookingId);
                const pricing = booking.pricing ?? {
                  totalPayable: booking.totalPayable,
                  depositAmount: booking.depositAmount,
                };

                const isWaitingPayment = WAITING_PAYMENT_SET.has(
                  normalizedStatus ?? ''
                );
                const canCancel = CANCELLABLE_SET.has(normalizedStatus ?? '');

                return (
                  <div
                    key={bookingId}
                    className="rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <BadgeStatus variant={mapStatusColor(booking.status)}>
                            {statusText(booking.status)}
                          </BadgeStatus>
                          <span className="font-mono text-xs text-muted-foreground">
                            #{booking.bookingCode ?? booking._id}
                          </span>
                        </div>
                        <div className="mt-3 space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {booking.brand?.name} ({booking.brand?.code})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {fmt(
                                booking.pickupDateTime ?? booking.pickupDate
                              )}{' '}
                              →{' '}
                              {fmt(
                                booking.returnDateTime ?? booking.returnDate
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CreditCard className="h-4 w-4" />
                            <span>
                              Tổng phải thanh toán:{' '}
                              {money(pricing?.totalPayable)}
                            </span>
                          </div>
                          {rental && (
                            <div className="flex items-center gap-2 text-muted-foreground text-xs">
                              <ArrowRight className="h-3 w-3" />
                              Rental: {statusText(rental.status)} •{' '}
                              {fmt(rental.pickupTime)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-stretch gap-2 md:w-40">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedBookingId(bookingId)}
                        >
                          Chi tiết
                        </Button>
                        {isWaitingPayment && (
                          <>
                            <Button
                              className="bg-blue-600 hover:bg-blue-700"
                              disabled={createPayOSCheckout.isPending}
                              onClick={async () => {
                                try {
                                  const response =
                                    await createPayOSCheckout.mutateAsync({
                                      bookingId,
                                    });
                                  const checkoutUrl = (response as any)?.data
                                    ?.data?.checkoutData?.checkoutUrl;
                                  if (checkoutUrl) {
                                    // Open PayOS embedded dialog
                                    setPayosConfig({
                                      RETURN_URL:
                                        window.location.origin +
                                        '/profile?tab=bookings',
                                      ELEMENT_ID: 'payos-checkout',
                                      CHECKOUT_URL: checkoutUrl,
                                      embedded: true,
                                      onSuccess: (event: {
                                        id: string;
                                        code: string;
                                        orderCode: string;
                                        status: string;
                                      }) => {
                                        console.log('PayOS Success:', event);
                                        toast.success('Thanh toán thành công!');
                                        // Refetch booking to get updated status
                                        bookingsQuery.refetch();
                                        exit();
                                      },
                                      onCancel: (event: {
                                        id: string;
                                        cancel: boolean;
                                        orderCode: string;
                                        status: string;
                                      }) => {
                                        console.log('PayOS Cancel:', event);
                                        toast.warning('Bạn đã hủy thanh toán');
                                        exit();
                                      },
                                      onExit: (event: { id: string }) => {
                                        console.log('PayOS Exit:', event);
                                        setPayosConfig(null);
                                      },
                                    });
                                    // Open the dialog
                                    setTimeout(() => open(), 100);
                                  }
                                } catch (error) {
                                  console.error('PayOS checkout error:', error);
                                  toast.error('Không thể tạo link thanh toán');
                                }
                              }}
                            >
                              {createPayOSCheckout.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Đang tạo link...
                                </>
                              ) : (
                                <>
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Thanh toán ngay
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              disabled={triggerTestCheckout.isPending}
                              onClick={() =>
                                triggerTestCheckout.mutate({
                                  bookingId,
                                  method: 'bank_transfer',
                                })
                              }
                            >
                              {triggerTestCheckout.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                  Đang xử lý…
                                </>
                              ) : (
                                'Test checkout'
                              )}
                            </Button>
                          </>
                        )}
                        {canCancel && (
                          <Button
                            variant="ghost"
                            className="text-rose-600 hover:bg-rose-50"
                            onClick={() => {
                              if (
                                window.confirm(
                                  'Bạn chắc chắn muốn hủy booking này?'
                                )
                              ) {
                                cancelBooking.mutate(bookingId);
                              }
                            }}
                          >
                            Hủy booking
                          </Button>
                        )}
                        {payment && (
                          <p className="text-xs text-muted-foreground text-center">
                            Thanh toán: {statusText(payment.status)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <BookingDetailDialog
        booking={selectedBooking}
        rental={relatedRental}
        payment={relatedPayment}
        open={Boolean(selectedBooking)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBookingId(null);
          }
        }}
      />

      {/* PayOS Checkout Dialog Container */}
      <div id="payos-checkout" />
    </div>
  );
}

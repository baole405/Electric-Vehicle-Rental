import { useMemo } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { useBooking } from "@/hooks/use-booking";
import { usePaymentHook } from "@/hooks/use-payment";
import { useRentalHook } from "@/hooks/use-rental";
import { useUserDocument } from "@/hooks/use-user-document";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import {
  Calendar,
  DollarSign,
  Car,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Shield,
  TrendingUp,
} from "lucide-react";
import type { TBooking } from "@/schema/booking.schema";
import type { TUserDocument } from "@/schema/user-document.schema";
import { cn, money, statusText } from "@/lib/utils";

const WAITING_SET = new Set(["WAITING_PAYMENT", "PENDING_PAYMENT", "WAITING_CHECKOUT"]);
const COMPLETED_SET = new Set(["SUCCESS", "COMPLETED"]);

interface OverviewTabProps {
  onTabChange?: (tab: string) => void;
}

export default function OverviewTab({ onTabChange }: OverviewTabProps) {
  const { currentUser, isVerified } = useAuthContext();
  const renterId = currentUser?._id ?? "";
  const isValidRenterId = /^[a-fA-F0-9]{24}$/.test(renterId);

  const shouldFetch = isVerified && isValidRenterId;

  const { useBookingList } = useBooking();
  const { usePaymentList } = usePaymentHook();
  const { useRentalList } = useRentalHook();

  const bookingListQuery = useBookingList(
    shouldFetch ? { renterId } : undefined,
    { enabled: shouldFetch },
  );
  const paymentListQuery = usePaymentList(
    shouldFetch ? { renterId } : undefined,
    { enabled: shouldFetch },
  );
  const rentalListQuery = useRentalList(
    shouldFetch ? { renterId } : undefined,
    { enabled: shouldFetch },
  );

  const bookings = useMemo(
    () => (bookingListQuery.data?.data?.data ?? []) as TBooking[],
    [bookingListQuery.data?.data?.data],
  );

  const payments = useMemo(
    () => (paymentListQuery.data?.data?.data ?? []),
    [paymentListQuery.data?.data?.data],
  );

  const rentals = useMemo(
    () => (rentalListQuery.data?.data?.data ?? []),
    [rentalListQuery.data?.data?.data],
  );

  const bookingStats = useMemo(() => {
    const total = bookings.length;
    const waiting = bookings.filter((booking) => WAITING_SET.has(booking.status?.toUpperCase() ?? "")).length;
    const active = bookings.filter((booking) => {
      const status = booking.status?.toUpperCase() ?? "";
      return !COMPLETED_SET.has(status) && status !== "CANCELLED" && status !== "EXPIRED";
    }).length;
    const completed = bookings.filter((booking) => COMPLETED_SET.has(booking.status?.toUpperCase() ?? "")).length;
    const totalSpent = bookings
      .filter((booking) => COMPLETED_SET.has(booking.status?.toUpperCase() ?? "") || booking.status?.toUpperCase() === "PAID")
      .reduce((acc, booking) => acc + (booking.pricing?.totalPayable ?? booking.totalPayable ?? 0), 0);

    return { total, waiting, active, completed, totalSpent };
  }, [bookings]);

  const documentsQuery = useUserDocument(currentUser?._id);
  const documents = useMemo(
    () => (documentsQuery.data?.data?.data ?? []) as TUserDocument[],
    [documentsQuery.data?.data?.data],
  );

  const documentStats = useMemo(() => {
    const normalized = documents.map((doc) => doc.status?.toUpperCase() ?? "");
    const verified = normalized.filter((status) => status === "VERIFIED" || status === "APPROVED").length;
    const pending = normalized.filter((status) => status === "PENDING" || status === "UNDER_REVIEW").length;
    const rejected = normalized.filter((status) => status === "REJECTED").length;
    return { verified, pending, rejected, total: documents.length };
  }, [documents]);

  const statsCards = [
    {
      title: "Tổng booking",
      value: bookingStats.total,
      icon: Calendar,
      trend: bookingStats.waiting ? `Chờ thanh toán: ${bookingStats.waiting}` : undefined,
    },
    {
      title: "Đang hoạt động",
      value: bookingStats.active,
      icon: Clock,
      trend: bookings.length ? `${Math.round((bookingStats.active / bookings.length) * 100)}%` : undefined,
    },
    {
      title: "Hoàn tất",
      value: bookingStats.completed,
      icon: CheckCircle2,
      trend: bookings.length ? `${Math.round((bookingStats.completed / bookings.length) * 100)}%` : undefined,
    },
    {
      title: "Tổng chi tiêu",
      value: money(bookingStats.totalSpent),
      icon: DollarSign,
      trend: payments.length ? `${payments.length} giao dịch` : undefined,
    },
  ];

  const verificationNotice = !isVerified
    ? "Hồ sơ của bạn chưa được xác minh. Vui lòng hoàn tất tài liệu để sử dụng đầy đủ các tính năng."
    : null;

  return (
    <div className="space-y-6">
      {verificationNotice && (
        <div className="flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>{verificationNotice}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onTabChange?.("documents")}>
              Hoàn tất hồ sơ
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((card) => (
          <Card key={card.title} className="border border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{card.value}</div>
              {card.trend && <p className="text-xs text-muted-foreground mt-1">{card.trend}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking gần đây</CardTitle>
          <CardDescription>Ba booking mới nhất của bạn và trạng thái hiện tại.</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">Bạn chưa có booking nào.</p>
          ) : (
            <div className="grid gap-3">
              {bookings
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.createdAt ?? "").getTime() - new Date(a.createdAt ?? "").getTime(),
                )
                .slice(0, 3)
                .map((booking) => {
                  const pricing = booking.pricing ?? {
                    totalPayable: booking.totalPayable,
                    depositAmount: booking.depositAmount,
                  };
                  return (
                    <div
                      key={booking._id}
                      className="flex flex-col gap-3 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            className={cn(
                              "uppercase font-semibold",
                              {
                                green: "bg-emerald-100 text-emerald-800",
                                amber: "bg-amber-100 text-amber-800",
                                red: "bg-rose-100 text-rose-800",
                                gray: "bg-slate-100 text-slate-800",
                              }[mapStatusColor(booking.status)],
                            )}
                          >
                            {statusText(booking.status)}
                          </Badge>
                          <span className="font-mono text-xs text-muted-foreground">
                            #{booking.bookingCode ?? booking._id}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          {booking.brand?.name} • {fmt(booking.pickupDateTime ?? booking.pickupDate)}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Tổng phải trả:{" "}
                        <span className="font-medium text-foreground">{money(pricing?.totalPayable)}</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => onTabChange?.("bookings")}>
                        Xem chi tiết
                      </Button>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tài liệu xác minh</CardTitle>
            <CardDescription>Trạng thái hồ sơ & giấy tờ đã gửi.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-lg border bg-emerald-50 p-3">
                <div className="text-xs text-muted-foreground">Đã duyệt</div>
                <div className="text-lg font-semibold text-emerald-700">{documentStats.verified}</div>
              </div>
              <div className="rounded-lg border bg-amber-50 p-3">
                <div className="text-xs text-muted-foreground">Chờ duyệt</div>
                <div className="text-lg font-semibold text-amber-700">{documentStats.pending}</div>
              </div>
              <div className="rounded-lg border bg-rose-50 p-3">
                <div className="text-xs text-muted-foreground">Bị từ chối</div>
                <div className="text-lg font-semibold text-rose-700">{documentStats.rejected}</div>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => onTabChange?.("documents")}>
              Quản lý giấy tờ
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rental & thanh toán</CardTitle>
            <CardDescription>Thông tin nhanh về giao nhận và giao dịch gần đây.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span>
                Rentals đang theo dõi:{" "}
                <strong>
                  {rentals.filter(
                    (rental) => rental.status?.toUpperCase() !== "COMPLETED",
                  ).length}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>
                Giao dịch gần đây: <strong>{payments.length}</strong>
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={() => onTabChange?.("payments")}>
              Xem lịch sử thanh toán
            </Button>
          </CardContent>
        </Card>
      </div>

      {bookingsQuery.isLoading ||
      paymentListQuery.isLoading ||
      rentalListQuery.isLoading ||
      documentsQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          Đang đồng bộ dữ liệu mới nhất…
        </div>
      ) : null}
    </div>
  );
}

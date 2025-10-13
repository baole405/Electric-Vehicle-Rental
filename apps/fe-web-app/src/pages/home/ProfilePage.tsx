import HeaderMain from "@/components/header/header-main";
import { Card } from "@/components/shadcn/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/shadcn/ui/tabs";
import { useUserHook } from "@/hooks/use-user";
import { useBooking } from "@/hooks/use-booking";
import { useRentalHook } from "@/hooks/use-rental";
import { usePaymentHook } from "@/hooks/use-payment";
import type { TUser } from "@/schema/user.schema";
import { fmt, money, mapStatusColor, BadgeStatus, statusText } from "@/lib/utils";
import {
  CarFront,
  CreditCard,
  Clock,
  MapPin,
  CalendarClock as Time,
  AlertCircle,
} from "lucide-react";

/* ────────────────────────────── MAIN PAGE ────────────────────────────── */
export default function ProfilePage() {
  const currentUserId = "68e718afaf76367c856de76d"; // sau này lấy từ token
  const { useUserById } = useUserHook();
  const { data, isLoading, isError } = useUserById(currentUserId);
  const user: TUser | null = data?.data?.data ?? null;

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500">
        <AlertCircle className="w-8 h-8 mb-3" />
        <p>Không thể tải thông tin người dùng. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderMain title="Thông tin cá nhân" />
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột trái: Thông tin người dùng */}
        <div className="lg:col-span-4 space-y-6">
          <UserProfileCard user={user} isLoading={isLoading} />

          {/* Quick Stats */}
          <Card className="p-4 rounded-2xl shadow-sm bg-white">
            <h3 className="font-semibold mb-3">Tổng quan nhanh</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <StatCard color="emerald" value="12" label="Lượt thuê" />
              <StatCard color="amber" value="2" label="Đang xử lý" />
              <StatCard color="indigo" value="4.9" label="Đánh giá" />
            </div>
          </Card>
        </div>

        {/* Cột phải: Lịch sử */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 rounded-2xl shadow-sm bg-white">
            <h3 className="text-lg font-semibold mb-4">Lịch sử</h3>
            <ProfileHistoryTabs userId={currentUserId} />
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────── PROFILE CARD ────────────────────────────── */
function UserProfileCard({ user, isLoading }: { user: TUser | null; isLoading?: boolean }) {
  const roleStyle: Record<TUser["role"], string> = {
    renter: "bg-sky-50 text-sky-700 border-sky-200",
    staff: "bg-amber-50 text-amber-700 border-amber-200",
    admin: "bg-rose-50 text-rose-700 border-rose-200",
  };
  const statusStyle: Record<TUser["status"], string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    inactive: "bg-gray-50 text-gray-600 border-gray-200",
    suspended: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <Card className="p-6 rounded-2xl shadow-sm bg-white">
      {/* Avatar + Name */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
          <CarFront className="w-8 h-8 text-indigo-600" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold truncate">
            {isLoading ? "Đang tải..." : user?.fullName}
          </h2>
          <p className="text-sm text-gray-500 truncate">{isLoading ? "—" : user?.email}</p>
        </div>
      </div>

      {/* Badges */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className={`px-2 py-1 rounded-md border text-xs ${user ? roleStyle[user.role] : ""}`}
        >
          {isLoading ? "—" : user?.role.toUpperCase()}
        </span>
        <span
          className={`px-2 py-1 rounded-md border text-xs ${user ? statusStyle[user.status] : ""}`}
        >
          {isLoading ? "—" : user?.status}
        </span>
      </div>

      {/* Info */}
      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <p>
          <strong>Email:</strong> {user?.email ?? "—"}
        </p>
        <p>
          <strong>SĐT:</strong> {user?.phone ?? "Chưa cập nhật"}
        </p>
        <p>
          <strong>Tạo ngày:</strong>{" "}
          {user?.createdAt ? new Date(user.createdAt).toLocaleString("vi-VN") : "—"}
        </p>
        <p>
          <strong>Cập nhật:</strong>{" "}
          {user?.updatedAt ? new Date(user.updatedAt).toLocaleString("vi-VN") : "—"}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <button className="flex-1 py-2 px-3 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all">
          Chỉnh sửa
        </button>
        <button className="flex-1 py-2 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-all">
          Đổi mật khẩu
        </button>
      </div>
    </Card>
  );
}

/* ────────────────────────────── HISTORY TABS ────────────────────────────── */
function ProfileHistoryTabs({ userId }: { userId: string }) {
  const { useBookingList } = useBooking();
  const { useRentalList } = useRentalHook();
  const { usePaymentList } = usePaymentHook();

  const { data: bookingRes, isLoading: bookLoading, isError: bookError } = useBookingList();
  const { data: rentalRes, isLoading: rentLoading, isError: rentError } = useRentalList();
  const { data: paymentRes, isLoading: payLoading, isError: payError } = usePaymentList();

  const bookings = bookingRes?.data?.data ?? [];
  const rentals = rentalRes?.data?.data ?? [];
  const payments = paymentRes?.data?.data ?? [];

  const myBookings = bookings.filter((b: any) => b?.renter?._id === userId);
  const myRentals = rentals.filter((r: any) => r?.renter?._id === userId);
  const myPayments = payments.filter((p: any) => p?.rental?.renter?._id === userId);

  return (
    <Tabs defaultValue="bookings" className="w-full">
      {/* Tabs List */}
      <TabsList className="grid grid-cols-3 w-full mb-6 rounded-xl bg-gray-100 p-1">
        <TabsTrigger value="bookings" className="flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200">
          <Clock className="w-4 h-4" /> Đặt xe
        </TabsTrigger>
        <TabsTrigger value="rentals" className="flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200">
          <CarFront className="w-4 h-4" /> Thuê xe
        </TabsTrigger>
        <TabsTrigger value="payments" className="flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200">
          <CreditCard className="w-4 h-4" /> Thanh toán
        </TabsTrigger>
      </TabsList>

      {/* Tabs Content */}
      <TabsContent value="bookings">
        <HistoryPanel isLoading={bookLoading} isError={bookError} emptyText="Không có lịch sử đặt xe.">
          {myBookings.map((b: any) => (
            <HistoryCard
              key={b._id}
              title={`#${b._id.slice(-6)} — ${statusText(b.status)}`}
              status={b.status}
              fields={[
                { icon: <Time size={14} />, label: `Dự kiến: ${fmt(b.pickupTimeExpected)}` },
                { icon: <MapPin size={14} />, label: `Trạm: ${b.pickupStation?.name ?? "—"}` },
              ]}
            />
          ))}
        </HistoryPanel>
      </TabsContent>

      <TabsContent value="rentals">
        <HistoryPanel isLoading={rentLoading} isError={rentError} emptyText="Không có lịch sử thuê xe.">
          {myRentals.map((r: any) => (
            <HistoryCard
              key={r._id}
              title={`${r.vehicle?.model ?? "Xe"} — #${r._id.slice(-6)}`}
              status={r.status}
              fields={[
                { icon: <Time size={14} />, label: `Nhận: ${fmt(r.pickupTime)}` },
                { icon: <Time size={14} />, label: `Trả: ${fmt(r.returnTime)}` },
                { icon: <MapPin size={14} />, label: `Trạm nhận: ${r.pickupStation?.name ?? "—"}` },
                { icon: <MapPin size={14} />, label: `Trạm trả: ${r.returnStation?.name ?? "—"}` },
              ]}
              note={`Odo: ${r.odoStart ?? "—"} → ${r.odoEnd ?? "—"} · ${r.conditionNotes ?? ""}`}
            />
          ))}
        </HistoryPanel>
      </TabsContent>

      <TabsContent value="payments">
        <HistoryPanel isLoading={payLoading} isError={payError} emptyText="Không có lịch sử thanh toán.">
          {myPayments.map((p: any) => (
            <HistoryCard
              key={p._id}
              title={`${p.method.toUpperCase()} · ${p.txnRef ?? "—"}`}
              status={p.status}
              fields={[
                { label: `Tổng tiền: ${money(p.totalAmount)}` },
                { label: `Gốc: ${money(p.baseAmount)} · Phụ phí: ${money(p.surchargeAmount)}` },
                { label: `Thuê xe: #${p.rental?._id?.slice(-6) ?? "—"}` },
              ]}
              note={`Tạo: ${fmt(p.createdAt)} · Cập nhật: ${fmt(p.updatedAt)}`}
            />
          ))}
        </HistoryPanel>
      </TabsContent>
    </Tabs>
  );
}

/* ──────────────── Reusable Components ──────────────── */
function HistoryPanel({ isLoading, isError, emptyText, children }: any) {
  if (isLoading)
    return <div className="text-gray-500 text-center p-4 animate-pulse">Đang tải dữ liệu...</div>;
  if (isError)
    return <div className="text-red-500 text-center p-4">Lỗi tải dữ liệu. Vui lòng thử lại sau.</div>;
  if (!children || (Array.isArray(children) && children.length === 0))
    return <div className="text-gray-500 text-center p-4">{emptyText}</div>;
  return <div className="space-y-4">{children}</div>;
}

function HistoryCard({ title, status, fields, note }: any) {
  return (
    <div className="p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-gray-800">{title}</div>
        <BadgeStatus variant={mapStatusColor(status)}>{statusText(status)}</BadgeStatus>
      </div>
      <div className="text-sm text-gray-600 grid sm:grid-cols-2 gap-2">
        {fields.map((f: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            {f.icon}
            <span>{f.label}</span>
          </div>
        ))}
      </div>
      {note && <div className="mt-2 text-xs text-gray-500 italic">{note}</div>}
    </div>
  );
}

function StatCard({ color, value, label }: any) {
  return (
    <div className={`rounded-lg bg-${color}-50 text-${color}-700 py-3 px-2`}>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}

import { useState, useMemo, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import {
  Search,
  Eye,
  RefreshCw,
  Filter,
  Calendar,
  User,
  Car,
  DollarSign,
  CheckCircle2,
  Wallet,
  ClipboardCheck,
  Key,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Badge } from "@/components/shadcn/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
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
import { useBooking } from "@/hooks/use-booking";
import { useVehicleHook } from "@/hooks/use-vehicle";
import { usePaymentHook } from "@/hooks/use-payment";
import { useRentalHook } from "@/hooks/use-rental";
import { useHandoverHook } from "@/hooks/use-handover";
import type { TBooking } from "@/schema/booking.schema";
import type { TVehicle } from "@/schema/vehicle.schema";
import type { TRental } from "@/schema/rental.schema";
import type { TPayment } from "@/schema/payment.schema";
import { Label } from "@/components/shadcn/ui/label";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Status color mapping for badges
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  pending_payment: "bg-yellow-100 text-yellow-800 border-yellow-200",
  held: "bg-blue-100 text-blue-800 border-blue-200",
  confirmed: "bg-indigo-100 text-indigo-800 border-indigo-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  checked_out: "bg-teal-100 text-teal-800 border-teal-200",
  completed: "bg-gray-100 text-gray-800 border-gray-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  expired: "bg-orange-100 text-orange-800 border-orange-200",
};

// Vietnamese labels for booking statuses
const STATUS_LABELS: Record<string, string> = {
  pending: "Ch? x? ly",
  pending_payment: "Ch? thanh to�n",
  held: "Dang gi? ch?",
  confirmed: "Da x�c nh?n",
  paid: "Da thanh to�n",
  checked_out: "Da giao xe",
  completed: "Ho�n th�nh",
  cancelled: "Da h?y",
  expired: "H?t h?n",
};

// Helper: Get next valid statuses based on workflow
const getNextStatuses = (currentStatus: string): string[] => {
  const workflow: Record<string, string[]> = {
    pending: ["pending_payment", "confirmed", "cancelled"],
    pending_payment: ["confirmed", "cancelled"],
    held: ["confirmed", "cancelled"],
    confirmed: ["paid", "cancelled"],
    paid: ["checked_out", "cancelled"],
    checked_out: ["completed"],
    completed: [],
    cancelled: [],
    expired: [],
  };
  return workflow[currentStatus] || [];
};


export function StaffBookingManagement() {
  const { useBookingList, confirmBooking } = useBooking();
  const { useVehicleList } = useVehicleHook();
  const { useRentalList, createRental } = useRentalHook();
  const { createPayment } = usePaymentHook();
  const handoverHook = useHandoverHook();
  const { createHandover } = handoverHook;

  // Fetch data
  const bookingQuery = useBookingList();
  const vehicleQuery = useVehicleList();
  const rentalQuery = useRentalList();

  // Extract data from queries
  const bookings = useMemo(
    () => (Array.isArray(bookingQuery.data?.data?.data) ? bookingQuery.data.data.data : []),
    [bookingQuery.data]
  );
  const vehicles = useMemo(
    () => (Array.isArray(vehicleQuery.data?.data?.data) ? vehicleQuery.data.data.data : []),
    [vehicleQuery.data]
  );
  const rentals = useMemo(
    () => (Array.isArray(rentalQuery.data?.data?.data) ? (rentalQuery.data.data.data as TRental[]) : []),
    [rentalQuery.data]
  );
  const rentalsByBooking = useMemo(() => {
    const map = new Map<string, TRental>();
    rentals.forEach((rental) => {
      const bookingId = rental.booking?._id;
      if (bookingId) {
        map.set(bookingId, rental);
      }
    });
    return map;
  }, [rentals]);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<TBooking | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [assignVehicleDialogOpen, setAssignVehicleDialogOpen] = useState(false);
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState<TBooking | null>(null);
  const [rentalBooking, setRentalBooking] = useState<TBooking | null>(null);
  const [handoverContext, setHandoverContext] = useState<{ rental: TRental; type: "pickup" | "return" } | null>(null);
  const paymentDialogOpen = Boolean(paymentBooking);
  const rentalDialogOpen = Boolean(rentalBooking);
  const handoverDialogOpen = handoverContext !== null;

  const refetchAll = async () => {
    await Promise.all([
      bookingQuery.refetch(),
      vehicleQuery.refetch(),
      rentalQuery.refetch(),
    ]);
  };

  // Filter bookings based on search and status
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        searchTerm === "" ||
        booking.renterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phoneNumber?.includes(searchTerm) ||
        booking.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.bookingCode?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  // Get available vehicles for the selected booking's brand
  const availableVehiclesForBrand = useMemo(() => {
    if (!selectedBooking?.brand?._id) return [];
    return vehicles.filter((v) => {
      // Handle case where vehicle.brand can be string (brandId) or object
      const vehicleBrandId = typeof v.brand === "string" ? v.brand : v.brand?._id;
      return vehicleBrandId === selectedBooking.brand._id && v.status === "available";
    });
  }, [selectedBooking, vehicles]);

  // Event handlers
  const handleViewDetail = (booking: TBooking) => {
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
  };

  const handleAssignVehicle = (booking: TBooking) => {
    setSelectedBooking(booking);
    setAssignVehicleDialogOpen(true);
  };

  const handleUpdateStatus = (booking: TBooking) => {
    setSelectedBooking(booking);
    setUpdateStatusDialogOpen(true);
  };

  const handleConfirmBooking = async (booking: TBooking) => {
    try {
      await confirmBooking.mutateAsync(booking._id);
      toast.success("Booking đã được xác nhận.");
      await refetchAll();
      if (booking.paymentMethod !== "online") {
        setPaymentBooking({ ...booking, status: "confirmed" });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xác nhận booking.");
    }
  };

  const handleOpenPaymentDialog = (booking: TBooking) => {
    setPaymentBooking(booking);
  };

  const handleOpenRentalDialog = (booking: TBooking) => {
    setRentalBooking(booking);
  };

  const handleOpenHandoverDialog = (rental: TRental, type: "pickup" | "return") => {
    setHandoverContext({ rental, type });
  };

  const closePaymentDialog = () => setPaymentBooking(null);
  const closeRentalDialog = () => setRentalBooking(null);
  const closeHandoverDialog = () => setHandoverContext(null);

  const handleRefresh = () => {
    void refetchAll();
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Quản lý Bookings</CardTitle>
          <CardDescription>Xem và quản lý đơn đặt xe của khách hàng</CardDescription>
        </CardHeader>
      </Card>

      <Card className="border-none shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Tìm theo tên, SĐT, email, mã booking..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="pending_payment">Chờ thanh toán</SelectItem>
                    <SelectItem value="held">Đang giữ chỗ</SelectItem>
                    <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                    <SelectItem value="paid">Đã thanh toán</SelectItem>
                    <SelectItem value="checked_out">Đã giao xe</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={bookingQuery.isLoading}>
                <RefreshCw className={cn("h-4 w-4 mr-2", bookingQuery.isLoading && "animate-spin")} />
                Làm mới
              </Button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-lg bg-blue-50 p-3 border border-blue-100">
              <div className="text-xs text-blue-600 font-medium">Tổng số</div>
              <div className="text-2xl font-bold text-blue-900">{bookings.length}</div>
            </div>
            <div className="rounded-lg bg-yellow-50 p-3 border border-yellow-100">
              <div className="text-xs text-yellow-600 font-medium">Chờ xử lý</div>
              <div className="text-2xl font-bold text-yellow-900">{bookings.filter((b) => b.status === "pending_payment").length}</div>
            </div>
            <div className="rounded-lg bg-green-50 p-3 border border-green-100">
              <div className="text-xs text-green-600 font-medium">Đã xác nhận</div>
              <div className="text-2xl font-bold text-green-900">{bookings.filter((b) => b.status === "confirmed" || b.status === "paid").length}</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
              <div className="text-xs text-gray-600 font-medium">Hoàn thành</div>
              <div className="text-2xl font-bold text-gray-900">{bookings.filter((b) => b.status === "completed").length}</div>
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
                    <TableHead>Mã Booking</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Liên hệ</TableHead>
                    <TableHead>Dòng xe</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => {
                    const rental = rentalsByBooking.get(booking._id);
                    const showManualPayment = booking.paymentMethod !== "online";
                    const isTerminalStatus =
                      booking.status === "completed" ||
                      booking.status === "cancelled" ||
                      booking.status === "expired";

                    return (
                      <TableRow key={booking._id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm">{booking.bookingCode || booking._id.slice(-6)}</TableCell>
                      <TableCell><div className="font-medium">{booking.renterName}</div></TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          <div>{booking.phoneNumber}</div>
                          <div className="text-xs">{booking.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {booking.brand?.imageUrl && <img src={booking.brand.imageUrl} alt={booking.brand.name} className="h-8 w-8 rounded object-cover" />}
                          <div>
                            <div className="font-medium">{booking.brand?.name}</div>
                            <div className="text-xs text-gray-500">{booking.brand?.code}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{booking.pickupDate}</div>
                          <div className="text-xs text-gray-500">{booking.rentalDays} ngày</div>
                        </div>
                      </TableCell>
                      <TableCell><div className="font-semibold text-blue-600">{booking.totalPayable?.toLocaleString("vi-VN")} ₫</div></TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("font-medium", STATUS_COLORS[booking.status])}>{STATUS_LABELS[booking.status]}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetail(booking)}><Eye className="h-4 w-4 mr-1" />Xem</Button>
                          {!isTerminalStatus && (
                            <>
                              {booking.status === "pending" && (
                                <Button variant="default" size="sm" onClick={() => handleConfirmBooking(booking)}>
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Xác nhận
                                </Button>
                              )}
                              {booking.status === "confirmed" && showManualPayment && (
                                <Button variant="outline" size="sm" onClick={() => handleOpenPaymentDialog(booking)}>
                                  <Wallet className="h-4 w-4 mr-1" />
                                  Thu tiền
                                </Button>
                              )}
                              {!rental && booking.status !== "pending" && booking.status !== "pending_payment" && booking.status !== "cancelled" && (
                                <Button variant="default" size="sm" onClick={() => handleOpenRentalDialog(booking)}>
                                  <ClipboardCheck className="h-4 w-4 mr-1" />
                                  Tạo rental
                                </Button>
                              )}
                              {rental && (
                                <>
                                  <Button variant="outline" size="sm" onClick={() => handleOpenHandoverDialog(rental, "pickup")}>
                                    <Key className="h-4 w-4 mr-1" />
                                    Bàn giao nhận xe
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleOpenHandoverDialog(rental, "return")}>
                                    <RefreshCcw className="h-4 w-4 mr-1" />
                                    Bàn giao trả xe
                                  </Button>
                                </>
                              )}
                              {!booking.assignedVehicle && (
                                <Button variant="outline" size="sm" onClick={() => handleAssignVehicle(booking)}>
                                  <Car className="h-4 w-4 mr-1" />
                                  G�n xe
                                </Button>
                              )}
                              <Button variant="default" size="sm" onClick={() => handleUpdateStatus(booking)}>C?p nh?t</Button>
                            </>
                          )}
                        </div>
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

      <BookingDetailDialog
        booking={selectedBooking}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />

      <PaymentDialog
        booking={paymentBooking}
        open={paymentDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closePaymentDialog();
          }
        }}
        createPayment={createPayment}
        onSuccess={() => {
          toast.success("Đã ghi nhận thanh toán.");
          closePaymentDialog();
          void refetchAll();
        }}
      />

      <CreateRentalDialog
        booking={rentalBooking}
        open={rentalDialogOpen}
        vehicles={vehicles}
        onOpenChange={(open) => {
          if (!open) {
            closeRentalDialog();
          }
        }}
        createRental={createRental}
        onSuccess={() => {
          toast.success("Đã tạo rental mới.");
          closeRentalDialog();
          void refetchAll();
        }}
      />

      <HandoverDialog
        context={handoverContext}
        open={handoverDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeHandoverDialog();
          }
        }}
        createHandover={createHandover}
        onSuccess={(message) => {
          if (message) {
            toast.success(message);
          }
          closeHandoverDialog();
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

// ============================================================================
// PAYMENT DIALOG - Handle direct payment collection
// ============================================================================

type PaymentDialogProps = {
  booking: TBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createPayment: ReturnType<typeof usePaymentHook>["createPayment"];
  onSuccess: () => void;
};

function PaymentDialog({ booking, open, onOpenChange, createPayment, onSuccess }: PaymentDialogProps) {
  const [method, setMethod] = useState<string>(booking?.paymentMethod ?? "cash");
  const [amount, setAmount] = useState<number>(booking?.totalPayable ?? 0);
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    setMethod(booking?.paymentMethod ?? "cash");
    setAmount(booking?.totalPayable ?? 0);
    setNotes("");
  }, [booking]);

  if (!booking) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!amount || amount <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ.");
      return;
    }

    try {
      await createPayment.mutateAsync(
        {
          booking: booking._id,
          method,
          totalAmount: amount,
          notes: notes || undefined,
        } as unknown as Partial<TPayment>
      );
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể ghi nhận thanh toán.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ghi nhận thanh toán</DialogTitle>
          <DialogDescription>Booking: {booking.bookingCode || booking._id}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Phương thức</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Tiền mặt</SelectItem>
                <SelectItem value="bank_transfer">Chuyển khoản</SelectItem>
                <SelectItem value="credit_card">Thẻ</SelectItem>
                <SelectItem value="e_wallet">Ví điện tử</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Số tiền</Label>
            <Input
              type="number"
              min={0}
              step="1000"
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ghi chú thêm (tuỳ chọn)"
            />
          </div>
          <DialogFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createPayment.isPending}>
              Huỷ
            </Button>
            <Button type="submit" disabled={createPayment.isPending}>
              {createPayment.isPending ? "Đang lưu..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// CREATE RENTAL DIALOG - Create rental record from booking
// ============================================================================

type CreateRentalDialogProps = {
  booking: TBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: TVehicle[];
  createRental: ReturnType<typeof useRentalHook>["createRental"];
  onSuccess: () => void;
};

function CreateRentalDialog({
  booking,
  open,
  onOpenChange,
  vehicles,
  createRental,
  onSuccess,
}: CreateRentalDialogProps) {
  const [vehicleId, setVehicleId] = useState<string>("");
  const [stationId, setStationId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    setVehicleId(booking?.assignedVehicle?._id ?? "");
    const pickupStation = booking?.pickupStation?._id ?? booking?.station?._id ?? "";
    setStationId(pickupStation);
    setNotes("");
  }, [booking]);

  if (!booking) {
    return null;
  }

  const vehiclesForBrand = vehicles.filter((vehicle) => {
    const brandId = typeof vehicle.brand === "string" ? vehicle.brand : vehicle.brand?._id;
    return brandId === booking.brand?._id && vehicle.status === "available";
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!vehicleId) {
      toast.error("Vui lòng chọn xe để tạo rental.");
      return;
    }
    if (!stationId) {
      toast.error("Vui lòng nhập mã trạm bàn giao.");
      return;
    }

    try {
      await createRental.mutateAsync(
        {
          booking: booking._id,
          vehicle: vehicleId,
          pickupStation: stationId,
          notes: notes || undefined,
        } as unknown as Partial<TRental>
      );
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tạo rental.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo rental</DialogTitle>
          <DialogDescription>Booking: {booking.bookingCode || booking._id}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Chọn xe</Label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn xe" />
              </SelectTrigger>
              <SelectContent>
                {vehiclesForBrand.map((vehicle) => (
                  <SelectItem key={vehicle._id} value={vehicle._id}>
                    {vehicle.model} · {vehicle.plateNo ?? vehicle.vin}
                  </SelectItem>
                ))}
                {vehiclesForBrand.length === 0 && <SelectItem value="" disabled>Không có xe khả dụng</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Mã trạm bàn giao</Label>
            <Input value={stationId} onChange={(event) => setStationId(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ghi chú thêm (tuỳ chọn)" />
          </div>
          <DialogFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createRental.isPending}>
              Huỷ
            </Button>
            <Button type="submit" disabled={createRental.isPending || vehiclesForBrand.length === 0}>
              {createRental.isPending ? "Đang tạo..." : "Tạo rental"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// HANDOVER DIALOG - Pickup / Return handover records
// ============================================================================

type HandoverDialogProps = {
  context: { rental: TRental; type: "pickup" | "return" } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createHandover: ReturnType<typeof useHandoverHook>["createHandover"];
  onSuccess: (message?: string) => void;
};

function HandoverDialog({ context, open, onOpenChange, createHandover, onSuccess }: HandoverDialogProps) {
  const [stationId, setStationId] = useState<string>("");
  const [odo, setOdo] = useState<string>("");
  const [battery, setBattery] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!context) {
      setStationId("");
      setOdo("");
      setBattery("");
      setNotes("");
      setFiles([]);
      return;
    }
    const defaultStation =
      context.type === "pickup"
        ? context.rental.pickupStation?._id ?? ""
        : context.rental.returnStation?._id ?? context.rental.pickupStation?._id ?? "";
    setStationId(defaultStation);
    setOdo("");
    setBattery("");
    setNotes("");
    setFiles([]);
  }, [context]);

  if (!context) {
    return null;
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    setFiles(Array.from(event.target.files));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stationId) {
      toast.error("Vui lòng nhập mã trạm.");
      return;
    }
    try {
      await createHandover.mutateAsync({
        rental: context.rental._id,
        stationId,
        type: context.type,
        odoReading: odo ? Number(odo) : undefined,
        batteryPercent: battery ? Number(battery) : undefined,
        notes: notes || undefined,
        photos: files.length > 0 ? files : undefined,
      });
      const successMessage =
        context.type === "pickup" ? "Đã ghi nhận bàn giao nhận xe." : "Đã ghi nhận bàn giao trả xe.";
      onSuccess(successMessage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tạo biên bản bàn giao.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {context.type === "pickup" ? "Bàn giao nhận xe" : "Bàn giao trả xe"}
          </DialogTitle>
          <DialogDescription>Rental: {context.rental._id}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Mã trạm</Label>
            <Input value={stationId} onChange={(event) => setStationId(event.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Số km (ODO)</Label>
              <Input
                type="number"
                min={0}
                value={odo}
                onChange={(event) => setOdo(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>% pin</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={battery}
                onChange={(event) => setBattery(event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Ảnh minh chứng (tối đa 6)</Label>
            <Input type="file" accept="image/*" multiple onChange={handleFileChange} />
          </div>
          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ghi chú thêm (tuỳ chọn)" />
          </div>
          <DialogFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createHandover.isPending}>
              Huỷ
            </Button>
            <Button type="submit" disabled={createHandover.isPending}>
              {createHandover.isPending ? "Đang lưu..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// BOOKING DETAIL DIALOG - Read-only view of booking information
// ============================================================================

function BookingDetailDialog({
  booking,
  open,
  onOpenChange,
}: {
  booking: TBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết Booking</DialogTitle>
          <DialogDescription>Mã: {booking.bookingCode || booking._id}</DialogDescription>
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
                  {booking.assignedVehicle.plateNo || booking.assignedVehicle.vin}
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
                  {booking.pickupDate ? new Date(booking.pickupDate).toLocaleDateString('vi-VN') : 'N/A'} - {booking.pickupTime || '10:00'}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Ngày trả xe</div>
                <div className="font-medium">
                  {booking.returnDate ? new Date(booking.returnDate).toLocaleDateString('vi-VN') : 'N/A'} - {booking.returnTime || '10:00'}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-600">Số ngày thuê</div>
                <div className="font-medium text-lg">{booking.rentalDays || 0} ngày</div>
              </div>
            </div>
          </div>

          {/* Station & Location */}
          <div className="rounded-lg bg-purple-50 p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Địa điểm
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-gray-600">Trạm nhận xe</div>
                <div className="font-medium">
                  {booking.pickupStation?.name || booking.station?.name || 'Chưa xác định'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Mã trạm: {booking.pickupStation?.code || booking.station?.code || 'N/A'}
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
                  {(booking.basePrice || booking.totalRentalFee || 0).toLocaleString("vi-VN")}đ
                </span>
              </div>
              {booking.additionalFees && booking.additionalFees > 0 && (
                <div className="flex justify-between">
                  <span className="text-amber-600">Phí phụ thu</span>
                  <span className="font-medium text-amber-600">
                    {booking.additionalFees.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Tổng tiền</span>
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

          {/* Payment & Status */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Thanh toán & Trạng thái
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-600">Phương thức</div>
                <div className="font-medium capitalize">
                  {booking.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' :
                    booking.paymentMethod === 'cash' ? 'Tiền mặt' :
                      booking.paymentMethod === 'online' ? 'Online' : booking.paymentMethod || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Trạng thái</div>
                <div className={`font-medium px-2 py-1 rounded text-xs inline-block ${booking.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'held' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                  }`}>
                  {booking.status === 'pending_payment' ? 'Chờ thanh toán' :
                    booking.status === 'held' ? 'Đang giữ chỗ' :
                      booking.status === 'confirmed' ? 'Đã xác nhận' :
                        booking.status === 'paid' ? 'Đã thanh toán' :
                          booking.status === 'checked_out' ? 'Đã nhận xe' :
                            booking.status === 'completed' ? 'Hoàn thành' :
                              booking.status === 'cancelled' ? 'Đã hủy' :
                                booking.status === 'expired' ? 'Hết hạn' : booking.status || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="rounded-lg bg-blue-50 p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Ghi chú
              </h3>
              <div className="text-sm bg-white p-3 rounded border">
                {booking.notes}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// ASSIGN VEHICLE DIALOG - Assign specific vehicle to booking
// ============================================================================

function AssignVehicleDialog({
  booking,
  availableVehicles,
  open,
  onOpenChange,
  onSuccess,
}: {
  booking: TBooking | null;
  availableVehicles: TVehicle[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { assignVehicle } = useBooking();
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  const handleAssign = async () => {
    if (!selectedVehicleId || !booking) return;

    try {
      await assignVehicle.mutateAsync({
        bookingId: booking._id,
        data: { vehicleId: selectedVehicleId },
      });

      toast.success("Đã gán xe cho booking!");

      setSelectedVehicleId("");
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể gán xe");
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gán xe cho Booking</DialogTitle>
          <DialogDescription>
            Chọn xe cụ thể để gán cho {booking.bookingCode}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-3">
            <div className="text-sm text-gray-600">Dòng xe</div>
            <div className="font-semibold">{booking.brand?.name}</div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Chọn xe ({availableVehicles.length})
            </label>
            <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
              <SelectTrigger>
                <SelectValue placeholder="-- Chọn xe --" />
              </SelectTrigger>
              <SelectContent>
                {availableVehicles.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Không có xe khả dụng
                  </div>
                ) : (
                  availableVehicles.map((v) => (
                    <SelectItem key={v._id} value={v._id}>
                      {v.plateNo || v.vin} - {v.model}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={assignVehicle.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedVehicleId || assignVehicle.isPending}
            >
              {assignVehicle.isPending ? "Đang gán..." : "Gán xe"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// UPDATE STATUS DIALOG - Update booking status with workflow validation
// ============================================================================

function UpdateBookingStatusDialog({
  booking,
  open,
  onOpenChange,
  onSuccess,
}: {
  booking: TBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { updateBookingStatus } = useBooking();
  const [newStatus, setNewStatus] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");

  const nextStatuses = booking ? getNextStatuses(booking.status) : [];

  const handleUpdate = async () => {
    if (!newStatus || !booking) return;

    // Validate cancellation reason
    if (newStatus === "cancelled" && !cancellationReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy");
      return;
    }

    try {
      await updateBookingStatus.mutateAsync({
        bookingId: booking._id,
        data: {
          status: newStatus as TBooking["status"],
          ...(newStatus === "cancelled" && { cancellationReason }),
        },
      });

      toast.success(`Đã cập nhật sang "${STATUS_LABELS[newStatus]}"`);

      setNewStatus("");
      setCancellationReason("");
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật");
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái</DialogTitle>
          <DialogDescription>{booking.bookingCode}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="text-sm text-gray-600 mb-1">Hiện tại</div>
            <Badge
              variant="outline"
              className={cn("font-medium", STATUS_COLORS[booking.status])}
            >
              {STATUS_LABELS[booking.status]}
            </Badge>
          </div>

          {nextStatuses.length > 0 ? (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Trạng thái mới</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Chọn --" />
                  </SelectTrigger>
                  <SelectContent>
                    {nextStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {newStatus === "cancelled" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Lý do hủy <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Nhập lý do..."
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg bg-yellow-50 p-3 border">
              <p className="text-sm text-yellow-800">
                Không thể cập nhật từ {STATUS_LABELS[booking.status]}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateBookingStatus.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!newStatus || nextStatuses.length === 0 || updateBookingStatus.isPending}
            >
              {updateBookingStatus.isPending ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

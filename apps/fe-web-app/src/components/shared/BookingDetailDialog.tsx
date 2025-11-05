import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shadcn/ui/dialog";
import { Badge } from "@/components/shadcn/ui/badge";
import { Separator } from "@/components/shadcn/ui/separator";
import {
  Calendar,
  Car,
  User,
  MapPin,
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
  CreditCard,
} from "lucide-react";
import type { TBooking } from "@/schema/booking.schema";
import type { TRental } from "@/schema/rental.schema";
import type { TPayment } from "@/schema/payment.schema";
import { BadgeStatus, fmt, money, statusText, mapStatusColor } from "@/lib/utils";

interface BookingDetailDialogProps {
  booking: TBooking | null;
  rental?: TRental | null;
  payment?: TPayment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StatusIcon = ({ status }: { status: string }) => {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case "SUCCESS":
    case "COMPLETED":
    case "PAID":
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    case "WAITING_PAYMENT":
    case "WAITING_CHECKOUT":
    case "PENDING_APPROVAL":
    case "PENDING_PAYMENT":
      return <Clock className="h-4 w-4 text-amber-500" />;
    case "CANCELLED":
    case "REJECTED":
      return <FileText className="h-4 w-4 text-rose-600" />;
    default:
      return <Clock className="h-4 w-4 text-slate-500" />;
  }
};

export default function BookingDetailDialog({
  booking,
  rental,
  payment,
  open,
  onOpenChange,
}: BookingDetailDialogProps) {
  if (!booking) {
    return null;
  }

  const pricing = booking.pricing ?? {
    basePrice: booking.basePrice,
    depositAmount: booking.depositAmount,
    surchargeAmount: booking.additionalFees,
    totalRentalFee: booking.totalRentalFee,
    totalPayable: booking.totalPayable,
  };

  const paymentSummary =
    payment ??
    (booking.payment && typeof booking.payment === "object" ? (booking.payment as TPayment) : undefined);

  const relatedRental =
    rental ??
    (booking.rental && typeof booking.rental === "object" ? (booking.rental as TRental) : undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-semibold">Booking details</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Code: <span className="font-mono font-semibold">{booking.bookingCode ?? booking._id}</span>
              </p>
            </div>
            <BadgeStatus variant={mapStatusColor(booking.status)}>
              {statusText(booking.status)}
            </BadgeStatus>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <section className="rounded-lg border p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <User className="h-4 w-4" /> Renter
            </h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2 text-sm">
              <div>
                <div className="text-muted-foreground">Full name</div>
                <div className="font-medium">{booking.renterName}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Phone</div>
                <div className="font-medium">{booking.phoneNumber}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-muted-foreground">Email</div>
                <div className="font-medium break-words">{booking.email}</div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <Car className="h-4 w-4" /> Vehicle & brand
            </h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2 text-sm">
              <div>
                <div className="text-muted-foreground">Brand</div>
                <div className="font-medium">
                  {booking.brand?.name} ({booking.brand?.code})
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Assigned vehicle</div>
                <div className="font-medium">
                  {booking.assignedVehicle?.model
                    ? `${booking.assignedVehicle.model} • ${booking.assignedVehicle.plateNo ?? ""}`
                    : "Not assigned"}
                </div>
              </div>
              {relatedRental?.vehicle?.vin && (
                <div>
                  <div className="text-muted-foreground">VIN</div>
                  <div className="font-medium font-mono">{relatedRental.vehicle.vin}</div>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-lg border p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <Calendar className="h-4 w-4" /> Schedule
            </h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2 text-sm">
              <div>
                <div className="text-muted-foreground">Pickup</div>
                <div className="font-medium">{fmt(booking.pickupDateTime ?? booking.pickupDate)}</div>
                {booking.pickupStation && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{booking.pickupStation.name}</span>
                  </div>
                )}
              </div>
              <div>
                <div className="text-muted-foreground">Return</div>
                <div className="font-medium">{fmt(booking.returnDateTime ?? booking.returnDate)}</div>
                {booking.pickupLocation && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{booking.pickupLocation}</span>
                  </div>
                )}
              </div>
              {booking.reservationExpiresAt && (
                <div className="md:col-span-2">
                  <div className="text-muted-foreground">Reservation hold</div>
                  <div className="font-medium">{fmt(booking.reservationExpiresAt)}</div>
                </div>
              )}
              {booking.paymentDueAt && (
                <div className="md:col-span-2">
                  <div className="text-muted-foreground">Payment due</div>
                  <div className="font-medium">{fmt(booking.paymentDueAt)}</div>
                </div>
              )}
            </div>
          </section>

  <section className="rounded-lg border p-4">
    <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
      <DollarSign className="h-4 w-4" /> Pricing
    </h3>
    <div className="mt-3 grid gap-2 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Base rental</span>
        <span className="font-medium">{money(pricing?.basePrice)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Surcharge</span>
        <span className="font-medium">{money(pricing?.surchargeAmount ?? pricing?.additionalFees)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Deposit</span>
        <span className="font-medium">{money(pricing?.depositAmount)}</span>
      </div>
      <Separator />
      <div className="flex items-center justify-between text-base font-semibold">
        <span>Total payable</span>
        <span>{money(pricing?.totalPayable ?? pricing?.totalRentalFee)}</span>
      </div>
    </div>
  </section>

          {paymentSummary && (
            <section className="rounded-lg border p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                <CreditCard className="h-4 w-4" /> Payment
              </h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <BadgeStatus variant={mapStatusColor(paymentSummary.status)}>
                    {statusText(paymentSummary.status)}
                  </BadgeStatus>
                </div>
                <div>
                  <div className="text-muted-foreground">Method</div>
                  <div className="font-medium uppercase">{paymentSummary.method}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Reference</div>
                  <div className="font-mono text-xs">{paymentSummary.txnRef ?? "N/A"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total</div>
                  <div className="font-medium">{money(paymentSummary.totalAmount)}</div>
                </div>
              </div>
            </section>
          )}

          <section className="rounded-lg border p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <FileText className="h-4 w-4" /> Status history
            </h3>
            <div className="mt-3 space-y-3">
              {(booking.statusHistory ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No history recorded yet.</p>
              ) : (
                booking.statusHistory?.map((entry, index) => (
                  <div key={`${entry.status}-${index}`} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                    <StatusIcon status={entry.status} />
                    <div>
                      <div className="font-medium">{statusText(entry.status)}</div>
                      <div className="text-xs text-muted-foreground">{fmt(entry.updatedAt ?? entry.createdAt)}</div>
                      {entry.note && <div className="mt-1 text-sm">{entry.note}</div>}
                      {entry.actor?.fullName && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Actor: {entry.actor.fullName} {entry.actor.role ? `(${entry.actor.role})` : ""}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {relatedRental && (
            <section className="rounded-lg border p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                <MapPin className="h-4 w-4" /> Rental
              </h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <BadgeStatus variant={mapStatusColor(relatedRental.status)}>
                    {statusText(relatedRental.status)}
                  </BadgeStatus>
                </div>
                <div>
                  <div className="text-muted-foreground">Pickup time</div>
                  <div className="font-medium">{fmt(relatedRental.pickupTime)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Return time</div>
                  <div className="font-medium">{fmt(relatedRental.returnTime ?? undefined)}</div>
                </div>
                {relatedRental.pickupStation?.name && (
                  <div>
                    <div className="text-muted-foreground">Pickup station</div>
                    <div className="font-medium">{relatedRental.pickupStation.name}</div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

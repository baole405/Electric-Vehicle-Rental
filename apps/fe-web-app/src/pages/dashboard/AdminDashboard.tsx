import { type ReactNode, useMemo, useState } from "react";
import DashboardLayout from "@/layouts/dashboard/dashboard-layout";
import { Card } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn/ui/tabs";
import { useAuthContext } from "@/contexts/auth-context";
import { useVehicleHook } from "@/hooks/use-vehicle";
import { useBooking } from "@/hooks/use-booking";
import { useRentalHook } from "@/hooks/use-rental";
import { useStationHook } from "@/hooks/use-station";
import { useHandoverHook } from "@/hooks/use-handover";
import { BadgeStatus, fmt, mapStatusColor, statusText } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/routes/route.constants";
import type { TVehicle } from "@/schema/vehicle.schema";
import type { TBooking } from "@/schema/booking.schema";
import type { TRental } from "@/schema/rental.schema";
import { Loader2, Upload } from "lucide-react";

type HandoverFormState = {
  rentalId: string;
  stationId: string;
  type: "pickup" | "return";
  odoReading: string;
  batteryPercent: string;
  notes: string;
  photos: File[];
};

const defaultHandoverState: HandoverFormState = {
  rentalId: "",
  stationId: "",
  type: "pickup",
  odoReading: "",
  batteryPercent: "",
  notes: "",
  photos: [],
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();
  const { useVehicleList, updateVehicle } = useVehicleHook();
  const { useBookingList } = useBooking();
  const { useRentalList } = useRentalHook();
  const { useStationList } = useStationHook();
  const handover = useHandoverHook();

  const vehicleQuery = useVehicleList();
  const bookingQuery = useBookingList();
  const rentalQuery = useRentalList();
  const stationQuery = useStationList();

  const [handoverForm, setHandoverForm] = useState<HandoverFormState>(defaultHandoverState);
  const [handoverError, setHandoverError] = useState<string | null>(null);
  const [handoverSuccess, setHandoverSuccess] = useState<string | null>(null);

  const isStaff = Boolean(currentUser && (currentUser.role === "staff" || currentUser.role === "admin"));

  const vehicles = useMemo(
    () => ((vehicleQuery.data?.data?.data ?? []) as TVehicle[]),
    [vehicleQuery.data?.data?.data],
  );
  const bookings = useMemo(
    () => ((bookingQuery.data?.data?.data ?? []) as TBooking[]),
    [bookingQuery.data?.data?.data],
  );
  const rentals = useMemo(
    () => ((rentalQuery.data?.data?.data ?? []) as TRental[]),
    [rentalQuery.data?.data?.data],
  );
  const stations = useMemo(
    () =>
      ((stationQuery.data?.data?.data ?? []) as Array<{ _id: string; name: string }>),
    [stationQuery.data?.data?.data],
  );

  const stats = useMemo(
    () => ({
      totalVehicles: vehicles.length,
      availableVehicles: vehicles.filter((vehicle) => vehicle.status === "available").length,
      activeRentals: rentals.filter((rental) => rental.status === "ongoing").length,
      pendingBookings: bookings.filter((booking) => booking.status === "pending").length,
    }),
    [bookings, rentals, vehicles],
  );

  if (!isStaff) {
    return (
      <DashboardLayout title="Operations">
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <Card className="max-w-md space-y-4 p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900">Staff access required</h2>
            <p className="text-sm text-gray-600">
              This dashboard is only available to staff accounts. Contact an administrator if you need access.
            </p>
            <Button className="w-full" onClick={() => navigate(ROUTES.ROOT)}>
              Back to home
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  };

  const handleHandoverInput = <Key extends keyof HandoverFormState>(
    key: Key,
    value: HandoverFormState[Key],
  ) => {
    setHandoverError(null);
    setHandoverForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleHandoverSubmit = () => {
    if (!handoverForm.rentalId || !handoverForm.stationId) {
      setHandoverError("Rental and station are required.");
      return;
    }

    const payload = {
      rental: handoverForm.rentalId,
      stationId: handoverForm.stationId,
      type: handoverForm.type,
      odoReading: handoverForm.odoReading ? Number(handoverForm.odoReading) : undefined,
      batteryPercent: handoverForm.batteryPercent
        ? Number(handoverForm.batteryPercent)
        : undefined,
      notes: handoverForm.notes || undefined,
      photos: handoverForm.photos,
    };

    handover.createHandover.mutate(payload, {
      onSuccess: () => {
        setHandoverSuccess("Handover logged successfully.");
        setHandoverForm(defaultHandoverState);
      },
      onError: (error) => {
        console.error("Failed to log handover", error);
        setHandoverError("Failed to log handover. Please try again.");
      },
    });
  };

  return (
    <DashboardLayout title="Operations dashboard">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-6">
        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="Vehicles" value={stats.totalVehicles} meta={`${stats.availableVehicles} available`} />
          <StatCard label="Active rentals" value={stats.activeRentals} meta="Ongoing handovers" />
          <StatCard label="Pending bookings" value={stats.pendingBookings} meta="Awaiting approval" />
          <StatCard
            label="Last sync"
            value={new Date().toLocaleTimeString()}
            meta="Manual refresh"
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  vehicleQuery.refetch();
                  bookingQuery.refetch();
                  rentalQuery.refetch();
                }}
              >
                Refresh
              </Button>
            }
          />
        </section>

        <Tabs defaultValue="bookings">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="handovers">Handovers</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-4 pt-6">
            <Card className="overflow-hidden">
              <div className="border-b px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900">Bookings</h3>
                <p className="text-sm text-gray-600">
                  Track incoming bookings and contact renters before creating a handover.
                </p>
              </div>
              <div className="divide-y">
                {bookingQuery.isLoading ? (
                  <TableLoader />
                ) : bookings.length === 0 ? (
                  <EmptyState message="No bookings at the moment." />
                ) : (
                  bookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{booking.vehicle?.model ?? "Vehicle"}</p>
                        <p className="text-gray-600">
                          Pickup {fmt(booking.pickupTimeExpected)} -{" "}
                          {booking.pickupStation?.name ?? "Station unknown"}
                        </p>
                        <p className="text-gray-500">
                          Renter: {booking.renter?.fullName ?? "Unknown"}
                        </p>
                      </div>
                      <BadgeStatus variant={mapStatusColor(booking.status)}>
                        {statusText(booking.status)}
                      </BadgeStatus>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-4 pt-6">
            <Card className="overflow-hidden">
              <div className="border-b px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900">Fleet status</h3>
                <p className="text-sm text-gray-600">
                  Update vehicle availability after maintenance or returns.
                </p>
              </div>
              <div className="divide-y">
                {vehicleQuery.isLoading ? (
                  <TableLoader />
                ) : vehicles.length === 0 ? (
                  <EmptyState message="No vehicles loaded." />
                ) : (
                  vehicles.map((vehicle) => (
                    <div
                      key={vehicle._id}
                      className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{vehicle.model}</p>
                        <p className="text-gray-600">
                          Plate {vehicle.plateNo ?? "N/A"} - Battery {vehicle.batteryPercent ?? 0}%
                        </p>
                        <p className="text-gray-500">Station: {vehicle.stationId ?? "Unassigned"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{vehicle.status}</Badge>
                        <Select
                          value={vehicle.status}
                          onValueChange={(value) =>
                            handleVehicleStatusChange(vehicle._id, value as TVehicle["status"])
                          }
                          disabled={updateVehicle.isPending}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="rented">Rented</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="handovers" className="space-y-4 pt-6">
            <Card className="space-y-4 p-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Log vehicle handover</h3>
                <p className="text-sm text-gray-600">
                  Record pickup or return to keep rental history accurate.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="handoverType">Handover type</Label>
                  <Select
                    value={handoverForm.type}
                    onValueChange={(value) =>
                      handleHandoverInput("type", value as HandoverFormState["type"])
                    }
                  >
                    <SelectTrigger id="handoverType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pickup">Pickup</SelectItem>
                      <SelectItem value="return">Return</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rentalId">Rental ID</Label>
                  <Input
                    id="rentalId"
                    placeholder="Rental identifier"
                    value={handoverForm.rentalId}
                    onChange={(event) => handleHandoverInput("rentalId", event.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="handoverStation">Station</Label>
                  <Select
                    value={handoverForm.stationId}
                    onValueChange={(value) => handleHandoverInput("stationId", value)}
                  >
                    <SelectTrigger id="handoverStation">
                      <SelectValue placeholder="Choose station" />
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
                  <Label htmlFor="handoverOdo">Odometer (km)</Label>
                  <Input
                    id="handoverOdo"
                    type="number"
                    value={handoverForm.odoReading}
                    onChange={(event) => handleHandoverInput("odoReading", event.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="handoverBattery">Battery (%)</Label>
                  <Input
                    id="handoverBattery"
                    type="number"
                    value={handoverForm.batteryPercent}
                    onChange={(event) => handleHandoverInput("batteryPercent", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="handoverNotes">Notes</Label>
                  <Input
                    id="handoverNotes"
                    placeholder="Condition notes"
                    value={handoverForm.notes}
                    onChange={(event) => handleHandoverInput("notes", event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Photos (optional)</Label>
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600 hover:border-gray-400">
                  <Upload className="h-5 w-5" />
                  <span>Add up to 6 photos</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) =>
                      handleHandoverInput(
                        "photos",
                        Array.from(event.target.files ?? []).slice(0, 6),
                      )
                    }
                  />
                </label>
                {handoverForm.photos.length > 0 && (
                  <p className="text-xs text-gray-500">
                    {handoverForm.photos.length} file(s) attached.
                  </p>
                )}
              </div>

              {handoverError && <p className="text-sm text-red-500">{handoverError}</p>}
              {handoverSuccess && <p className="text-sm text-emerald-600">{handoverSuccess}</p>}

              <Button
                className="w-full"
                onClick={handleHandoverSubmit}
                disabled={handover.createHandover.isPending}
              >
                {handover.createHandover.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  "Log handover"
                )}
              </Button>
            </Card>

            <Card className="overflow-hidden">
              <div className="border-b px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900">Current rentals</h3>
              </div>
              <div className="divide-y">
                {rentalQuery.isLoading ? (
                  <TableLoader />
                ) : rentals.length === 0 ? (
                  <EmptyState message="No rentals in progress." />
                ) : (
                  rentals.map((rental) => (
                    <div
                      key={rental._id}
                      className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {rental.vehicle?.model ?? "Vehicle"} - {rental.renter?.fullName ?? "Renter"}
                        </p>
                        <p className="text-gray-600">
                          {fmt(rental.pickupTime)} - {fmt(rental.returnTime ?? undefined)}
                        </p>
                        <p className="text-gray-500">
                          Stations: {rental.pickupStation?.name ?? "-"} - {rental.returnStation?.name ?? "-"}
                          {rental.returnStation?.name ?? "-"}
                        </p>
                      </div>
                      <BadgeStatus variant={mapStatusColor(rental.status)}>
                        {statusText(rental.status)}
                      </BadgeStatus>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({
  label,
  value,
  meta,
  action,
}: {
  label: string;
  value: number | string;
  meta?: string;
  action?: ReactNode;
}) => (
  <Card className="flex flex-col gap-2 p-6">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-2xl font-semibold text-gray-900">{value}</div>
    {meta && <div className="text-xs text-gray-500">{meta}</div>}
    {action}
  </Card>
);

const TableLoader = () => (
  <div className="flex items-center justify-center py-12 text-gray-600">
    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
    Loading data...
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center py-12 text-sm text-gray-500">{message}</div>
);

export default AdminDashboard;







import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarClock, CheckCircle2, Loader2, MapPin, ShieldAlert } from "lucide-react";
import HeaderMain from "@/components/header/header-main";
import { Card } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { useStationHook } from "@/hooks/use-station";
import { useVehicleHook } from "@/hooks/use-vehicle";
import { useBooking } from "@/hooks/use-booking";
import { useAuthContext } from "@/contexts/auth-context";
import { useUserDocument } from "@/hooks/use-user-document";
import type { TCreateBooking } from "@/schema/booking.schema";
import { ROUTES } from "@/routes/route.constants";

type BookingFormState = {
  pickupStationId: string;
  pickupTimeExpected: string;
};

const defaultForm: BookingFormState = {
  pickupStationId: "",
  pickupTimeExpected: "",
};

const CreateBookingPage = () => {
  const { id: vehicleId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();
  const { useStationList } = useStationHook();
  const { useVehicleById } = useVehicleHook();
  const { createBooking } = useBooking();

  const [form, setForm] = useState<BookingFormState>(defaultForm);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const stationsQuery = useStationList();
  const vehicleQuery = useVehicleById(vehicleId ?? "");
  const documentQuery = useUserDocument(currentUser?._id);

  const documentStatus = useMemo(() => {
    const document = (documentQuery.data?.data?.data ?? [])[0];
    return document?.status ?? "pending";
  }, [documentQuery.data]);

  const isBookingAllowed = currentUser && documentStatus === "verified";

  const handleChange = (field: keyof BookingFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = () => {
    if (!currentUser) {
      setError("Please register and verify your account before booking.");
      return;
    }
    if (!isBookingAllowed) {
      setError("Your documents are not verified yet. Booking will unlock after approval.");
      return;
    }
    if (!form.pickupStationId || !form.pickupTimeExpected) {
      setError("Pickup station and time are required.");
      return;
    }
    if (!vehicleId) {
      setError("Vehicle information is missing.");
      return;
    }

    const payload: TCreateBooking = {
      renter: currentUser._id,
      pickupStation: form.pickupStationId,
      vehicle: vehicleId,
      pickupTimeExpected: new Date(form.pickupTimeExpected).toISOString(),
      status: "pending",
    };

    createBooking.mutate(payload, {
      onSuccess: () => {
        setSuccessMessage("Booking request submitted. Our staff will confirm shortly.");
      },
      onError: (mutationError) => {
        console.error("Failed to create booking", mutationError);
        setError("Could not create booking. Please try again.");
      },
    });
  };

  if (!vehicleId) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <HeaderMain title="Book vehicle" />
        <div className="flex flex-1 items-center justify-center px-4">
          <Card className="max-w-md p-6 text-center">
            <ShieldAlert className="mx-auto h-10 w-10 text-red-500" />
            <h2 className="mt-4 text-lg font-semibold text-gray-900">Vehicle not found</h2>
            <p className="mt-2 text-sm text-gray-600">
              We could not identify which vehicle you want to book. Please go back to the fleet and
              select a vehicle again.
            </p>
            <Button className="mt-4 w-full" onClick={() => navigate(ROUTES.VEHICLE)}>
              Browse vehicles
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <HeaderMain title="Book vehicle" />
        <div className="flex flex-1 items-center justify-center px-4">
          <Card className="max-w-md p-6 text-center">
            <ShieldAlert className="mx-auto h-10 w-10 text-amber-500" />
            <h2 className="mt-4 text-lg font-semibold text-gray-900">Registration required</h2>
            <p className="mt-2 text-sm text-gray-600">
              Create an account and upload your documents before you can request a booking.
            </p>
            <Button className="mt-4 w-full" onClick={() => navigate(ROUTES.REGISTER)}>
              Register now
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const stations = (stationsQuery.data?.data?.data ?? []) as Array<{
    _id: string;
    name: string;
    address?: string;
  }>;
  const vehicle = vehicleQuery.data?.data?.data;

  return (
    <div className="min-h-screen bg-white pb-12">
      <HeaderMain title="Book vehicle" />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-8 lg:grid-cols-[2fr,1fr]">
        <Card className="space-y-6 p-6 border border-gray-100 shadow-lg rounded-xl">
          <div>
            <h1 className="text-2xl font-semibold text-[#000000]">Booking request</h1>
            <p className="mt-1 text-sm text-[#00CC66]">
              Complete the details below. Booking is confirmed after staff review.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Renter name</Label>
              <Input value={currentUser.fullName} disabled />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={currentUser.email} disabled />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Pickup station</Label>
              <Select
                value={form.pickupStationId}
                onValueChange={(value) => handleChange("pickupStationId", value)}
                disabled={stationsQuery.isLoading || stationsQuery.isError}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a station" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station) => (
                    <SelectItem key={station._id} value={station._id}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {stationsQuery.isError && (
                <p className="mt-1 text-sm text-red-500">Failed to load stations.</p>
              )}
            </div>
            <div>
              <Label>Pickup time (expected)</Label>
              <Input
                type="datetime-local"
                value={form.pickupTimeExpected}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(event) => handleChange("pickupTimeExpected", event.target.value)}
                className="focus:border-[#00CC66] focus:ring-[#00CC66]"
              />
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-[#00CC66]/30 bg-[#00CC66]/5 p-4 text-sm text-[#000000]/80">
            <p>
              Document status:{" "}
              <span className="font-semibold text-[#00CC66]">{documentStatus.replace("_", " ")}</span>. Booking is
              enabled when status is <strong className="text-[#00CC66]">verified</strong>.
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {successMessage && (
            <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              <span>{successMessage}</span>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={createBooking.isPending || !isBookingAllowed}
            className="w-full bg-[#00CC66] hover:bg-[#00b85c] text-white font-medium transition-colors"
          >
            {createBooking.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating booking...
              </>
            ) : (
              "Submit booking request"
            )}
          </Button>
        </Card>

        <Card className="flex flex-col gap-5 p-6 border border-[#00CC66]/20 shadow-lg rounded-xl">
          {vehicleQuery.isLoading ? (
            <div className="flex items-center justify-center py-10 text-gray-600">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading vehicle...
            </div>
          ) : vehicle ? (
            <>
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-lg bg-[#00CC66]/10" />
                <div>
                  <h2 className="text-lg font-semibold text-[#000000]">{vehicle.model}</h2>
                  <p className="text-sm text-[#00CC66]">{vehicle.plateNo}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-[#000000]/80">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#00CC66]" />
                  <span>
                    Station:{" "}
                    {form.pickupStationId
                      ? stations.find((station) => station._id === form.pickupStationId)?.name ??
                        "Selected station"
                      : vehicle.stationId ?? "Choose a station"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-[#00CC66]" />
                  <span>
                    Pickup:{" "}
                    {form.pickupTimeExpected
                      ? new Date(form.pickupTimeExpected).toLocaleString()
                      : "Select time"}
                  </span>
                </div>
              </div>
              <div className="space-y-2 rounded-lg border border-[#00CC66]/20 bg-[#00CC66]/5 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#000000]/80">Daily rate</span>
                  <span className="font-medium text-[#000000]">
                    {vehicle.dailyRate ? `${vehicle.dailyRate.toLocaleString()} VND` : "TBD"}
                  </span>
                </div>
                <div className="flex justify-between text-[#00CC66]">
                  <span>Deposit estimate</span>
                  <span>{vehicle.deposit ? `${vehicle.deposit.toLocaleString()} VND` : "Contact staff"}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-gray-600">
              <ShieldAlert className="h-6 w-6 text-amber-500" />
              <span>Vehicle information could not be loaded.</span>
              <Button variant="outline" onClick={() => navigate(ROUTES.VEHICLE)}>
                Back to fleet
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CreateBookingPage;
